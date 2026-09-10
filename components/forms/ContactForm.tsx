"use client";

import { useId, useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contact, telLink, whatsappLink } from "@/data/site";
import {
  budgetOptions,
  hasErrors,
  needOptions,
  validateContact,
  type ContactErrors,
  type ContactPayload,
} from "@/lib/contact";

const emptyForm: ContactPayload = {
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

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[0.95rem] text-text transition-colors placeholder:text-gray hover:border-dark/25 focus:border-primary focus:outline-none";
const labelClass = "mb-2 block text-[0.9rem] font-medium text-dark";

export function ContactForm() {
  const formId = useId();
  const [form, setForm] = useState<ContactPayload>(emptyForm);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");

  const update = <K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) {
      setErrors((previous) => ({ ...previous, [key]: undefined }));
    }
  };

  const errorId = (key: keyof ContactPayload) => `${formId}-${key}-error`;

  const describedBy = (key: keyof ContactPayload) =>
    errors[key] ? errorId(key) : undefined;

  const handleSubmit = async () => {
    const nextErrors = validateContact(form);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setStatus("idle");
      const firstKey = Object.keys(nextErrors)[0];
      document.getElementById(`${formId}-${firstKey}`)?.focus();
      return;
    }

    setStatus("sending");
    setServerMessage("");

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        setStatus("sent");
        setForm(emptyForm);
        return;
      }

      if (result.code === "invalid" && result.errors) {
        setErrors(result.errors as ContactErrors);
        setStatus("idle");
        return;
      }

      setStatus("error");
      setServerMessage(
        result.code === "rate_limited"
          ? "Has enviado varios mensajes seguidos. Espera unos minutos e inténtalo otra vez."
          : "No hemos podido enviar el mensaje. Escríbenos directamente y lo resolvemos igual de rápido.",
      );
    } catch {
      setStatus("error");
      setServerMessage(
        "No hay conexión con el servidor. Comprueba tu red o escríbenos directamente.",
      );
    }
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-card)] border border-line bg-white p-8 md:p-10"
      >
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary-soft">
          <Check aria-hidden="true" className="size-5 text-primary" />
        </span>
        <h2 className="mt-6 text-h3 font-semibold">Mensaje enviado</h2>
        <p className="mt-3 text-gray">
          Lo revisamos y te respondemos en menos de 24 horas laborables. Si es urgente,
          llámanos o escríbenos por WhatsApp.
        </p>
        <div className="mt-8">
          <Button variant="outline" onClick={() => setStatus("idle")}>
            Enviar otro mensaje
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 md:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-name`} className={labelClass}>
            Nombre <span className="text-primary-ink">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={fieldClass}
            placeholder="Alejandro Sánchez"
          />
          <FieldError id={errorId("name")} message={errors.name} />
        </div>

        <div>
          <label htmlFor={`${formId}-company`} className={labelClass}>
            Empresa
          </label>
          <input
            id={`${formId}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            className={fieldClass}
            placeholder="Nombre de tu negocio"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className={labelClass}>
            Email <span className="text-primary-ink">*</span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={fieldClass}
            placeholder="tu@empresa.com"
          />
          <FieldError id={errorId("email")} message={errors.email} />
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className={labelClass}>
            Teléfono
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            className={fieldClass}
            placeholder="600 00 00 00"
          />
          <FieldError id={errorId("phone")} message={errors.phone} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-website`} className={labelClass}>
            Web actual
          </label>
          <input
            id={`${formId}-website`}
            name="website"
            type="text"
            inputMode="url"
            autoComplete="url"
            value={form.website}
            onChange={(event) => update("website", event.target.value)}
            className={fieldClass}
            placeholder="tuweb.com · déjalo vacío si todavía no tienes"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-need`} className={labelClass}>
            ¿Qué necesitas? <span className="text-primary-ink">*</span>
          </label>
          <select
            id={`${formId}-need`}
            name="need"
            required
            value={form.need}
            onChange={(event) => update("need", event.target.value)}
            aria-invalid={Boolean(errors.need)}
            aria-describedby={describedBy("need")}
            className={fieldClass}
          >
            <option value="">Selecciona una opción</option>
            {needOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError id={errorId("need")} message={errors.need} />
        </div>

        <div>
          <label htmlFor={`${formId}-budget`} className={labelClass}>
            Presupuesto aproximado
          </label>
          <select
            id={`${formId}-budget`}
            name="budget"
            value={form.budget}
            onChange={(event) => update("budget", event.target.value)}
            className={fieldClass}
          >
            <option value="">Prefiero no indicarlo</option>
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-message`} className={labelClass}>
            Mensaje <span className="text-primary-ink">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={5}
            required
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy("message")}
            className={`${fieldClass} resize-y`}
            placeholder="Cuéntanos qué quieres mejorar, qué has probado ya y qué te gustaría conseguir."
          />
          <FieldError id={errorId("message")} message={errors.message} />
        </div>
      </div>

      {/* Campo trampa para bots: oculto y fuera del recorrido de teclado */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${formId}-website-alt`}>No rellenar</label>
        <input
          id={`${formId}-website-alt`}
          name="website_alt"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(event) => update("honeypot", event.target.value)}
        />
      </div>

      <div className="mt-7 border-t border-line pt-7">
        <div className="flex items-start gap-3">
          <input
            id={`${formId}-privacy`}
            name="privacy"
            type="checkbox"
            checked={form.privacy}
            onChange={(event) => update("privacy", event.target.checked)}
            aria-invalid={Boolean(errors.privacy)}
            aria-describedby={describedBy("privacy")}
            className="mt-1 size-4 shrink-0 accent-[var(--color-primary)]"
          />
          <label htmlFor={`${formId}-privacy`} className="text-[0.9rem] text-gray">
            He leído y acepto el tratamiento de mis datos para recibir respuesta a esta
            solicitud. <span className="text-primary-ink">*</span>
          </label>
        </div>
        <FieldError id={errorId("privacy")} message={errors.privacy} />

        <details className="mt-4">
          <summary className="cursor-pointer text-[0.85rem] text-gray underline">
            Información básica sobre protección de datos
          </summary>
          <div className="mt-3 space-y-2 text-[0.85rem] text-gray">
            <p>
              <strong className="font-medium text-dark">Responsable:</strong>{" "}
              {contact.email ? `Odisas Lab · ${contact.email}` : "Odisas Lab"}
            </p>
            <p>
              <strong className="font-medium text-dark">Finalidad:</strong> responder tu
              solicitud y, si hay interés, enviarte una propuesta.
            </p>
            <p>
              <strong className="font-medium text-dark">Conservación:</strong> mientras se
              mantenga la relación comercial o hasta que solicites la supresión.
            </p>
            <p>
              <strong className="font-medium text-dark">Derechos:</strong> acceso,
              rectificación, supresión, oposición, limitación y portabilidad, escribiendo
              al email indicado.
            </p>
            <p>
              <strong className="font-medium text-dark">Cesiones:</strong> ninguna, salvo
              obligación legal.
            </p>
          </div>
        </details>
      </div>

      {status === "error" ? (
        <div
          role="alert"
          className="mt-6 flex gap-3 rounded-[10px] border border-primary/30 bg-primary-soft p-4 text-[0.9rem] text-dark"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p>{serverMessage}</p>
            <p className="mt-2">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="underline">
                  {contact.email}
                </a>
              ) : null}
              {contact.email && telLink ? <span aria-hidden="true"> · </span> : null}
              {telLink ? (
                <a href={telLink} className="underline">
                  {contact.phoneDisplay}
                </a>
              ) : null}
              {whatsappLink ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    WhatsApp
                  </a>
                </>
              ) : null}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={status === "sending"}
          withArrow={status !== "sending"}
        >
          {status === "sending" ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Enviando
            </>
          ) : (
            "Enviar solicitud"
          )}
        </Button>
        <p className="text-[0.85rem] text-gray">
          Respondemos en menos de 24 horas laborables.
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {status === "sending" ? "Enviando el formulario" : ""}
      </p>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-[0.85rem] text-primary-ink">
      {message}
    </p>
  );
}
