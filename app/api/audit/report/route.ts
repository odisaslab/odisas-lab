import { NextResponse } from "next/server";
import { deliverToTeam } from "@/lib/delivery";
import { buildEmail } from "@/lib/audit/email";
import { verify } from "@/lib/audit/token";
import type { SignedAudit, SignedPerf } from "@/lib/audit/types";
import { mailConfig, mailProvider, sendMail } from "@/lib/mail";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import { site } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

// 5 envíos por IP cada hora y 2 por análisis cada 24 h
const byIp = createLimiter(5, 3600e3);
const byAudit = createLimiter(2, 24 * 3600e3);

const EMAIL_RE = /^[^\s@<>"',;]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
const headers = { "Cache-Control": "no-store" };

const fail = (error: string, message: string, status: number) =>
  NextResponse.json({ ok: false, error, message }, { status, headers });

const sameHost = (a: string, b: string) => {
  try {
    return new URL(a).hostname.replace(/^www\./, "") === new URL(b).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
};

interface ReportBody {
  email?: unknown;
  companyName?: unknown;
  consent?: unknown;
  emailToken?: unknown;
  perfToken?: unknown;
  website?: unknown;
}

/**
 * Recibe la solicitud del diagnóstico por email.
 *  1. Envía al cliente el informe, si hay un canal de email configurado.
 *  2. Avisa siempre al equipo con el lead y el resumen del análisis, para que
 *     ningún contacto se pierda aunque el email automático no esté disponible.
 */
export async function POST(request: Request) {
  let body: ReportBody;
  try {
    body = (await request.json()) as ReportBody;
  } catch {
    return fail("bad_request", "Solicitud no válida.", 400);
  }

  // Campo trampa para bots: se descarta en silencio
  if (body.website) return NextResponse.json({ ok: true, emailSent: false }, { headers });

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  if (!EMAIL_RE.test(email)) return fail("invalid_email", "Escribe un email válido.", 400);
  if (body.consent !== true) {
    return fail("consent", "Marca la casilla para poder enviarte el diagnóstico.", 400);
  }

  const audit = verify<SignedAudit>(body.emailToken);
  if (!audit || audit.kind !== "audit") {
    return fail("expired", "El análisis ha caducado. Vuelve a analizar la web.", 400);
  }

  const ip = clientIp(request);
  const token = String(body.emailToken);
  if (!byIp(ip) || !byAudit(token.slice(-24))) {
    return fail("rate_limited", "Has alcanzado el límite de envíos. Inténtalo más tarde.", 429);
  }

  // Rendimiento solo si viene firmado y corresponde a la misma web
  const signedPerf = verify<SignedPerf>(body.perfToken);
  const perf = signedPerf && signedPerf.kind === "perf" && sameHost(signedPerf.url, audit.url) ? signedPerf : null;

  const companyName = String(body.companyName ?? "")
    .replace(/[\r\n<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  // 1) Email al cliente
  let emailSent = false;
  if (mailProvider()) {
    const config = mailConfig();
    config.logoUrl = `${site.url.replace(/\/$/, "")}/icon-192.png`;
    const mail = buildEmail({ audit, perf, companyName, config });
    try {
      await sendMail({
        to: email,
        bcc: config.internalCopy || undefined,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        replyTo: config.replyTo,
        fromName: config.brandName,
      });
      emailSent = true;
    } catch (error) {
      console.error("[audit] No se pudo enviar el email al cliente:", error instanceof Error ? error.message : error);
    }
  }

  // 2) Aviso al equipo con el lead
  const host = audit.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const score = Math.round(audit.categories.reduce((s, c) => s + c.score, 0) / audit.categories.length);
  const summary = [
    "Nuevo lead desde el diagnóstico web gratuito",
    "",
    `Web analizada: ${audit.url}`,
    `Nota global (sin rendimiento): ${score}/100`,
    ...audit.categories.map((c) => `  - ${c.label}: ${c.score}/100`),
    perf ? `  - Rendimiento móvil: ${perf.score}/100` : "",
    `Problemas: ${audit.counts.critical} críticos · ${audit.counts.high} altos · ${audit.counts.medium} medios · ${audit.counts.low} bajos`,
    "",
    "Principales hallazgos:",
    ...audit.issues.slice(0, 5).map((i) => `  - [${i.severity}] ${i.title}`),
    "",
    `Empresa: ${companyName || audit.siteName}`,
    `Email: ${email}`,
    `Informe enviado automáticamente al cliente: ${emailSent ? "sí" : "no (hay que escribirle)"}`,
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  let teamNotified = false;
  try {
    teamNotified = await deliverToTeam({
      subject: `Lead diagnóstico web · ${host} · ${score}/100`,
      text: summary,
      replyTo: email,
      payload: {
        type: "audit",
        email,
        company: companyName || audit.siteName,
        url: audit.url,
        score,
        counts: audit.counts,
        categories: audit.categories,
        performance: perf?.score ?? null,
        topIssues: audit.issues.slice(0, 5).map((i) => ({ severity: i.severity, title: i.title })),
        reportEmailed: emailSent,
      },
    });
  } catch (error) {
    console.error("[audit] No se pudo avisar al equipo:", error instanceof Error ? error.message : error);
  }

  if (!emailSent && !teamNotified) {
    // Sin ningún canal: se registra en el log del servidor para no perder el contacto
    console.warn("[audit] Lead sin canal de entrega configurado:\n" + summary);
    return fail("not_configured", "El envío automático no está disponible ahora mismo.", 503);
  }

  return NextResponse.json({ ok: true, emailSent }, { headers });
}
