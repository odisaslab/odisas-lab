import { NextResponse } from "next/server";
import { normalizeUrl } from "@/lib/audit/safe-fetch";
import { sign } from "@/lib/audit/token";
import type { PerfMetric, PerfResult } from "@/lib/audit/types";
import { serverEnv } from "@/lib/clean-env";
import { clientIp, createLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const allowed = createLimiter(10, 10 * 60 * 1000);
const headers = { "Cache-Control": "no-store" };

/** Rendimiento real con Google PageSpeed Insights (Lighthouse, simulación móvil). */
const THRESHOLDS: Record<string, { label: string; good: number; poor: number; unit: "ms" | "" }> = {
  "largest-contentful-paint": { label: "LCP (carga del contenido principal)", good: 2500, poor: 4000, unit: "ms" },
  "cumulative-layout-shift": { label: "CLS (estabilidad visual)", good: 0.1, poor: 0.25, unit: "" },
  "total-blocking-time": { label: "TBT (bloqueo de interacción)", good: 200, poor: 600, unit: "ms" },
  "first-contentful-paint": { label: "FCP (primer contenido visible)", good: 1800, poor: 3000, unit: "ms" },
  "speed-index": { label: "Speed Index", good: 3400, poor: 5800, unit: "ms" },
};

interface PsiAudit {
  numericValue?: number;
  displayValue?: string;
}

interface PsiResponse {
  lighthouseResult?: {
    audits: Record<string, PsiAudit | undefined>;
    categories: { performance: { score: number | null } };
  };
  loadingExperience?: { metrics?: unknown; overall_category?: string };
}

const unavailable = (reason: string, status = 200) =>
  NextResponse.json({ available: false, reason } satisfies PerfResult, { status, headers });

export async function POST(request: Request) {
  if (!allowed(clientIp(request))) return unavailable("Has hecho varias mediciones seguidas. Espera unos minutos.", 429);

  let url: URL;
  try {
    const body = (await request.json()) as { url?: unknown };
    url = normalizeUrl(body.url);
  } catch {
    return unavailable("URL no válida", 400);
  }

  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", url.href);
  api.searchParams.set("strategy", "mobile");
  api.searchParams.set("category", "performance");
  const apiKey = serverEnv("PAGESPEED_API_KEY");
  if (apiKey) api.searchParams.set("key", apiKey);

  try {
    const response = await fetch(api, { signal: AbortSignal.timeout(55000), cache: "no-store" });
    if (response.status === 429) {
      return unavailable("Límite de consultas a Google PageSpeed alcanzado. Configura PAGESPEED_API_KEY.");
    }
    if (!response.ok) {
      return unavailable(`Google PageSpeed no ha podido medir la web (HTTP ${response.status}).`);
    }
    const data = (await response.json()) as PsiResponse;
    const lh = data.lighthouseResult;
    if (!lh) return unavailable("Google PageSpeed no devolvió resultados.");

    const metrics: PerfMetric[] = Object.entries(THRESHOLDS).map(([id, t]) => {
      const audit = lh.audits[id];
      if (!audit || typeof audit.numericValue !== "number") {
        return { id, label: t.label, value: null, status: "unavailable" as const };
      }
      const v = audit.numericValue;
      return {
        id,
        label: t.label,
        value: v,
        display: audit.displayValue,
        status: v <= t.good ? "good" : v <= t.poor ? "needs-improvement" : "poor",
        threshold: t.unit === "ms" ? `Bueno ≤ ${t.good / 1000} s` : `Bueno ≤ ${t.good}`,
      };
    });

    const field = data.loadingExperience?.metrics ? data.loadingExperience.overall_category : null;
    const score = Math.round((lh.categories.performance.score || 0) * 100);

    const result: PerfResult = {
      available: true,
      perfToken: sign({
        kind: "perf",
        url: url.href,
        score,
        metrics: metrics
          .filter((m) => m.value != null)
          .map((m) => ({ label: m.label, display: m.display, status: m.status })),
      }),
      source: "Google PageSpeed Insights · Lighthouse · simulación móvil",
      score,
      metrics,
      fieldData: field ? { overall: field } : null,
    };
    return NextResponse.json(result, { headers });
  } catch (error) {
    const timeout = error instanceof Error && error.name === "TimeoutError";
    return unavailable(
      timeout
        ? "La medición de rendimiento ha superado el tiempo máximo."
        : "No se ha podido conectar con Google PageSpeed.",
    );
  }
}
