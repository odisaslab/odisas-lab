/**
 * Oreja en línea con puntos de joyería (diseño de oreja). viewBox 0 0 400 560.
 * La «composición» se construye colocando joyas en estos puntos.
 */
export const EAR_VIEWBOX = '0 0 400 560';

export const EAR_STUDS = [
  { id: 'helix-1', x: 286, y: 84, r: 9 },
  { id: 'helix-2', x: 340, y: 150, r: 7 },
  { id: 'helix-3', x: 360, y: 232, r: 6 },
  { id: 'forward', x: 168, y: 156, r: 6 },
  { id: 'conch', x: 236, y: 262, r: 8 },
  { id: 'tragus', x: 148, y: 318, r: 6 },
  { id: 'lobe-1', x: 258, y: 458, r: 11 },
  { id: 'lobe-2', x: 226, y: 500, r: 8 },
];

export const EAR_PATHS = {
  outer: 'M214 34 C318 30 388 110 372 232 C362 306 326 350 308 412 C294 466 262 534 208 530 C164 526 154 488 168 450 C176 424 160 396 140 360 C112 308 96 242 112 160 C128 84 166 38 214 34Z',
  inner: 'M262 96 C330 130 340 236 288 312 C262 350 250 380 246 418',
  conch: 'M196 196 C246 200 270 244 252 292 C236 332 190 330 170 300 C150 270 158 214 196 196Z',
  tragus: 'M128 292 C136 262 166 262 172 288 C176 312 150 330 134 318',
  lobe: 'M178 420 C198 446 232 448 258 428',
};

/** Marcado de la oreja con las joyas `data-stud` (su aparición se anima). */
export function earMarkup(uid) {
  const studs = EAR_STUDS.map(
    (s) => `<g class="ear-stud" data-stud="${s.id}" transform="translate(${s.x} ${s.y})">
      <circle class="es-halo" r="${s.r * 2.4}" fill="url(#eh-${uid})" opacity="0"/>
      <circle class="es-body" r="${s.r}" fill="url(#ej-${uid})" stroke="#3a3f4f" stroke-width=".8"/>
      <circle class="es-spec" cx="${-s.r * 0.32}" cy="${-s.r * 0.34}" r="${s.r * 0.26}" fill="#fff" opacity=".9"/>
    </g>`,
  ).join('');
  return `<g class="ear-art" data-uid="${uid}">
    <defs>
      <radialGradient id="ej-${uid}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#cfd3df"/><stop offset=".72" stop-color="#7c8294"/><stop offset="1" stop-color="#3c4252"/></radialGradient>
      <radialGradient id="eh-${uid}"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <g class="ear-lines" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path class="ear-p" d="${EAR_PATHS.outer}" pathLength="1"/>
      <path class="ear-p" d="${EAR_PATHS.inner}" pathLength="1" opacity=".75"/>
      <path class="ear-p" d="${EAR_PATHS.conch}" pathLength="1" opacity=".6"/>
      <path class="ear-p" d="${EAR_PATHS.tragus}" pathLength="1" opacity=".6"/>
      <path class="ear-p" d="${EAR_PATHS.lobe}" pathLength="1" opacity=".5"/>
    </g>
    ${studs}
  </g>`;
}
