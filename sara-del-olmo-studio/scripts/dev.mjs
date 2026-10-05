/** Desarrollo: reconstruye al guardar cualquier archivo de src/ y sirve dist/ en http://localhost:4173 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let running = false, queued = false;

function rebuild() {
  if (running) { queued = true; return; }
  running = true;
  const p = spawn(process.execPath, [path.join(root, 'scripts/build.mjs'), '--dev'], { stdio: 'inherit' });
  p.on('exit', () => { running = false; if (queued) { queued = false; rebuild(); } });
}

rebuild();
let t;
fs.watch(path.join(root, 'src'), { recursive: true }, () => { clearTimeout(t); t = setTimeout(rebuild, 150); });
fs.watch(path.join(root, 'public'), { recursive: true }, () => { clearTimeout(t); t = setTimeout(rebuild, 150); });
serve('dist');
