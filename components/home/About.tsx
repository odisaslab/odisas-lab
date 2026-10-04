import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Split } from "@/components/motion/Split";
import { about } from "@/data/home";
import { assets } from "@/data/site";

/** Humaniza la marca: una persona, una línea directa. No es un CV. */
export function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="sec tone-light">
      <div className="wrap">
        <p className="eyebrow accent mb-6" data-reveal>
          {about.eyebrow}
        </p>
        <h2 id="sobre-titulo" className="t-h2 max-w-[18ch]">
          <Split as="span" text={about.title} />
          <br />
          <Split as="span" text={about.title2} />
        </h2>

        <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <div className="flex flex-col gap-5" data-reveal-stagger>
              {about.text.map((paragraph) => (
                <p key={paragraph.slice(0, 20)} className="t-lead max-w-xl">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* La diferencia, dibujada: cuántos intermediarios hay entre tú y quien trabaja */}
            <div className="mt-12 flex flex-col gap-6" data-reveal>
              <div>
                <p className="mono muted mb-3 text-[0.68rem] tracking-[0.16em] uppercase">
                  Una agencia grande
                </p>
                <ol className="flex flex-wrap items-center gap-2 text-[0.85rem]">
                  {about.chainBig.map((item, index) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="rounded-full border border-hair-ink px-3 py-1.5 text-mute-ink">
                        {item}
                      </span>
                      {index < about.chainBig.length - 1 ? (
                        <span aria-hidden="true" className="text-mute-ink">
                          →
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="mono accent mb-3 text-[0.68rem] tracking-[0.16em] uppercase">Odisas Lab</p>
                <ol className="flex flex-wrap items-center gap-2 text-[0.85rem]">
                  {about.chainSmall.map((item, index) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="rounded-full bg-ink px-4 py-2 text-cream">{item}</span>
                      {index < about.chainSmall.length - 1 ? (
                        <span aria-hidden="true" className="h-px w-12 bg-primary" />
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-10" data-reveal>
              <Link href="/sobre-odisas-lab" className="link-underline inline-flex items-center gap-2">
                {about.link}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {assets.portrait ? (
              <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[20px]">
                <Image
                  src={assets.portrait}
                  alt={assets.portraitAlt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <dl>
              {about.pillars.map((pillar, index) => (
                <div key={pillar.title} data-reveal className="hair-t flex gap-6 py-7 last:border-b last:border-hair-ink">
                  <dt className="mono accent w-8 shrink-0 pt-1.5 text-[0.75rem]">0{index + 1}</dt>
                  <dd>
                    <p className="t-h3 uppercase">{pillar.title}</p>
                    <p className="muted mt-2 max-w-sm">{pillar.text}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
