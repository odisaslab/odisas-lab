/** Tipos compartidos entre el motor de auditoría (servidor) y la interfaz (cliente). */

export type Severity = "critical" | "high" | "medium" | "low";
export type CategoryId = "security" | "seo" | "mobile" | "conversion";

export interface AuditIssue {
  category: CategoryId;
  severity: Severity;
  title: string;
  evidence: string;
  recommendation: string;
  /** "medido": viene de la respuesta del servidor · "detectado": encontrado en el código de la página */
  source: "medido" | "detectado";
  weight: number;
  impact: string;
}

export interface AuditPassed {
  category: CategoryId;
  title: string;
  evidence: string;
  source: "medido" | "detectado";
}

export interface AuditCategory {
  id: CategoryId;
  label: string;
  score: number;
  errors: number;
  warnings: number;
  passed: number;
}

export interface AuditResult {
  url: string;
  siteName: string;
  siteNameSource: string;
  requestedUrl: string;
  analyzedAt: string;
  score: number;
  scoring: string;
  http: {
    status: number;
    redirects: number;
    responseMs: number;
    htmlKB: number;
    truncated: boolean;
  };
  categories: AuditCategory[];
  issues: AuditIssue[];
  passed: AuditPassed[];
  counts: Record<Severity, number>;
  scope: string;
  /** Datos firmados que permiten generar el email sin que nadie pueda alterar su contenido */
  emailToken?: string | null;
}

export interface PerfMetric {
  id: string;
  label: string;
  value: number | null;
  display?: string;
  status: "good" | "needs-improvement" | "poor" | "unavailable";
  threshold?: string;
}

export type PerfResult =
  | { available: false; reason: string }
  | {
      available: true;
      perfToken: string | null;
      source: string;
      score: number;
      metrics: PerfMetric[];
      fieldData: { overall: string } | null;
    };

/** Contenido firmado dentro de emailToken */
export interface SignedAudit {
  kind: "audit";
  url: string;
  siteName: string;
  analyzedAt: string;
  categories: { id: string; label: string; score: number }[];
  counts: Record<Severity, number>;
  issues: Pick<AuditIssue, "category" | "severity" | "title" | "evidence" | "impact" | "recommendation">[];
  passed: { category: string; title: string }[];
}

export interface SignedPerf {
  kind: "perf";
  url: string;
  score: number;
  metrics: { label: string; display?: string; status: string }[];
}
