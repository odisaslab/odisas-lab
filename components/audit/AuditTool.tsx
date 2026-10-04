"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, Globe, Loader2, MessageCircle, RotateCcw } from "lucide-react";
import {
  CategoryCard,
  IssueList,
  PerfTable,
  Scope,
  ScoreRing,
  SeverityCount,
  categoryStats,
  scoreColor,
  verdict,
} from "@/components/audit/AuditParts";
import { PREFILL_EVENT } from "@/components/home/CtaButton";
import { whatsappLink } from "@/data/site";
import type { AuditResult, PerfResult, Severity } from "@/lib/audit/types";
import { scrollToId } from "@/lib/lenis";

type Phase = "idle" | "running" | "error" | "done";
type StepState = "idle" | "run" | "done" | "fail";

const DEFAULT_HINT = "Sin registro. Solo necesitas el enlace.";

const CHIPS = [
  { label: "Errores técnicos", dot: "bg-alert" },
  { label: "Amenazas de seguridad", dot: "bg-warn" },
  { label: "SEO y velocidad", dot: "bg-primary" },
  { label: "Móvil y conversión", dot: "bg-ok" },
];

function normalize(value: string): string | null {
  let v = value.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try {
    const u = new URL(v);
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return null;
    return u.href;
  } catch {
    return null;
  }
}

const hostOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

async function post<T>(path: string, body: unknown, signal?: AbortSignal) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  let data: T | null = null;
  try {
    data = (await response.json()) as T;
  } catch {
    /* respuesta sin cuerpo JSON */
  }
  return { ok: response.ok, status: response.status, data };
}

interface ErrorBody {
  error?: string;
  message?: string;
}

export function AuditTool() {
  const uid = useId();
  const [url, setUrl] = useState("");
  const [fieldError, setFieldError] = useState(false);
  const [hint, setHint] = useState<{ text: string; tone: "" | "bad" | "good" }>({ text: DEFAULT_HINT, tone: "" });
  const [phase, setPhase] = useState<Phase>("idle");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [perf, setPerf] = useState<PerfResult | null>(null);
  const [steps, setSteps] = useState<Record<"connect" | "checks" | "perf", StepState>>({
    connect: "idle",
    checks: "idle",
    perf: "idle",
  });
  const [error, setError] = useState<{ title: string; text: string } | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const runId = useRef(0);
  const perfCtrl = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Al desmontar se cancela cualquier medición pendiente
  useEffect(() => () => perfCtrl.current?.abort(), []);

  const running = phase === "running";
  const doneSteps = Object.values(steps).filter((s) => s === "done" || s === "fail").length;
  const pct = Math.round((doneSteps / 3) * 100);

  async function start(target: string) {
    const id = ++runId.current;
    perfCtrl.current?.abort();
    const ctrl = new AbortController();
    perfCtrl.current = ctrl;

    setPhase("running");
    setAudit(null);
    setPerf(null);
    setError(null);
    setShowProgress(true);
    setSteps({ connect: "run", checks: "idle", perf: "run" });
    setHint({ text: `Analizando ${hostOf(target)}…`, tone: "" });
    requestAnimationFrame(() => scrollToId(`${uid}-resultados`));

    const perfPromise = post<PerfResult>("/api/audit/performance", { url: target }, ctrl.signal)
      .then((r): PerfResult => r.data ?? { available: false, reason: "No se ha podido medir el rendimiento." })
      .catch((err: unknown): PerfResult | null =>
        err instanceof DOMException && err.name === "AbortError"
          ? null
          : { available: false, reason: "No se ha podido conectar con el servicio de rendimiento." },
      );

    let res: Awaited<ReturnType<typeof post<AuditResult & ErrorBody>>>;
    try {
      res = await post<AuditResult & ErrorBody>("/api/audit/analyze", { url: target });
    } catch {
      res = { ok: false, status: 0, data: { message: "No se ha podido completar el análisis" } as AuditResult & ErrorBody };
    }
    if (id !== runId.current) return;

    if (!res.ok || !res.data || !("categories" in res.data) || !res.data.categories) {
      ctrl.abort();
      const message = res.data?.message || "No se ha podido completar el análisis";
      setPhase("error");
      setShowProgress(false);
      setError({
        title:
          res.status === 400
            ? "URL no válida"
            : res.data?.error === "blocked"
              ? "La web no permite realizar un análisis completo"
              : "No se ha podido completar el análisis",
        text: `${message} No mostramos resultados para no darte datos que no hemos podido comprobar.`,
      });
      setHint({ text: message, tone: "bad" });
      return;
    }

    setAudit(res.data);
    setPhase("done");
    setSteps((s) => ({ ...s, connect: "done", checks: "done" }));
    setHint({ text: "Análisis listo. Tienes el resumen justo debajo.", tone: "good" });
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));

    const perfResult = await perfPromise;
    if (id !== runId.current || !perfResult) return;
    setPerf(perfResult);
    setSteps((s) => ({ ...s, perf: perfResult.available ? "done" : "fail" }));
    window.setTimeout(() => {
      if (id === runId.current) setShowProgress(false);
    }, 900);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const target = normalize(url);
    if (!target) {
      setFieldError(true);
      setHint({ text: "URL no válida. Escribe una dirección como tuweb.com", tone: "bad" });
      inputRef.current?.focus();
      return;
    }
    start(target);
  }

  function reset() {
    runId.current++;
    perfCtrl.current?.abort();
    setPhase("idle");
    setAudit(null);
    setPerf(null);
    setUrl("");
    setError(null);
    setShowProgress(false);
    setHint({ text: DEFAULT_HINT, tone: "" });
    requestAnimationFrame(() => {
      scrollToId(`${uid}-formulario`);
      window.setTimeout(() => inputRef.current?.focus(), 350);
    });
  }

  // Nota global: media de las categorías medidas (rendimiento solo si se ha podido medir)
  const scores = audit ? audit.categories.map((c) => c.score) : [];
  if (audit && perf && perf.available) scores.push(perf.score);
  const globalScore = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

  const stepList: { key: "connect" | "checks" | "perf"; text: string }[] = [
    { key: "connect", text: "Conectando con la web y descargando la página" },
    { key: "checks", text: "Revisando seguridad, SEO, móvil y conversión" },
    { key: "perf", text: "Midiendo rendimiento con Google PageSpeed (puede tardar hasta 1 minuto)" },
  ];

  return (
    <div>
      {/* ── Formulario ── */}
      <div id={`${uid}-formulario`} className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <form onSubmit={onSubmit} noValidate aria-describedby={`${uid}-hint`}>
            <label htmlFor={`${uid}-url`} className="sr-only">
              Dirección de tu web
            </label>
            <div
              className={`flex flex-wrap items-center gap-2 rounded-[1.25rem] border bg-cream/[0.04] p-2 pl-5 transition-colors max-sm:pl-2 sm:flex-nowrap ${
                fieldError ? "border-alert" : "border-cream/20 focus-within:border-primary focus-within:bg-primary/[0.06]"
              }`}
            >
              <Globe aria-hidden="true" className="muted size-5 shrink-0 max-sm:ml-3" />
              <input
                ref={inputRef}
                id={`${uid}-url`}
                type="text"
                inputMode="url"
                autoComplete="url"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="tuweb.com"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  if (fieldError) setFieldError(false);
                  if (hint.tone === "bad") setHint({ text: DEFAULT_HINT, tone: "" });
                }}
                aria-invalid={fieldError}
                className="min-h-12 min-w-0 flex-1 basis-[calc(100%-3rem)] bg-transparent px-1 text-[1.05rem] text-cream outline-none placeholder:text-cream/45 sm:basis-auto"
              />
              <button type="submit" disabled={running} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
                {running ? (
                  <>
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    Analizando…
                  </>
                ) : (
                  <>
                    Analizar mi web
                    <ArrowRight aria-hidden="true" className="arrow size-[1.05em]" />
                  </>
                )}
              </button>
            </div>
            <p
              id={`${uid}-hint`}
              aria-live="polite"
              className={`mt-3 min-h-[1.4em] text-[0.92rem] ${
                hint.tone === "bad" ? "text-alert" : hint.tone === "good" ? "text-ok" : "muted"
              }`}
            >
              {hint.text}
            </p>
          </form>

          <ul className="mt-5 flex flex-wrap gap-2.5" aria-label="Qué revisamos">
            {CHIPS.map((chip) => (
              <li key={chip.label} className="inline-flex items-center gap-2 rounded-xl border border-hair bg-cream/[0.04] px-3.5 py-2 text-[0.9rem]">
                <i aria-hidden="true" className={`size-2.5 rounded-[3px] ${chip.dot}`} />
                {chip.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden sm:block">
          <Scope />
        </div>
      </div>

      {/* ── Resultados ── */}
      {phase !== "idle" ? (
        <section
          id={`${uid}-resultados`}
          aria-live="polite"
          aria-label="Resultados del diagnóstico"
          className="mt-14 border-t border-hair pt-10 md:mt-20 md:pt-14"
        >
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h3
                ref={titleRef}
                tabIndex={-1}
                className="t-h3 outline-none"
              >
                {audit ? `Diagnóstico de ${hostOf(audit.url)}` : phase === "error" ? "Análisis no completado" : "Analizando tu web"}
              </h3>
              <p className="muted mt-1.5 text-[0.9rem] break-words">
                {audit
                  ? `${audit.url} · ${new Date(audit.analyzedAt).toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" })}`
                  : normalize(url) ?? ""}
              </p>
            </div>
            <button type="button" onClick={reset} className="btn btn-ghost-light min-h-11 px-4 py-2 text-[0.9rem]">
              <RotateCcw aria-hidden="true" className="size-4" />
              Nueva auditoría
            </button>
          </div>

          {showProgress ? (
            <div role="status" className="mb-6 max-w-xl rounded-2xl border border-hair bg-ink p-6">
              <h4 className="font-[family-name:var(--font-display)] text-lg font-semibold">Análisis en curso</h4>
              <p className="muted mt-1 text-[0.9rem]">{pct} %</p>
              <div className="my-4 h-2 overflow-hidden rounded-full bg-cream/10">
                <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </div>
              <ol className="grid gap-3">
                {stepList.map((step) => {
                  const state = steps[step.key];
                  return (
                    <li key={step.key} className={`flex items-center gap-3 text-[0.95rem] ${state === "idle" ? "muted" : ""}`}>
                      <span
                        aria-hidden="true"
                        className={`flex size-[1.15rem] shrink-0 items-center justify-center rounded-full border-2 ${
                          state === "done"
                            ? "border-ok bg-ok text-ink"
                            : state === "fail"
                              ? "border-warn bg-warn text-ink"
                              : state === "run"
                                ? "animate-spin border-primary border-r-transparent"
                                : "border-cream/25"
                        }`}
                      >
                        {state === "done" ? <Check className="size-3" strokeWidth={3} /> : null}
                      </span>
                      {step.text}
                      <span className="sr-only">
                        {state === "done" ? " (hecho)" : state === "fail" ? " (no disponible)" : state === "run" ? " (en curso)" : ""}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          {phase === "error" && error ? (
            <div role="alert" className="max-w-xl rounded-2xl border border-alert/40 bg-ink p-6">
              <h4 className="font-[family-name:var(--font-display)] text-lg font-semibold text-alert">{error.title}</h4>
              <p className="muted mt-2 text-[0.95rem]">{error.text}</p>
            </div>
          ) : null}

          {audit ? <Dashboard audit={audit} perf={perf} globalScore={globalScore} /> : null}
        </section>
      ) : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Panel de resultados
   ────────────────────────────────────────────────────────────── */

function Dashboard({ audit, perf, globalScore }: { audit: AuditResult; perf: PerfResult | null; globalScore: number }) {
  const measured = audit.categories.length + (perf && perf.available ? 1 : 0);
  const threats = audit.issues.filter((i) => i.category === "security");
  const errors = audit.issues.filter((i) => i.category !== "security");
  const passedChips = audit.passed.slice(0, 8);
  const host = hostOf(audit.url);

  const talkAboutIt = () => {
    window.dispatchEvent(
      new CustomEvent(PREFILL_EVENT, {
        detail: {
          need: "Mejorar mi web",
          message: `He analizado ${host} con vuestro diagnóstico gratuito y ha salido ${globalScore}/100. Me gustaría que me expliquéis qué arreglaríais primero.`,
        },
      }),
    );
    scrollToId("contacto");
  };

  return (
    <div className="grid gap-4">
      {/* Resumen */}
      <div className="grid items-center gap-6 rounded-3xl border border-hair bg-ink p-6 md:grid-cols-[auto_1fr] md:gap-12 md:p-9">
        <ScoreRing score={globalScore} />
        <div>
          <p className="font-[family-name:var(--font-display)] text-[1.35rem] leading-tight font-semibold md:text-2xl" style={{ color: scoreColor(globalScore) }}>
            {verdict(globalScore)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {(["critical", "high", "medium", "low"] as Severity[]).map((severity) => (
              <SeverityCount key={severity} severity={severity} count={audit.counts[severity]} />
            ))}
          </div>
          <p className="muted mt-4 max-w-[62ch] text-[0.85rem] leading-relaxed">
            Nota calculada como media de {measured} categorías medidas. {audit.scoring}
            {perf && !perf.available ? " Rendimiento no se incluye porque no se ha podido medir." : ""}
          </p>
        </div>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {audit.categories.map((c) => (
          <CategoryCard key={c.id} label={c.label} score={c.score} stats={categoryStats(c)} />
        ))}
        {perf && perf.available ? (
          <CategoryCard label="Rendimiento" score={perf.score} stats="Google Lighthouse (móvil)" />
        ) : (
          <CategoryCard
            label="Rendimiento"
            score={null}
            unavailable={perf ? `No disponible: ${perf.reason}` : "Midiendo…"}
          />
        )}
      </div>

      {/* Hallazgos */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-hair bg-ink p-6 md:p-7">
          <h4 className="font-[family-name:var(--font-display)] text-lg font-semibold">Amenazas detectadas</h4>
          <p className="muted mt-1 text-[0.9rem]">Riesgos de seguridad visibles públicamente, sin pruebas intrusivas.</p>
          <IssueList
            items={threats}
            max={4}
            empty="No hemos detectado amenazas en los aspectos que se pueden revisar desde fuera."
            moreText="más en el informe completo"
          />
        </div>
        <div className="rounded-3xl border border-hair bg-ink p-6 md:p-7">
          <h4 className="font-[family-name:var(--font-display)] text-lg font-semibold">Errores principales</h4>
          <p className="muted mt-1 text-[0.9rem]">Problemas de SEO, móvil y conversión ordenados por gravedad.</p>
          <IssueList
            items={errors}
            max={5}
            empty="No hemos detectado errores en las comprobaciones automáticas."
            moreText="más en el informe completo"
          />
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-hair bg-ink p-6 md:p-7">
          <h4 className="font-[family-name:var(--font-display)] text-lg font-semibold">Rendimiento en móvil</h4>
          <p className="muted mt-1 text-[0.9rem]">
            {perf
              ? perf.available
                ? `Puntuación ${perf.score}/100 · ${perf.source}`
                : `No disponible: ${perf.reason}`
              : "Midiendo con Google PageSpeed…"}
          </p>
          {perf && perf.available ? <PerfTable perf={perf} /> : null}
        </div>
        <div className="rounded-3xl border border-hair bg-ink p-6 md:p-7">
          <h4 className="font-[family-name:var(--font-display)] text-lg font-semibold">Lo que ya funciona</h4>
          <p className="muted mt-1 text-[0.9rem]">Comprobaciones superadas.</p>
          <ul className="mt-3.5 flex flex-wrap gap-2">
            {passedChips.length ? (
              passedChips.map((p) => (
                <li key={`${p.category}-${p.title}`} className="rounded-lg bg-ok/10 px-3 py-1.5 text-[0.86rem]">
                  ✓ {p.title}
                </li>
              ))
            ) : (
              <li className="rounded-lg bg-cream/[0.06] px-3 py-1.5 text-[0.86rem]">Ninguna comprobación superada</li>
            )}
          </ul>
        </div>
      </div>

      <ReportForm audit={audit} perf={perf} globalScore={globalScore} onTalk={talkAboutIt} />

      <p className="muted mt-2 max-w-[80ch] text-[0.84rem] leading-relaxed">
        {audit.scope} Los datos marcados &ldquo;Medido&rdquo; proceden de la respuesta real del servidor; &ldquo;Detectado&rdquo; indica
        que se han encontrado en el código de la página.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Captación: recibir el informe por email
   ────────────────────────────────────────────────────────────── */

type ReportState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; emailSent: boolean }
  | { kind: "bad"; message: string }
  | { kind: "unavailable" };

function ReportForm({
  audit,
  perf,
  globalScore,
  onTalk,
}: {
  audit: AuditResult;
  perf: PerfResult | null;
  globalScore: number;
  onTalk: () => void;
}) {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(audit.siteName || "");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<ReportState>({ kind: "idle" });
  const [sentTo, setSentTo] = useState("");

  const host = hostOf(audit.url);
  const waText = `Hola Odisas Lab, he analizado ${host} con vuestro diagnóstico gratuito (nota ${globalScore}/100) y quiero que me ayudéis a mejorarla.`;
  const waHref = whatsappLink ? `${whatsappLink}?text=${encodeURIComponent(waText)}` : "";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setState({ kind: "bad", message: "Escribe un email válido." });
      document.getElementById(`${uid}-email`)?.focus();
      return;
    }
    if (!consent) {
      setState({ kind: "bad", message: "Marca la casilla para poder enviarte el diagnóstico." });
      return;
    }
    if (!audit.emailToken) {
      setState({ kind: "unavailable" });
      return;
    }
    setState({ kind: "sending" });
    try {
      const result = await post<{ ok?: boolean; emailSent?: boolean; error?: string; message?: string }>("/api/audit/report", {
        email: clean,
        companyName: company.trim(),
        consent: true,
        emailToken: audit.emailToken,
        perfToken: perf && perf.available ? perf.perfToken : null,
        website: honeypot,
      });
      if (result.ok && result.data?.ok) {
        setSentTo(clean);
        setState({ kind: "sent", emailSent: Boolean(result.data.emailSent) });
        setEmail("");
        setConsent(false);
        return;
      }
      if (result.data?.error === "not_configured") {
        setState({ kind: "unavailable" });
        return;
      }
      setState({ kind: "bad", message: result.data?.message || "No se ha podido enviar el email." });
    } catch {
      setState({ kind: "bad", message: "No se ha podido conectar con el servidor." });
    }
  }

  const sending = state.kind === "sending";

  return (
    <div className="relative grid gap-8 overflow-hidden rounded-3xl border border-primary/40 bg-ink-3 p-6 md:grid-cols-[1.05fr_1fr] md:gap-12 md:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(255,107,0,0.45), transparent)" }}
      />
      <div className="relative">
        <h4 className="t-h3">Recibe este diagnóstico en el correo de tu empresa</h4>
        <p className="muted mt-3 max-w-[48ch] leading-relaxed">
          Te lo enviamos con cada punto explicado: por qué importa y qué haríamos para resolverlo. Si quieres, lo vemos
          juntos en una llamada breve y sin compromiso.
        </p>
        <button type="button" onClick={onTalk} className="btn btn-ghost-light mt-6 w-full sm:w-auto">
          Hablar con Odisas sobre estos resultados
          <ArrowRight aria-hidden="true" className="arrow size-[1.05em]" />
        </button>
      </div>

      <div className="relative">
        {state.kind === "sent" ? (
          <div role="status" className="rounded-2xl border border-ok/40 bg-ok/10 p-6">
            <span className="flex size-10 items-center justify-center rounded-full bg-ok text-ink">
              <Check aria-hidden="true" className="size-5" strokeWidth={3} />
            </span>
            <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold">
              {state.emailSent ? "Diagnóstico enviado" : "Solicitud recibida"}
            </p>
            <p className="muted mt-2 text-[0.95rem]">
              {state.emailSent
                ? `Enviado a ${sentTo}. Si no lo ves en unos minutos, revisa la carpeta de spam o promociones.`
                : `Hemos recibido tu solicitud. Te escribiremos a ${sentTo} con el informe en menos de 24 horas laborables.`}
            </p>
          </div>
        ) : state.kind === "unavailable" ? (
          <div role="alert" className="rounded-2xl border border-warn/40 bg-warn/10 p-6">
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold">El envío automático no está disponible ahora</p>
            <p className="muted mt-2 text-[0.95rem]">
              Puedes pedirnos el informe por WhatsApp con un clic: ya va con tu web y tu nota.
            </p>
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5 w-full sm:w-auto">
                <MessageCircle aria-hidden="true" className="size-5" />
                Pedir el informe por WhatsApp
              </a>
            ) : null}
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="grid gap-3">
            <div>
              <label htmlFor={`${uid}-email`} className="sr-only">
                Email de la empresa
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="correo@tuempresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor={`${uid}-company`} className="muted mb-1.5 block text-[0.85rem]">
                Nombre de la empresa <span className="opacity-70">(para dirigirnos a vosotros)</span>
              </label>
              <input
                id={`${uid}-company`}
                type="text"
                autoComplete="organization"
                maxLength={80}
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="field"
              />
            </div>
            {/* Campo trampa para bots */}
            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={`${uid}-hp`}>No rellenar</label>
              <input
                id={`${uid}-hp`}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>
            <label className="flex cursor-pointer items-start gap-3 text-[0.85rem] leading-snug">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-[var(--color-primary)]"
              />
              <span className="muted">
                Acepto recibir el diagnóstico por email y que Odisas Lab me contacte sobre sus resultados. Más información en la{" "}
                <a href="/politica-de-privacidad" className="text-cream underline underline-offset-4">
                  política de privacidad
                </a>
                .
              </span>
            </label>
            <button type="submit" disabled={sending} className="btn btn-primary w-full disabled:opacity-70">
              {sending ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                "Enviar diagnóstico"
              )}
            </button>
            <p role="status" className={`min-h-[1.3em] text-[0.9rem] ${state.kind === "bad" ? "text-alert" : ""}`}>
              {state.kind === "bad" ? state.message : ""}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
