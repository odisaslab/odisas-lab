import { NextResponse } from "next/server";
import { deliverToTeam } from "@/lib/delivery";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import {
  hasErrors,
  sanitizeContact,
  validateContact,
  type ContactPayload,
} from "@/lib/contact";

export const runtime = "nodejs";

/** 5 envíos por IP cada 10 minutos: frena bots básicos (ver lib/rate-limit.ts). */
const allowed = createLimiter(5, 10 * 60 * 1000);

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
    // Webhook (Zapier, Make, n8n, CRM) o email (SMTP / Resend), según lo configurado
    const delivered = await deliverToTeam({
      subject: `Nueva solicitud web · ${data.need} · ${data.name}`,
      text: formatSubmission(data),
      replyTo: data.email,
      payload: { type: "contacto", ...data },
    });

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
