#!/usr/bin/env node
/**
 * Descarga las fotografías reales de producto de zonapies.es a public/media/ y escribe
 * data/media.generated.json con las que se han podido bajar. Uso: npm run assets [-- --force]
 *
 * Una petición cada 2,5 s (el robots.txt de la web pide un rastreo muy lento). Sin dependencias.
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "media");
const force = process.argv.includes("--force");
const assets = JSON.parse(await readFile(path.join(root, "data", "media.assets.json"), "utf8"));

await mkdir(outDir, { recursive: true });
const done = [];
const failed = [];

for (const asset of assets) {
  const target = path.join(outDir, asset.file);
  const exists = await access(target).then(() => true, () => false);
  if (exists && !force) {
    done.push(asset.file);
    console.log(`= ${asset.file} (ya existe)`);
    continue;
  }
  try {
    const response = await fetch(asset.url, { headers: { "user-agent": "Mozilla/5.0 (ZonaPies asset sync)" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
    done.push(asset.file);
    console.log(`✓ ${asset.file}`);
  } catch (error) {
    failed.push(asset.file);
    console.log(`✗ ${asset.file}: ${error.message}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 2500));
}

await writeFile(path.join(root, "data", "media.generated.json"), JSON.stringify({ files: done, fetchedAt: new Date().toISOString() }, null, 2) + "\n");
console.log(`\n${done.length} imágenes disponibles${failed.length ? `, ${failed.length} fallidas` : ""}. Reconstruye la web para que se muestren.`);
process.exit(failed.length ? 1 : 0);
