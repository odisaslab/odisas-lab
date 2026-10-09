"use client";

import { useMemo } from "react";
import { buildFootMesh } from "@/lib/geometry";
import { useDemo, useTourControls } from "@/lib/store";
import { FootFallback } from "../three/ViewerParts";
import { Card, Eyebrow, Icon, btn } from "../ui";

function Bubble({ me, children }: { me?: boolean; children: React.ReactNode }) {
  return (
    <p className={`max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${me ? "ml-auto rounded-br-md bg-[#d8f0e5] text-[#0b3b30]" : "mr-auto rounded-bl-md bg-bone-100 text-fg"}`}>
      {children}
    </p>
  );
}

export function Inicio() {
  const { dispatch } = useDemo();
  const { goto } = useTourControls();
  const hole = useMemo(() => buildFootMesh("derecho", { holeHeel: true }).hole, []);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:py-14">
      <Eyebrow>Demo navegable · app «Casos» · Zona Pies</Eyebrow>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        Un revisor a la puerta del laboratorio.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Comprueba que cada caso llega completo y bien hecho antes de ponerse a fabricar, y ayuda a diseñar la plantilla.
        Lo que vas a ver es una maqueta con datos simulados: la propia demo te dice en todo momento qué es real y qué no.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className={btn("primary", "lg")} onClick={() => goto(0)} data-testid="start-tour">
          <Icon name="play" /> Empezar la presentación guiada
        </button>
        <button type="button" className={btn("ghost", "lg")} onClick={() => dispatch({ type: "view", view: "profesional" })} data-testid="explore">
          Explorar por mi cuenta
        </button>
      </div>

      <section
        data-tour="intro-problema"
        aria-labelledby="problema-h"
        className="mt-14 rounded-3xl border border-line bg-white p-5 sm:p-8"
      >
        <Eyebrow>El problema de hoy</Eyebrow>
        <h2 id="problema-h" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Un caso viaja entre la clínica y el laboratorio… y se pierde tiempo por el camino.
        </h2>
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="flex flex-col gap-3">
            <div className="grid flex-1 content-start gap-1.5 rounded-2xl border border-line bg-bone-50 p-3" aria-hidden="true">
              <Bubble me>Os paso un caso: J.M., 82 kg, pádel, le duele el talón…</Bubble>
              <Bubble>¿Qué pie era?</Bubble>
              <Bubble me>El derecho. Talla 42.</Bubble>
              <Bubble>El escaneo viene con un hueco…</Bubble>
            </div>
            <p className="text-sm leading-snug">
              <b>1 · Llega por WhatsApp, correo o teléfono</b>, a trozos y sin un formato común.
            </p>
          </li>
          <li className="flex flex-col gap-3">
            <div className="grid flex-1 place-items-center overflow-hidden rounded-2xl bg-ink-900" aria-hidden="true">
              <div className="h-48">
                <FootFallback side="derecho" hole={hole} label="Pie con un hueco bajo el talón" />
              </div>
            </div>
            <p className="text-sm leading-snug">
              <b>2 · El escaneo sale mal</b> y el laboratorio lo descubre al recibirlo.
            </p>
          </li>
          <li className="flex flex-col gap-3">
            <div className="flex flex-1 flex-col justify-center gap-2 rounded-2xl border border-line bg-bone-50 p-4 text-sm" aria-hidden="true">
              {["Llamada al paciente", "Vuelve a la consulta", "Nuevo escaneo"].map((t, i) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-ink-900 font-mono text-[11px] text-signal">{i + 1}</span>
                  <span className="rounded-lg bg-white px-3 py-1.5 shadow-sm">{t}</span>
                </div>
              ))}
            </div>
            <p className="text-sm leading-snug">
              <b>3 · El paciente tiene que volver</b> a la consulta para repetirlo.
            </p>
          </li>
          <li className="flex flex-col gap-3">
            <div className="flex flex-1 flex-col justify-center gap-3 rounded-2xl border border-line bg-bone-50 p-4" aria-hidden="true">
              <div className="flex h-5 overflow-hidden rounded-full">
                <span className="w-1/4 bg-brand" />
                <span className="w-1/4 bg-signal-dim" />
                <span className="w-1/4 bg-amber-300" />
                <span className="w-1/4 bg-[repeating-linear-gradient(135deg,#f4b9b9_0_6px,#fde4e4_6px_12px)]" />
              </div>
              <p className="text-xs text-muted">Plazo prometido ▸ plazo real…</p>
            </div>
            <p className="text-sm leading-snug">
              <b>4 · El plazo prometido se estira</b> sin que nadie lo vea hasta que ya pasó.
            </p>
          </li>
        </ol>
        <p className="mt-6 rounded-xl bg-bone-100 px-4 py-3 text-sm text-muted">
          Estas cuatro escenas son una hipótesis a confirmar con vosotros, no una medición. Sin cifras: no las tenemos.
        </p>
      </section>

      <section aria-labelledby="vistas-h" className="mt-12">
        <h2 id="vistas-h" className="text-xl font-semibold tracking-tight">
          Tres vistas, un mismo caso
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">Lo que hagas en una vista aparece en las otras.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(
            [
              ["profesional", "Profesional", "El podólogo crea el caso desde el móvil y recibe el semáforo del escaneo al instante.", "camera"],
              ["laboratorio", "Laboratorio", "El técnico ve los casos ordenados, acepta la especificación y revisa el diseño de la plantilla.", "flask"],
              ["dueno", "Dueño", "Un panel con lo que hoy no se puede medir: casos correctos a la primera y dónde se pierde el tiempo.", "eye"],
            ] as const
          ).map(([id, title, text, icon]) => (
            <Card key={id} className="flex flex-col gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-bone-100 text-brand">
                <Icon name={icon} className="size-5" />
              </span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-muted">{text}</p>
              <button type="button" className={btn("ghost", "sm")} onClick={() => dispatch({ type: "view", view: id })}>
                Abrir vista <Icon name="arrow" className="size-3.5" />
              </button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
