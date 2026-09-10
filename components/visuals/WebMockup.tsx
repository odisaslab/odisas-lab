/**
 * Maquetas dibujadas con CSS para ilustrar el comparador antes/después
 * mientras no haya capturas reales de proyectos.
 * No representan la web de ningún cliente concreto.
 */

export function OldWebMockup() {
  return (
    <div
      aria-hidden="true"
      className="h-full w-full bg-[#dcdcd6] p-3 font-[Times_New_Roman,serif] text-[#1a1a5e]"
    >
      <div className="flex h-full w-full flex-col gap-2 border-2 border-[#9a9a92] bg-[#f1f1e9] p-3">
        <div className="flex items-center justify-between border-b-2 border-[#9a9a92] pb-2">
          <span className="text-[13px] font-bold underline">MI EMPRESA S.L.</span>
          <span className="flex gap-2 text-[8px]">
            <span className="underline">Inicio</span>
            <span className="underline">Quienes somos</span>
            <span className="underline">Servicios</span>
            <span className="underline">Contacto</span>
          </span>
        </div>

        <div className="bg-[#1a1a5e] py-2 text-center text-[9px] font-bold text-[#f7d200]">
          ¡¡ BIENVENIDOS A NUESTRA WEB !!
        </div>

        <div className="flex flex-1 gap-2 text-[7px] leading-[1.35]">
          <div className="flex-1 space-y-1">
            <p>
              Somos una empresa líder en el sector con más de 20 años de experiencia
              ofreciendo soluciones integrales a nuestros clientes.
            </p>
            <p>
              Nuestro equipo de profesionales altamente cualificados trabaja cada día
              para ofrecer el mejor servicio del mercado.
            </p>
            <p className="underline">Leer más...</p>
            <div className="mt-2 border border-[#9a9a92] bg-[#e4e4dc] p-1">
              <p className="font-bold">NOVEDADES</p>
              <p>Última actualización: 12/03/2014</p>
            </div>
          </div>
          <div className="w-[38%] space-y-1">
            <div className="grid h-14 place-items-center border border-[#9a9a92] bg-[#c9c9c1] text-[6px]">
              imagen1.jpg
            </div>
            <div className="border border-[#9a9a92] bg-[#e4e4dc] p-1 text-[6px]">
              <p className="font-bold">CONTACTO</p>
              <p>Tel: 91 000 00 00</p>
              <p>Fax: 91 000 00 01</p>
            </div>
            <div className="grid h-6 place-items-center bg-[#f7d200] text-[6px] font-bold text-[#1a1a5e]">
              VISITAS: 004821
            </div>
          </div>
        </div>

        <div className="border-t border-[#9a9a92] pt-1 text-center text-[6px]">
          Optimizado para Internet Explorer · Resolución 1024x768
        </div>
      </div>
    </div>
  );
}

export function NewWebMockup() {
  return (
    <div aria-hidden="true" className="h-full w-full bg-white p-3">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="font-[family-name:var(--font-display)] text-[11px] font-semibold text-dark">
            Mi Empresa
          </span>
          <span className="flex items-center gap-3 text-[7px] text-gray">
            <span>Servicios</span>
            <span>Proyectos</span>
            <span>Contacto</span>
            <span className="rounded-full bg-primary px-2 py-1 text-[7px] font-medium text-white">
              Hablemos
            </span>
          </span>
        </div>

        <div className="flex flex-1 gap-4 px-4 py-4">
          <div className="flex flex-[1.1] flex-col justify-center">
            <span className="mb-2 h-1 w-6 rounded-full bg-primary" />
            <p className="font-[family-name:var(--font-display)] text-[15px] leading-[1.15] font-semibold text-dark">
              Soluciones que hacen crecer tu negocio
            </p>
            <p className="mt-2 text-[7px] leading-[1.6] text-gray">
              Analizamos tu caso, diseñamos la estrategia y la ejecutamos. Con datos
              delante y sin promesas imposibles.
            </p>
            <div className="mt-3 flex gap-1.5">
              <span className="rounded-full bg-primary px-2.5 py-1 text-[7px] font-medium text-white">
                Empezar
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 text-[7px] text-dark">
                Ver más
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2">
            <div className="rounded-md border border-line p-2 shadow-[var(--shadow-card)]">
              <p className="text-[6px] text-gray">Contactos este mes</p>
              <p className="font-[family-name:var(--font-display)] text-[13px] font-semibold text-dark">
                48
              </p>
              <div className="mt-1.5 flex items-end gap-1">
                {[30, 45, 38, 60, 72, 90].map((height, index) => (
                  <span
                    key={index}
                    className={`w-full rounded-sm ${
                      index === 5 ? "bg-primary" : "bg-light"
                    }`}
                    style={{ height: `${height / 4}px` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-light px-2 py-1.5">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="text-[6px] text-gray">Carga en 0,9 s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[6px] text-gray">
          <span>Diseño responsive</span>
          <span>Accesible</span>
          <span>Optimizado para SEO</span>
        </div>
      </div>
    </div>
  );
}
