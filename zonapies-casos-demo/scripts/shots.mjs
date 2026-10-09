// Capturas rápidas para revisar el aspecto (no es la prueba definitiva). Uso: node scripts/shots.mjs
import { chromium } from 'playwright-core';
const BASE = process.env.BASE || 'http://localhost:3300';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.type(), m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(BASE + '/');
await page.waitForSelector('text=Un revisor a la puerta');
await page.screenshot({ path: 'test-results/01-inicio.png' });
await page.click('[data-testid=tab-profesional]');
await page.click('[data-testid=new-case]');
await page.click('[data-testid=interpret]');
await page.waitForSelector('text=IA · simulado');
await page.screenshot({ path: 'test-results/02-form.png' });
await page.click('[data-testid=sample-A]');
await page.waitForSelector('[data-testid=semaforo-status][data-status=rojo]');
await page.waitForTimeout(2500);
await page.locator('[data-testid=semaforo-status]').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'test-results/03-rojo.png' });
await browser.close();
