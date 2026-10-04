/**
 * Descarga segura de URLs públicas: bloquea IPs privadas (SSRF) y limita tiempo,
 * tamaño y redirecciones. Cada salto de redirección se vuelve a validar.
 *
 * Limitación conocida: se resuelve el DNS para validar y después fetch vuelve a
 * resolverlo (ventana de DNS rebinding). En un hosting sin red interna ni servicio
 * de metadatos accesible, como Vercel, el riesgo es muy bajo.
 */
import { promises as dns } from "node:dns";
import net from "node:net";

const UA = "Mozilla/5.0 (compatible; OdisasLabAudit/1.0)";
const MAX_BYTES = 4 * 1024 * 1024;

export class AuditError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7));
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
}

async function assertPublicHost(hostname: string) {
  if (process.env.ALLOW_PRIVATE_HOSTS === "1") return; // solo para pruebas locales
  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(hostname, { all: true });
  } catch {
    throw new AuditError("dns", "El dominio no existe o no responde.");
  }
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) {
    throw new AuditError("invalid_url", "La dirección no apunta a una web pública.");
  }
}

export function normalizeUrl(input: unknown): URL {
  let v = String(input ?? "").trim();
  if (!v || v.length > 2048) throw new AuditError("invalid_url", "URL no válida");
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    throw new AuditError("invalid_url", "URL no válida");
  }
  const hostOk =
    /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname) ||
    (process.env.ALLOW_PRIVATE_HOSTS === "1" && u.hostname === "localhost");
  if (!["http:", "https:"].includes(u.protocol) || !hostOk || u.username || u.password) {
    throw new AuditError("invalid_url", "URL no válida");
  }
  u.hash = "";
  return u;
}

export interface SafeFetchOptions {
  maxRedirects?: number;
  timeout?: number;
  readBody?: boolean;
  followRedirects?: boolean;
}

export interface SafeFetchResult {
  url: string;
  status: number;
  headers: Headers;
  body: string;
  truncated: boolean;
  bytes: number;
  headersMs: number;
  totalMs: number;
  redirects: { url: string; status: number }[];
}

export async function safeFetch(
  url: string,
  { maxRedirects = 5, timeout = 12000, readBody = true, followRedirects = true }: SafeFetchOptions = {},
): Promise<SafeFetchResult> {
  let current = new URL(url);
  const redirects: { url: string; status: number }[] = [];
  const started = Date.now();

  for (let i = 0; i <= maxRedirects; i++) {
    await assertPublicHost(current.hostname);
    let res: Response;
    const t0 = Date.now();
    try {
      res = await fetch(current, {
        redirect: "manual",
        cache: "no-store",
        headers: {
          "user-agent": UA,
          accept: "text/html,application/xhtml+xml,*/*;q=0.8",
          "accept-language": "es-ES,es;q=0.9",
        },
        signal: AbortSignal.timeout(timeout),
      });
    } catch (e) {
      const name = e && typeof e === "object" && "name" in e ? String((e as { name: unknown }).name) : "";
      if (name === "TimeoutError" || name === "AbortError") {
        throw new AuditError("timeout", "La web ha tardado demasiado en responder.");
      }
      throw new AuditError("connection", "No se ha podido conectar con la web.");
    }
    const headersMs = Date.now() - t0;
    const loc = res.headers.get("location");

    if (followRedirects && res.status >= 300 && res.status < 400 && loc) {
      redirects.push({ url: current.href, status: res.status });
      current = new URL(loc, current);
      if (!["http:", "https:"].includes(current.protocol)) {
        throw new AuditError("connection", "Redirección no válida.");
      }
      continue;
    }

    let body = "";
    let truncated = false;
    if (readBody && res.body) {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        chunks.push(value);
        if (size > MAX_BYTES) {
          truncated = true;
          try {
            await reader.cancel();
          } catch {
            /* nada que hacer */
          }
          break;
        }
      }
      body = Buffer.concat(chunks).toString("utf8");
    } else if (res.body) {
      try {
        await res.body.cancel();
      } catch {
        /* nada que hacer */
      }
    }

    return {
      url: current.href,
      status: res.status,
      headers: res.headers,
      body,
      truncated,
      bytes: Buffer.byteLength(body),
      headersMs,
      totalMs: Date.now() - started,
      redirects,
    };
  }
  throw new AuditError("connection", "Demasiadas redirecciones.");
}
