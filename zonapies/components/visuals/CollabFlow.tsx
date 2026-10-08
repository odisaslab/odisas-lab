import { collaboration } from "@/data/pro";

/** PODÓLOGO → ZONA PIES → PACIENTE: la colaboración, con partículas que recorren las líneas. */
export function CollabFlow() {
  return (
    <figure className="reg relative mt-14 overflow-hidden rounded-3xl border border-line bg-surface-2/50 px-5 py-10 md:px-12 md:py-14">
      <span className="reg-b" />
      <ol className="relative grid grid-cols-3 items-start gap-2 text-center">
        {collaboration.map((node, index) => (
          <li key={node.id} className="relative flex flex-col items-center">
            <span
              className={`relative z-10 grid size-16 place-items-center rounded-full border md:size-24 ${
                node.id === "zonapies" ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-surface text-fg"
              }`}
            >
              <svg viewBox="0 0 48 48" className="size-7 md:size-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {node.id === "podologo" ? (
                  <>
                    <circle cx="24" cy="15" r="7" />
                    <path d="M10 41c0-8 6-13 14-13s14 5 14 13" />
                    <path d="M18 30v5M30 30v5" opacity="0.5" />
                  </>
                ) : node.id === "zonapies" ? (
                  <>
                    <path d="M6 18 24 10l18 8-18 8z" />
                    <path d="m6 26 18 8 18-8M6 34l18 8 18-8" />
                  </>
                ) : (
                  <>
                    <path d="M24 5c9 0 14 6 13 15-1 8-5 11-5 17 0 4-3 6-8 6s-8-2-8-6c0-6-4-9-5-17-1-9 4-15 13-15Z" />
                  </>
                )}
              </svg>
              {node.id === "zonapies" ? <span aria-hidden="true" className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/30 motion-reduce:hidden" /> : null}
            </span>
            <p className="t-h3 mt-5">{node.label}</p>
            <p className="hud mt-2 text-muted">{node.action}</p>

            {index < collaboration.length - 1 ? (
              <span aria-hidden="true" className="absolute left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] top-8 z-0 h-px bg-line-strong md:left-[calc(50%+3.6rem)] md:right-[calc(-50%+3.6rem)] md:top-12">
                <span className="collab-dot absolute -top-[3px] block size-[7px] rounded-full bg-accent" style={{ animationDelay: `${index * 1.1}s` }} />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <figcaption className="sr-only">El podólogo prescribe, Zona Pies diseña y fabrica, el paciente recibe la solución.</figcaption>
    </figure>
  );
}
