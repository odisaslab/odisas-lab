import { NextResponse } from "next/server";
import {
  hasErrors,
  sanitizeContact,
  validateContact,
  type ContactPayload,
} from "@/lib/contact";

export const runtime = "nodejs";

/**
 * Rate limiting en memoria: 5 envíos por IP cada 10 minutos.
 * Suficiente para frenar bots básicos. Si la web crece o se despliega en varias
 * instancias, sustituir por Upstash Redis o similar.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const previous = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  previous.push(now);
  hits.set(ip, previous);

  // Limpieza para que el mapa no crezca indefinidamente
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time > WINDOW_MS)) hits.delete(key);
    }
  }

  return previous.length > MAX_REQUESTS;
}

function getIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "desconocida";
}

/** Convierte el envío en texto legible para email, webhook o CRM. */
function formatSubmission(data: ContactPayload) {
  return [
    `Nombre: ${data.name}`,
    `Empresa: ${data.company || "—"}`,
    `Email: ${data.email}`,
    `Teléfono: ${data.phone || "—"}`,
    `Web: ${data.website || "—"}`,
    `Necesita: ${data.need}`,
    `Presupuesto: ${data.budget || "—"}`,
    "",
    "Mensaje:",
    data.message,
  ].join("\n");
}

/**
 * Entrega del lead.
 * Hoy soporta webhook (Zapier, Make, n8n, CRM) y Resend para email.
 * Si no hay ningún canal configurado, no se finge un envío correcto:
 * se devuelve un error específico y el formulario ofrece contacto directo.
 */
async function deliver(data: ContactPayload) {
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, receivedAt: new Date().toISOString() }),
    });
    if (!response.ok) throw new Error(`Webhook respondió ${response.status}`);
    return true;
  }

  if (resendKey && to && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `Nueva solicitud web · ${data.need} · ${data.name}`,
        text: formatSubmission(data),
      }),
    });
    if (!response.ok) throw new Error(`Resend respondió ${response.status}`);
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  const ip = getIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, code: "rate_limited", message: "Demasiados envíos seguidos. Inténtalo en unos minutos." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "bad_request" }, { status: 400 });
  }

  const data = sanitizeContact(body as Partial<ContactPayload>);

  // Campo trampa relleno: es un bot. Se descarta en silencio.
  if (data.honeypot) {
    return NextResponse.json({ ok: true, code: "discarded" }, { status: 200 });
  }

  const errors = validateContact(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, code: "invalid", errors }, { status: 422 });
  }

  try {
    const delivered = await deliver(data);

    if (!delivered) {
      // Sin canal configurado: se registra en el servidor para no perder el lead.
      console.warn(
        "[contacto] Sin canal de entrega configurado. Solicitud recibida:\n" +
          formatSubmission(data),
      );
      return NextResponse.json(
        { ok: false, code: "not_configured" },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contacto] Error al entregar la solicitud:", error);
    console.warn("[contacto] Solicitud no entregada:\n" + formatSubmission(data));
    return NextResponse.json({ ok: false, code: "delivery_failed" }, { status: 502 });
  }
}
