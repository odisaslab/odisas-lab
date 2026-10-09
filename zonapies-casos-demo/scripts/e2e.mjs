// Prueba extremo a extremo de la demo (Chromium, WebGL por software).
// Uso: npm run build && npm run test:e2e
// Comprueba: recorrido completo, STL cerrado, red externa = 0, errores de consola = 0,
// desbordes horizontales a 390 y 1440 px, accesibilidad (axe) y persistencia/reinicio.
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PORT = Number(process.env.E2E_PORT || 3399);
const BASE = process.env.BASE || `http://localhost:${PORT}`;
const OUT = 'test-results';
mkdirSync(OUT, { recursive: true });

let server = null;
if (!process.env.BASE) {
  server = spawn('node', ['scripts/serve-out.mjs'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
}

const failures = [];
const pass = (msg) => console.log(`  OK    ${msg}`);
const fail = (msg) => {
  failures.push(msg);
  console.log(`  FALLA ${msg}`);
};
const check = (cond, msg) => (cond ? pass(msg) : fail(msg));
const section = (t) => console.log(`\n▸ ${t}`);

async function step(name, fn) {
  section(name);
  try {
    await fn();
  } catch (e) {
    fail(`${name}: ${String(e.message || e).split('\n')[0]}`);
  }
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

const consoleErrors = [];
const external = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on('request', (r) => {
  const u = new URL(r.url());
  if ((u.protocol === 'http:' || u.protocol === 'https:') && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') external.push(r.url());
});

const tid = (id) => page.locator(`[data-testid="${id}"]`);
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });

async function axe(name) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  if (res.violations.length === 0) pass(`axe sin violaciones: ${name}`);
  else {
    for (const v of res.violations) {
      fail(`axe [${name}] ${v.id} (${v.impact}): ${v.help} · ${v.nodes.length} nodo(s) · ${v.nodes[0].target.join(' ')}`);
    }
  }
}

const noOverflow = async (label) => {
  const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(o <= 1, `sin desborde horizontal (${label}): ${o}px`);
};

await page.goto(BASE + '/');

await step('Inicio y transparencia', async () => {
  await page.waitForSelector('text=Un revisor a la puerta del laboratorio');
  check((await tid('demo-ribbon').innerText()).includes('DEMO · DATOS Y ANÁLISIS SIMULADOS'.toLowerCase()) || /demo/i.test(await tid('demo-ribbon').innerText()), 'cinta «DEMO» visible');
  const robots = await page.locator('meta[name=robots]').getAttribute('content');
  check(/noindex/.test(robots || ''), `robots: ${robots}`);
  await shot('10-inicio');
  await axe('inicio');
  await noOverflow('inicio 1440');
});

await step('Profesional: ficha e «Interpretar mensaje» (simulado)', async () => {
  await tid('tab-profesional').click();
  await tid('new-case').click();
  check(await tid('submit-case').isDisabled(), 'no se puede enviar sin ficha ni escaneo');
  await tid('interpret').click();
  await page.waitForSelector('text=IA · simulado');
  check((await tid('f-iniciales').inputValue()) === 'J.M.', 'la ficha se rellena (iniciales J.M.)');
  check((await tid('f-peso').inputValue()) === '82', 'peso 82');
  await shot('11-ficha');
});

await step('Semáforo: escaneo A en rojo, escaneo B en verde', async () => {
  await tid('sample-A').click();
  await page.waitForSelector('[data-testid=semaforo-status][data-status=rojo]');
  check(await tid('submit-case').isDisabled(), 'con escaneo rojo no se puede enviar');
  check((await tid('scan-checks').innerText()).includes('Zona del talón sin captar'), 'aviso «Zona del talón sin captar»');
  await page.waitForSelector('[data-testid=scan-viewer] canvas');
  await page.waitForTimeout(1800);
  await tid('semaforo-status').scrollIntoViewIfNeeded();
  await shot('12-rojo');
  await tid('scan-viewer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await shot('12b-visor-rojo');
  await tid('sample-B').click();
  await page.waitForSelector('[data-testid=semaforo-status][data-status=verde]');
  check(await tid('submit-case').isEnabled(), 'con escaneo verde se puede enviar');
  await page.waitForTimeout(1200);
  await tid('scan-viewer').scrollIntoViewIfNeeded();
  await page.waitForSelector('[data-testid=scan-viewer] canvas');
  await page.waitForTimeout(1500);
  await shot('13-visor-verde');
  await axe('profesional · ficha con semáforo verde');
});

await step('Lado incoherente (regla real, no guionizada)', async () => {
  await page.locator('[data-testid=f-lado] [role=radio]').nth(1).click(); // izquierdo
  await page.waitForSelector('[data-testid=semaforo-status][data-status=rojo]');
  check((await tid('scan-checks').innerText()).includes('Lado incoherente'), 'pie izquierdo + escaneo derecho ⇒ «Lado incoherente»');
  await page.locator('[data-testid=f-lado] [role=radio]').nth(0).click(); // derecho
  await page.waitForSelector('[data-testid=semaforo-status][data-status=verde]');
});

await step('Enviar caso y aclaración', async () => {
  await tid('submit-case').click();
  await page.waitForSelector('[data-testid=aclaracion]');
  check(true, 'aparece la pregunta de aclaración');
  check((await tid('aclaracion').innerText()).includes('deporte intenso'), 'pregunta sobre deporte intenso + material blando');
  await shot('14-aclaracion');
  await axe('profesional · aclaración');
  await tid('clar-pa11').click();
  await page.waitForSelector('[data-testid=tl-revisado][data-done=true]');
  check(true, 'tras responder, el caso queda «Revisado»');
});

await step('Laboratorio: lista y ficha', async () => {
  await tid('tab-laboratorio').click();
  await page.waitForSelector('[data-testid=row-ZP-0420]');
  check((await tid('row-ZP-0420').innerText()).includes('Validado'), 'ZP-0420 aparece «Validado» en la lista');
  check((await tid('lab-counters').innerText()).includes('Listos · 2'), 'contadores por color coherentes');
  await page.waitForSelector('[data-testid=case-detail]');
  await page.waitForSelector('[data-testid=lab-scan-viewer] canvas');
  await page.waitForTimeout(1200);
  await shot('15-lab-resumen');
  await axe('laboratorio · resumen');
  await noOverflow('laboratorio 1440');
});

await step('Especificación: aceptar propuesta', async () => {
  await tid('lab-tab-especificacion').click();
  check((await tid('spec-table').innerText()).includes('PA11'), 'propuesta PA11 tras la aclaración');
  await shot('16-spec');
  await tid('spec-accept').click();
  await page.waitForSelector('[data-testid=design-editor]');
  check(true, 'se abre el editor de diseño');
});

await step('Editor de diseño: sliders, avisos, versiones y comparación', async () => {
  await page.waitForSelector('[data-testid=insole-viewer] canvas');
  await page.waitForTimeout(1800);
  await shot('17-editor');
  await axe('laboratorio · editor de diseño');
  const max0 = await tid('stat-max').innerText();
  await tid('slider-arcoAltura').fill('15');
  await page.waitForFunction((v) => document.querySelector('[data-testid=stat-max]').textContent !== v, max0);
  check((await tid('val-arcoAltura').innerText()).startsWith('15'), 'el slider del arco responde (15 mm)');
  check((await tid('stat-max').innerText()) !== max0, 'el grosor máximo cambia al mover el arco');
  await tid('slider-grosorBase').fill('1.5');
  await page.waitForSelector('[data-testid=warnings] >> text=por debajo del grosor mínimo');
  check(true, 'aviso de grosor mínimo (perfil de ejemplo) cuando la base baja a 1,5 mm');
  await page.waitForTimeout(500);
  await shot('18-editor-aviso');
  await tid('slider-grosorBase').fill('3');
  await tid('seg-largo').locator('[role=radio]').nth(1).click(); // ¾
  await page.waitForTimeout(300);
  await tid('seg-largo').locator('[role=radio]').nth(0).click(); // completa
  await tid('save-version').click();
  await page.waitForSelector('[data-testid=versions] >> text=Versión 2');
  check(true, 'se guarda la versión 2');
  await tid('compare-1').click();
  await page.waitForTimeout(500);
  await shot('19-editor-comparar');
  await tid('compare-1').click();
  check((await tid('stat-mesh').innerText()).startsWith('Cerrada'), 'la malla se declara cerrada');
});

await step('Aprobar, exportar STL real y hoja de fabricación', async () => {
  check((await page.locator('[data-testid=export-stl]').count()) === 0, 'sin aprobar NO hay botón de exportar');
  await tid('approve').click();
  await page.waitForSelector('[data-testid=export-stl]');
  check(await page.locator('[data-testid=slider-arcoAltura]').isDisabled(), 'tras aprobar los controles se bloquean');
  const [dl] = await Promise.all([page.waitForEvent('download'), tid('export-stl').click()]);
  const stlPath = `${OUT}/${dl.suggestedFilename()}`;
  await dl.saveAs(stlPath);
  check(/^caso-ZP-0420-derecho-v\d+\.stl$/.test(dl.suggestedFilename()), `nombre del STL: ${dl.suggestedFilename()}`);
  let out = '';
  try {
    out = execFileSync('node', ['scripts/verify-stl.mjs', stlPath], { encoding: 'utf8' });
    check(/MALLA CERRADA: OK/.test(out), 'el STL descargado es una malla cerrada (verify-stl)');
  } catch (e) {
    fail(`verify-stl falló: ${(e.stdout || '') + (e.stderr || '')}`);
  }
  console.log(out.split('\n').map((l) => `        ${l}`).join('\n'));
  await tid('open-sheet').click();
  await page.waitForSelector('[data-testid=sheet-map]');
  await page.waitForTimeout(400);
  check(/no apto para fabricar|no es apto para fabricar/i.test(await tid('sheet').innerText()), 'la hoja declara que no es apta para fabricar');
  await shot('20-hoja');
  await tid('close-sheet').click();
});

await step('Fabricación y envío; el profesional lo ve', async () => {
  await tid('lab-tab-fabricacion').click();
  for (const next of ['En fabricación', 'Control de calidad', 'Expedido', 'Entregado']) {
    await tid('advance').click();
    await page.waitForSelector(`[data-testid=case-detail] >> text=${next}`);
  }
  check(true, 'el caso avanza hasta «Entregado»');
  await shot('21-envio');
  await tid('tab-profesional').click();
  await page.waitForSelector('[data-testid=tl-entregado][data-done=true]');
  check(true, 'la vista del profesional refleja «Entregado»');
  await tid('open-public').click();
  await page.waitForSelector('[data-testid=public-status]');
  check(!(await tid('public-status').innerText()).includes('J.M.'), 'el enlace público no muestra datos personales');
  await shot('22-publico');
  await page.keyboard.press('Escape');
});

await step('Panel del dueño: el caso simulado aparece con sus bucles', async () => {
  await tid('tab-dueno').click();
  await page.waitForSelector('[data-testid=loop-count]');
  const n = Number(await tid('loop-count').innerText());
  check(n >= 2, `bucles del caso simulado: ${n} (escaneo repetido + aclaración)`);
  const txt = await tid('loop-list').innerText();
  check(/Reescaneo/.test(txt) && /Aclaración/.test(txt), 'causas registradas solas: reescaneo y aclaración');
  check(/EJEMPLO ILUSTRATIVO|Ejemplo ilustrativo/i.test(await page.locator('main').innerText()), 'leyenda de ejemplo ilustrativo presente');
  await shot('23-dueno');
  await axe('dueño');
  await noOverflow('dueño 1440');
});

await step('Qué es real y qué es simulado', async () => {
  await tid('tab-acerca').click();
  await page.waitForSelector('text=Pieza por pieza');
  await shot('24-acerca');
  await axe('qué es real');
});

await step('Presentación guiada completa con «Preparar el caso hasta aquí»', async () => {
  await tid('reset').click();
  await tid('reset-confirm').click();
  await page.waitForSelector('text=Cargando la demo…', { state: 'detached' }).catch(() => {});
  await tid('tour-toggle').click();
  await page.waitForSelector('[data-testid=tour-panel]');
  check(/paso 1 \/ 9/i.test(await tid('tour-step').innerText()), 'paso 1 / 9');
  await page.waitForSelector('[data-tour-hl=true]');
  check(true, 'el elemento del paso se resalta');
  await page.waitForTimeout(1200);
  await shot('30-tour-1');
  await tid('tour-notes').fill('El cliente confirma que repiten escaneos a menudo.');
  await tid('survey-si').click();
  await tid('tour-next').click();
  await page.waitForSelector('[data-testid=phone]');
  check(/paso 2 \/ 9/i.test(await tid('tour-step').innerText()), 'paso 2 abre la vista del profesional');
  await tid('tour-next').click();
  check(/paso 3 \/ 9/i.test(await tid('tour-step').innerText()), 'paso 3');
  await tid('tour-next').click();
  await tid('tour-prepare').waitFor();
  await tid('tour-prepare').click();
  await page.waitForSelector('[data-testid=aclaracion]');
  check(true, 'paso 4: «Preparar» deja el caso en la aclaración sin contestarla');
  await shot('31-tour-4');
  await tid('tour-next').click();
  await tid('tour-prepare').click();
  await page.waitForSelector('[data-testid=row-ZP-0420]');
  check(true, 'paso 5: laboratorio con el caso preparado');
  await tid('tour-next').click();
  await tid('tour-prepare').click();
  await page.waitForSelector('[data-testid=design-editor]');
  await page.waitForTimeout(1500);
  check(true, 'paso 6: editor de diseño preparado');
  await page.waitForTimeout(1000);
  await shot('32-tour-6');
  await axe('presentación guiada abierta (paso 6)');
  await tid('tour-next').click();
  await tid('tour-prepare').click();
  await page.waitForSelector('[data-testid=tl-fabricando][data-done=true]');
  check(true, 'paso 7: seguimiento hasta «Fabricando»');
  await tid('tour-next').click();
  await page.waitForSelector('[data-testid=real-case]');
  check(true, 'paso 8: panel del dueño');
  await tid('tour-next').click();
  await page.waitForSelector('text=Pieza por pieza');
  check(/paso 9 \/ 9/i.test(await tid('tour-step').innerText()), 'paso 9: cierre');
  await shot('33-tour-9');
  const [dl] = await Promise.all([page.waitForEvent('download'), tid('export-notes').click()]);
  const mdPath = `${OUT}/${dl.suggestedFilename()}`;
  await dl.saveAs(mdPath);
  const md = readFileSync(mdPath, 'utf8');
  check(md.includes('El cliente confirma que repiten escaneos a menudo.') && md.includes('Sí, cuadra'), 'las notas exportadas incluyen la nota y la respuesta');
  check(/Pantallas valoradas: 1 de 9/.test(md), 'resumen: 1 de 9 pantallas valoradas');
});

await step('Persistencia al recargar y reinicio que conserva las notas', async () => {
  await tid('tour-toggle').click(); // cerrar presentación
  await tid('tab-laboratorio').click();
  check((await tid('row-ZP-0420').innerText()).includes('En fabricación'), 'antes de recargar: En fabricación');
  await page.reload();
  await page.waitForSelector('[data-testid=row-ZP-0420]');
  check((await tid('row-ZP-0420').innerText()).includes('En fabricación'), 'tras recargar sigue «En fabricación» (sessionStorage)');
  await tid('reset').click();
  await tid('reset-confirm').click();
  await tid('tab-laboratorio').click();
  await page.waitForSelector('text=Aún no ha llegado ningún caso nuevo');
  check((await page.locator('[data-testid=row-ZP-0420]').count()) === 0, 'reiniciar devuelve el caso al estado inicial');
  await tid('tab-acerca').click();
  check((await tid('survey-count').innerText()).startsWith('1 de 9'), 'las respuestas de la reunión se conservan al reiniciar');
});

await step('STL propio: medidas reales y archivo inválido', async () => {
  await tid('tab-profesional').click();
  await tid('new-case').click();
  await tid('stl-input').setInputFiles(`${OUT}/caso-ZP-0420-derecho-v2.stl`);
  await page.waitForSelector('[data-testid=scan-checks]');
  const t = await tid('scan-checks').innerText();
  check(/Longitud medida: 25\d mm/.test(t), 'mide la longitud real del STL (≈ 251 mm)');
  check(/Malla cerrada \(estanca\)/.test(t), 'detecta que el STL es una malla cerrada');
  check(/Resto del análisis simulado/.test(t), 'avisa de que el resto del análisis sigue simulado');
  await page.waitForSelector('[data-testid=scan-viewer] canvas');
  await page.waitForTimeout(1200);
  await tid('scan-viewer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await shot('42-stl-propio');
  writeFileSync(`${OUT}/mal.stl`, 'esto no es un STL');
  await tid('stl-input').setInputFiles(`${OUT}/mal.stl`);
  await page.waitForSelector('text=No se reconoce el archivo como STL válido.');
  check(true, 'un archivo inválido muestra un error claro');
});

await step('Móvil 390 px: sin desbordes ni errores', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const t of ['inicio', 'profesional', 'laboratorio', 'dueno', 'acerca']) {
    await tid(`tab-${t}`).click();
    await page.waitForTimeout(250);
    await noOverflow(`${t} 390`);
  }
  await tid('tab-profesional').click();
  await shot('40-movil-profesional');
  await tid('tab-inicio').click();
  await shot('41-movil-inicio');
});

section('Red y consola');
check(external.length === 0, `peticiones a dominios externos: ${external.length}${external.length ? ' → ' + external.slice(0, 3).join(', ') : ''}`);
check(consoleErrors.length === 0, `errores de consola: ${consoleErrors.length}${consoleErrors.length ? ' → ' + consoleErrors.slice(0, 3).join(' | ') : ''}`);

await browser.close();
server?.kill();
console.log(`\n${failures.length === 0 ? 'TODAS LAS COMPROBACIONES PASAN' : `${failures.length} COMPROBACIONES FALLIDAS`}`);
for (const f of failures) console.log(` - ${f}`);
process.exit(failures.length ? 1 : 0);
