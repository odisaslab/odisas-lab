import { NextResponse } from "next/server";
import { runAudit } from "@/lib/audit/engine";
import { AuditError, normalizeUrl } from "@/lib/audit/safe-fetch";
import { sign } from "@/lib/audit/token";
import { clientIp, createLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// 10 análisis por IP cada 10 minutos: el servidor descarga páginas de terceros, no debe poder usarse en masa
const allowed = createLimiter(10, 10 * 60 * 1000);

const MESSAGES: Record<string, string> = {
  invalid_url: "URL no válida",
  dns: "URL no válida: el dominio no existe o no responde.",
  blocked: "La web no permite realizar un análisis completo",
};

const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!allowed(clientIp(request))) {
    return NextResponse.json(
      { error: "rate_limited", message: "Has hecho varios análisis seguidos. Espera unos minutos e inténtalo de nuevo." },
      { status: 429, headers },
    );
  }

  let body: { url?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_url", message: "URL no válida" }, { status: 400, headers });
  }

  try {
    const url = normalizeUrl(body.url);
    const result = await runAudit(url);

    // Token firmado con los datos que podrán usarse en el email al cliente
    const emailToken = sign({
      kind: "audit",
      url: result.url,
      siteName: result.siteName,
      analyzedAt: result.analyzedAt,
      categories: result.categories.map((c) => ({ id: c.id, label: c.label, score: c.score })),
      counts: result.counts,
      issues: result.issues.slice(0, 8).map((i) => ({
        category: i.category,
        severity: i.severity,
        title: i.title,
        evidence: i.evidence.slice(0, 160),
        impact: i.impact,
        recommendation: i.recommendation,
      })),
      passed: result.passed.slice(0, 5).map((p) => ({ category: p.category, title: p.title })),
    });

    return NextResponse.json({ ...result, emailToken }, { headers });
  } catch (error) {
    if (error instanceof AuditError) {
      const status = ["invalid_url", "dns"].includes(error.code) ? 400 : 422;
      return NextResponse.json(
        { error: error.code, message: MESSAGES[error.code] || error.message || "No se ha podido completar el análisis" },
        { status, headers },
      );
    }
    console.error("[audit] Error inesperado:", error);
    return NextResponse.json(
      { error: "internal", message: "No se ha podido completar el análisis" },
      { status: 500, headers },
    );
  }
}
