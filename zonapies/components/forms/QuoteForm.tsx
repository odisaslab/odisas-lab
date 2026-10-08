"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { needOptions, professionalTypes, provinces } from "@/data/quote";
import { contact, telUrl, whatsappUrl } from "@/data/site";
import { track } from "@/lib/analytics";
import {
  emptyQuote,
  hasErrors,
  quoteWhatsappText,
  validateQuote,
  type QuoteErrors,
  type QuotePayload,
} from "@/lib/quote";
import { ArrowRight, Check, WhatsApp } from "@/components/ui/Icons";

interface QuoteFormProps {
  /** Identifica la vía de entrada (CTA, configurador…) para medir conversión por CTA */
  source: string;
  prefill?: Partial<QuotePayload>;
  /** Compacto: pensado para el diálogo */
  compact?: boolean;
  /** Oculta el selector «¿Qué necesitas?» (la necesidad ya viene fijada en `prefill`) */
  lockedNeed?: boolean;
  submitLabel?: string;
  messagePlaceholder?: string;
  successTitle?: string;
}

type Status = "idle" | "sending" | "sent" | "error";

export function QuoteForm({ source, prefill, compact = false, lockedNeed = false, submitLabel = "Solicitar presupuesto", messagePlaceholder = "Cuéntanos tu caso: tipo de pacientes, volumen aproximado, materiales de interés…", successTitle = "Solicitud recibida." }: QuoteFormProps) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const [values, setValues] = useState<QuotePayload>({ ...emptyQuote(), ...prefill, source });
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<string>("");
  const started = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof QuotePayload>(key: K, value: QuotePayload[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onFirstTouch = () => {
    if (started.current) return;
    started.current = true;
    track("quote_form_start", { source });
  };

  const focusFirstError = (found: QuoteErrors) => {
    const order: (keyof QuotePayload)[] = ["name", "email", "phone", "need", "professionalType", "privacy"];
    const first = order.find((key) => found[key]);
    if (!first) return;
    const target = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    target?.focus();
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === "sending") return;

    const found = validateQuote(values);
    setErrors(found);
    if (hasErrors(found)) {
      track("quote_form_error", { source, fields: Object.keys(found).join(",") });
      focusFirstError(found);
      return;
    }

    setStatus("sending");
    setFailure("");
    try {
      const response = await fetch("/api/presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; code?: string; errors?: QuoteErrors; message?: string };

      if (response.ok && data.ok) {
        track("quote_form_submit", { source, need: values.need, professional: values.professionalType || "n/d" });
        setStatus("sent");
        return;
      }
      if (response.status === 422 && data.errors) {
        setErrors(data.errors);
        focusFirstError(data.errors);
        setStatus("idle");
        return;
      }
      setFailure(data.code ?? "failed");
      setStatus("error");
      track("quote_form_error", { source, code: data.code ?? "failed" });
    } catch {
      setFailure("network");
      setStatus("error");
      track("quote_form_error", { source, code: "network" });
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-line-strong p-8 md:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
          <Check className="size-6" />
        </span>
        <h3 className="t-h3 mt-6">{successTitle}</h3>
        <p className="t-lead mt-3 max-w-[34rem]">
          Gracias, {values.name.split(" ")[0]}. Te responderemos lo antes posible al correo {values.email}.
        </p>
        <p className="t-body mt-6">¿Prefieres hablar ahora con un especialista?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="btn btn-sm" href={whatsappUrl()} target="_blank" rel="noopener noreferrer" data-cta="quote-sent-whatsapp">
            <WhatsApp className="size-4" /> <span>WhatsApp</span>
          </a>
          <a className="btn btn-sm" href={telUrl()} data-cta="quote-sent-phone">
            <span>Llamar</span>
          </a>
        </div>
      </div>
    );
  }

  const errorSummary = Object.values(errors).filter(Boolean) as string[];

  return (
    <form ref={formRef} onSubmit={onSubmit} onFocusCapture={onFirstTouch} noValidate aria-describedby={id("trust")} className="flex flex-col gap-5">
      {errorSummary.length > 0 ? (
        <div role="alert" className="rounded-xl border border-[color:var(--danger)] p-4 text-sm text-[color:var(--danger)]">
          <p className="font-semibold">Revisa {errorSummary.length === 1 ? "este campo" : "estos campos"}:</p>
          <ul className="mt-1 list-disc pl-5">
            {errorSummary.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={`grid gap-5 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        <Field label="Nombre" id={id("name")} error={errors.name} required>
          <input
            id={id("name")}
            data-field="name"
            className="input"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id("name")}-err` : undefined}
          />
        </Field>

        <Field label="Clínica / empresa" id={id("company")}>
          <input
            id={id("company")}
            className="input"
            name="organization"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </Field>

        <Field label="Email" id={id("email")} error={errors.email} required>
          <input
            id={id("email")}
            data-field="email"
            className="input"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id("email")}-err` : undefined}
          />
        </Field>

        <Field label="Teléfono" id={id("phone")} error={errors.phone}>
          <input
            id={id("phone")}
            data-field="phone"
            className="input"
            type="tel"
            name="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${id("phone")}-err` : undefined}
          />
        </Field>

        <Field label="Provincia" id={id("province")}>
          <select id={id("province")} className="input" name="province" autoComplete="address-level1" value={values.province} onChange={(e) => set("province", e.target.value)}>
            <option value="">Selecciona</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tipo de profesional" id={id("pro")} error={errors.professionalType}>
          <select
            id={id("pro")}
            data-field="professionalType"
            className="input"
            name="professional"
            value={values.professionalType}
            onChange={(e) => set("professionalType", e.target.value)}
            aria-invalid={Boolean(errors.professionalType)}
          >
            <option value="">Selecciona</option>
            {professionalTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {lockedNeed ? null : (
      <fieldset className="field" aria-describedby={errors.need ? `${id("need")}-err` : undefined}>
        <legend>
          ¿Qué necesitas? <span aria-hidden="true">*</span>
        </legend>
        <div className="mt-1 flex flex-wrap gap-2" role="radiogroup" aria-label="¿Qué necesitas?" aria-required="true">
          {needOptions.map((option, index) => (
            <label key={option.value} className="need-chip">
              <input
                type="radio"
                name="need"
                value={option.value}
                data-field={index === 0 ? "need" : undefined}
                checked={values.need === option.value}
                onChange={() => set("need", option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {errors.need ? <FieldError id={`${id("need")}-err`}>{errors.need}</FieldError> : null}
      </fieldset>
      )}

      <Field label="Mensaje" id={id("message")}>
        <textarea
          id={id("message")}
          className="input"
          name="message"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder={messagePlaceholder}
        />
      </Field>

      {/* Campo trampa: invisible para personas, tentador para bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar
          <input tabIndex={-1} autoComplete="off" name="company_website" value={values.honeypot ?? ""} onChange={(e) => set("honeypot", e.target.value)} />
        </label>
      </div>

      <div className="field">
        <label className="flex cursor-pointer items-start gap-3 text-sm normal-case tracking-normal text-muted" style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", letterSpacing: 0, textTransform: "none" }}>
          <input
            type="checkbox"
            data-field="privacy"
            checked={values.privacy}
            onChange={(e) => set("privacy", e.target.checked)}
            aria-required="true"
            aria-invalid={Boolean(errors.privacy)}
            aria-describedby={errors.privacy ? `${id("privacy")}-err` : undefined}
            className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
          />
          <span>
            He leído y acepto la{" "}
            <Link href="/politica-de-privacidad" className="text-fg underline underline-offset-4">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        {errors.privacy ? <FieldError id={`${id("privacy")}-err`}>{errors.privacy}</FieldError> : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-primary btn-lg" disabled={status === "sending"} data-cta={`form-submit-${source}`}>
          <span>{status === "sending" ? "Enviando…" : submitLabel}</span>
          <ArrowRight className="arrow" />
        </button>
        <p id={id("trust")} className="text-sm text-muted">
          Te responderemos lo antes posible. Presupuesto gratuito.
        </p>
      </div>

      <div aria-live="polite" className="min-h-0">
        {status === "error" ? (
          <div role="alert" className="rounded-xl border border-[color:var(--danger)] p-4 text-sm">
            <p className="font-semibold text-[color:var(--danger)]">
              {failure === "rate_limited"
                ? "Demasiados envíos seguidos. Inténtalo de nuevo en unos minutos."
                : failure === "not_configured"
                  ? "El envío online no está disponible en este momento."
                  : "No hemos podido enviar la solicitud."}
            </p>
            <p className="mt-1 text-muted">
              Puedes contactarnos directamente:{" "}
              <a className="text-fg underline underline-offset-4" href={whatsappUrl(quoteWhatsappText(values))} target="_blank" rel="noopener noreferrer" data-cta="form-error-whatsapp">
                WhatsApp
              </a>{" "}
              ·{" "}
              <a className="text-fg underline underline-offset-4" href={telUrl()} data-cta="form-error-phone">
                {contact.phone.display}
              </a>
            </p>
          </div>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  required,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? <FieldError id={`${id}-err`}>{error}</FieldError> : null}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="field-error">
      <span aria-hidden="true">↳</span>
      {children}
    </p>
  );
}
