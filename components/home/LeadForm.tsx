"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { NEED_EVENT, PREFILL_EVENT } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { form as copy } from "@/data/home";
import { contact, telLink, whatsappLink } from "@/data/site";
import {
  needOptions,
  validateContact,
  whatsappText,
  type ContactErrors,
  type ContactPayload,
} from "@/lib/contact";

const empty: ContactPayload = {
  name: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  need: "",
  budget: "",
  message: "",
  privacy: false,
  honeypot: "",
};

/** Qué campos valida cada paso */
const stepFields: (keyof ContactPayload)[][] = [["need"], ["message"], ["name", "email", "phone", "privacy"]];

type Status = "idle" | "sending" | "sent" | "failed";

export function LeadForm({ titleAs = "h2" }: { titleAs?: "h1" | "h2" }) {
  const showIntro = true;
  const uid = useId();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ContactPayload>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  const set = <K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) => {
    setData((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous));
  };

  // Los botones "Quiero…" de toda la web preseleccionan la necesidad
  useEffect(() => {
    const onNeed = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (needOptions.includes(value)) {
        setData((previous) => ({ ...previous, need: value }));
        setErrors((previous) => ({ ...previous, need: undefined }));
      }
    };
    // El diagnóstico rellena también el mensaje, para que el visitante solo tenga que revisarlo
    const onPrefill = (event: Event) => {
      const detail = (event as CustomEvent<{ need?: string; message?: string }>).detail ?? {};
      setData((previous) => ({
        ...previous,
        need: detail.need && needOptions.includes(detail.need) ? detail.need : previous.need,
        message: previous.message.trim() ? previous.message : (detail.message ?? previous.message),
      }));
      setStep(0);
    };
    window.addEventListener(NEED_EVENT, onNeed);
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => {
      window.removeEventListener(NEED_EVENT, onNeed);
      window.removeEventListener(PREFILL_EVENT, onPrefill);
    };
  }, []);

  // Al cambiar de paso, el foco va al título del paso (teclado y lector de pantalla)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
  }, [step, status]);

  const validateStep = (index: number) => {
    const all = validateContact(data);
    const own: ContactErrors = {};
    stepFields[index].forEach((key) => {
      if (all[key]) own[key] = all[key];
    });
    setErrors(own);
    const firstKey = Object.keys(own)[0];
    if (firstKey) document.getElementById(`${uid}-${firstKey}`)?.focus();
    return Object.keys(own).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((value) => Math.min(value + 1, 2));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < 2) {
      next();
      return;
    }
    if (!validateStep(2)) return;

    setStatus("sending");
    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        setStatus("sent");
        return;
      }
      if (result.code === "invalid" && result.errors) {
        setErrors(result.errors as ContactErrors);
        setStatus("idle");
        return;
      }
      setServerMessage(
        result.code === "rate_limited"
          ? "Has enviado varios mensajes seguidos. Espera unos minutos o escríbenos por WhatsApp."
          : "No hemos podido enviar tu solicitud desde aquí. Puedes mandárnosla por WhatsApp o email con un clic y ya va rellena.",
      );
      setStatus("failed");
    } catch {
      setServerMessage(
        "No hay conexión con el servidor. Puedes mandarnos tu solicitud por WhatsApp o email con un clic.",
      );
      setStatus("failed");
    }
  };

  const err = (key: keyof ContactPayload) => errors[key];
  const describedBy = (key: keyof ContactPayload) => (errors[key] ? `${uid}-${key}-err` : undefined);
  const waHref = whatsappLink ? `${whatsappLink}?text=${encodeURIComponent(whatsappText(data))}` : "";
  const mailHref = contact.email
    ? `mailto:${contact.email}?subject=${encodeURIComponent(`Solicitud web · ${data.need || "Análisis de mi negocio"}`)}&body=${encodeURIComponent(
        `${whatsappText(data)}\n\nEmail: ${data.email}\nTeléfono: ${data.phone}`,
      )}`
    : "";

  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="sec tone-dark">
      <div className="wrap grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {showIntro ? (
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow accent mb-6" data-reveal>
              {copy.eyebrow}
            </p>
            <Split as={titleAs} id="contacto-titulo" className="t-h2" text={copy.title} />
            <p className="t-lead muted mt-6 max-w-md" data-reveal>
              {copy.text}
            </p>
            <ul className="mt-10 flex flex-col gap-4" data-reveal>
              {whatsappLink ? (
                <li>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-3 text-cream">
                    <MessageCircle aria-hidden="true" className="size-5 text-primary" strokeWidth={1.6} />
                    Escríbenos por WhatsApp
                  </a>
                </li>
              ) : null}
              {telLink ? (
                <li>
                  <a href={telLink} className="link-underline inline-flex items-center gap-3 text-cream">
                    <Phone aria-hidden="true" className="size-5 text-primary" strokeWidth={1.6} />
                    {contact.phoneDisplay}
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className="link-underline inline-flex items-center gap-3 text-cream">
                    <Mail aria-hidden="true" className="size-5 text-primary" strokeWidth={1.6} />
                    {contact.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ) : (
          <h2 id="contacto-titulo" className="sr-only">
            Formulario de contacto
          </h2>
        )}

        <div
          data-reveal
          className={`rounded-[24px] border border-hair bg-ink-2 p-6 md:p-10 ${showIntro ? "" : "lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-2xl"}`}
        >
          {status === "sent" ? (
            <div role="status">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-ink">
                <Check aria-hidden="true" className="size-6" strokeWidth={2.5} />
              </span>
              <h3 ref={heading} tabIndex={-1} className="t-h3 mt-6 outline-none">
                Recibido. Gracias{data.name ? `, ${data.name.split(" ")[0]}` : ""}.
              </h3>
              <p className="muted mt-3">
                Revisamos tu situación antes de contestar y te respondemos en menos de 24 horas
                laborables. Si es urgente, escríbenos por WhatsApp.
              </p>
              {whatsappLink ? (
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light mt-8">
                  <MessageCircle aria-hidden="true" className="size-5" />
                  Adelantar por WhatsApp
                </a>
              ) : null}
            </div>
          ) : status === "failed" ? (
            <div role="alert">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <AlertCircle aria-hidden="true" className="size-6" />
              </span>
              <h3 ref={heading} tabIndex={-1} className="t-h3 mt-6 outline-none">
                Casi. Falta un último paso.
              </h3>
              <p className="muted mt-3">{serverMessage}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {waHref ? (
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    <MessageCircle aria-hidden="true" className="size-5" />
                    Enviar por WhatsApp
                  </a>
                ) : null}
                {mailHref ? (
                  <a href={mailHref} className="btn btn-ghost-light">
                    <Mail aria-hidden="true" className="size-5" />
                    Enviar por email
                  </a>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="muted mt-6 text-[0.9rem] underline underline-offset-4"
              >
                Volver al formulario
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate aria-describedby={`${uid}-paso`}>
              <div className="mb-8">
                <p id={`${uid}-paso`} className="mono muted mb-3 text-[0.7rem] tracking-[0.16em] uppercase">
                  Paso {step + 1} de 3
                </p>
                <div className="flex gap-2" aria-hidden="true">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className={`h-[3px] flex-1 rounded transition-colors duration-500 ${index <= step ? "bg-primary" : "bg-hair"}`}
                    />
                  ))}
                </div>
              </div>

              {step === 0 ? (
                <fieldset>
                  <legend className="sr-only">¿Qué necesitas mejorar?</legend>
                  <h3 ref={heading} tabIndex={-1} className="t-h3 mb-6 outline-none">
                    ¿Qué necesitas mejorar?
                  </h3>
                  <div
                    role="radiogroup"
                    aria-label="¿Qué necesitas mejorar?"
                    aria-describedby={describedBy("need")}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {copy.needs.map((option, index) => (
                      <label key={option.value} className="choice">
                        <input
                          id={index === 0 ? `${uid}-need` : undefined}
                          type="radio"
                          name="need"
                          value={option.value}
                          checked={data.need === option.value}
                          onChange={() => set("need", option.value)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${data.need === option.value ? "border-primary" : "border-cream/40"}`}
                        >
                          {data.need === option.value ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                        </span>
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {err("need") ? (
                    <p id={`${uid}-need-err`} role="alert" className="mt-3 text-[0.9rem] text-[#ff8a5c]">
                      {err("need")}
                    </p>
                  ) : null}
                </fieldset>
              ) : null}

              {step === 1 ? (
                <div>
                  <h3 ref={heading} tabIndex={-1} className="t-h3 mb-6 outline-none">
                    <label htmlFor={`${uid}-message`}>Cuéntanos brevemente tu situación.</label>
                  </h3>
                  <textarea
                    id={`${uid}-message`}
                    rows={6}
                    value={data.message}
                    onChange={(event) => set("message", event.target.value)}
                    aria-invalid={Boolean(err("message"))}
                    aria-describedby={describedBy("message")}
                    placeholder="A qué te dedicas, qué quieres conseguir y qué crees que está fallando."
                    className="field resize-y"
                  />
                  {err("message") ? (
                    <p id={`${uid}-message-err`} role="alert" className="mt-3 text-[0.9rem] text-[#ff8a5c]">
                      {err("message")}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <h3 ref={heading} tabIndex={-1} className="t-h3 mb-6 outline-none">
                    ¿Dónde te respondemos?
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id={`${uid}-name`} label="Nombre" error={err("name")} errId={`${uid}-name-err`} required>
                      <input
                        id={`${uid}-name`}
                        type="text"
                        autoComplete="name"
                        value={data.name}
                        onChange={(event) => set("name", event.target.value)}
                        aria-invalid={Boolean(err("name"))}
                        aria-describedby={describedBy("name")}
                        className="field"
                      />
                    </Field>
                    <Field id={`${uid}-company`} label="Empresa">
                      <input
                        id={`${uid}-company`}
                        type="text"
                        autoComplete="organization"
                        value={data.company}
                        onChange={(event) => set("company", event.target.value)}
                        className="field"
                      />
                    </Field>
                    <Field id={`${uid}-phone`} label="Teléfono" error={err("phone")} errId={`${uid}-phone-err`}>
                      <input
                        id={`${uid}-phone`}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={data.phone}
                        onChange={(event) => set("phone", event.target.value)}
                        aria-invalid={Boolean(err("phone"))}
                        aria-describedby={describedBy("phone")}
                        className="field"
                      />
                    </Field>
                    <Field id={`${uid}-email`} label="Email" error={err("email")} errId={`${uid}-email-err`} required>
                      <input
                        id={`${uid}-email`}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(event) => set("email", event.target.value)}
                        aria-invalid={Boolean(err("email"))}
                        aria-describedby={describedBy("email")}
                        className="field"
                      />
                    </Field>
                  </div>

                  {/* Campo trampa para bots */}
                  <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor={`${uid}-hp`}>No rellenar</label>
                    <input
                      id={`${uid}-hp`}
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={data.honeypot}
                      onChange={(event) => set("honeypot", event.target.value)}
                    />
                  </div>

                  <div className="mt-6 flex items-start gap-3">
                    <input
                      id={`${uid}-privacy`}
                      type="checkbox"
                      checked={data.privacy}
                      onChange={(event) => set("privacy", event.target.checked)}
                      aria-invalid={Boolean(err("privacy"))}
                      aria-describedby={describedBy("privacy")}
                      className="mt-1 size-5 shrink-0 accent-[var(--color-primary)]"
                    />
                    <label htmlFor={`${uid}-privacy`} className="muted text-[0.88rem]">
                      Acepto que Odisas Lab trate mis datos para responder a esta solicitud. Más información en la{" "}
                      <a href="/politica-de-privacidad" className="text-cream underline underline-offset-4">
                        política de privacidad
                      </a>
                      .
                    </label>
                  </div>
                  {err("privacy") ? (
                    <p id={`${uid}-privacy-err`} role="alert" className="mt-2 text-[0.9rem] text-[#ff8a5c]">
                      {err("privacy")}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="muted inline-flex min-h-12 items-center justify-center gap-2 px-2 text-[0.95rem] hover:text-cream"
                  >
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Atrás
                  </button>
                ) : (
                  <span />
                )}

                {step < 2 ? (
                  <button type="button" onClick={next} className="btn btn-primary">
                    Continuar
                    <ArrowRight aria-hidden="true" className="arrow size-[1.05em]" />
                  </button>
                ) : (
                  <button type="submit" disabled={status === "sending"} className="btn btn-primary disabled:opacity-60">
                    {status === "sending" ? (
                      <>
                        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        {copy.submit}
                        <ArrowRight aria-hidden="true" className="arrow size-[1.05em]" />
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="muted mt-5 text-[0.82rem]">
                Sin compromiso. Respondemos en menos de 24 horas laborables.
              </p>
              <p aria-live="polite" className="sr-only">
                {status === "sending" ? "Enviando el formulario" : ""}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  error,
  errId,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  errId?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[0.9rem] text-cream">
        {label}
        {required ? <span className="accent"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={errId} role="alert" className="mt-2 text-[0.88rem] text-[#ff8a5c]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
