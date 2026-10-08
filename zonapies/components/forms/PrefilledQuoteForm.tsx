"use client";

import { useSearchParams } from "next/navigation";
import { needOptions, professionalTypes } from "@/data/quote";
import type { QuotePayload } from "@/lib/quote";
import { QuoteForm } from "./QuoteForm";

/**
 * Formulario de /contacto. Lee ?need=, ?pro= y ?msg= (enlaces del selector, el configurador
 * y los CTA) para llegar precargado. En un componente cliente para que la página siga siendo estática.
 */
export function PrefilledQuoteForm({ source = "contact-page" }: { source?: string }) {
  const params = useSearchParams();
  const prefill: Partial<QuotePayload> = {};

  const need = params.get("need");
  if (need && needOptions.some((option) => option.value === need)) prefill.need = need;
  const pro = params.get("pro");
  if (pro && professionalTypes.some((type) => type.value === pro)) prefill.professionalType = pro;
  const msg = params.get("msg");
  if (msg) prefill.message = msg.slice(0, 600);

  return <QuoteForm key={JSON.stringify(prefill)} source={source} prefill={prefill} />;
}
