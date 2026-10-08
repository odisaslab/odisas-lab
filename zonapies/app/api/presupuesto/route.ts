import { NextResponse } from "next/server";
import { needOptions, professionalTypes } from "@/data/quote";
import { deliverToTeam } from "@/lib/delivery";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import {
  hasErrors,
  labelFor,
  sanitizeQuote,
  validateQuote,
  type QuotePayload,
} from "@/lib/quote";

export const runtime = "nodejs";

/** 5 envíos por IP cada 10 minutos: frena bots básicos (ver lib/rate-limit.ts). */
const allowed = createLimiter(5, 10 * 60 * 1000);

/** Convierte el envío en texto legible para email, webhook o CRM. */
function formatSubmission(data: QuotePayload) {
  return [
    `Nombre: ${data.name}`,
    `Clínica / empresa: ${data.company || "—"}`,
    `Email: ${data.email}`,
    `Teléfono: ${data.phone || "—"}`,
    `Provincia: ${data.province || "—"}`,
    `Tipo de profesional: ${data.professionalType ? labelFor(professionalTypes, data.professionalType) : "—"}`,
    `Necesita: ${labelFor(needOptions, data.need)}`,
    `Origen (CTA): ${data.source || "—"}`,
    "",
    "Mensaje:",
    data.message || "—",
  ].join("\n");
}

export async function POST(request: Request) {
  if (!allowed(clientIp(request))) {
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

  const data = sanitizeQuote(body as Partial<QuotePayload>);

  // Campo trampa relleno: es un bot. Se descarta en silencio.
  if (data.honeypot) {
    return NextResponse.json({ ok: true, code: "discarded" }, { status: 200 });
  }

  const errors = validateQuote(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, code: "invalid", errors }, { status: 422 });
  }

  try {
    const delivered = await deliverToTeam({
      subject: `Solicitud de presupuesto · ${labelFor(needOptions, data.need)} · ${data.name}`,
      text: formatSubmission(data),
      replyTo: data.email,
      payload: { type: "presupuesto", ...data },
    });

    if (!delivered) {
      // Sin canal configurado: se registra en el servidor para no perder el lead.
      console.warn("[presupuesto] Sin canal de entrega configurado. Solicitud recibida:\n" + formatSubmission(data));
      return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[presupuesto] Error al entregar la solicitud:", error);
    console.warn("[presupuesto] Solicitud no entregada:\n" + formatSubmission(data));
    return NextResponse.json({ ok: false, code: "delivery_failed" }, { status: 502 });
  }
}
