"use client";

import { useMemo, useState } from "react";
import { STATE_RANK } from "@/lib/domain";
import {
  computeInsole,
  edgeStats,
  insoleToSTL,
  insoleTopology,
  PARAM_SPECS,
  signedVolume,
  type InsoleParams,
} from "@/lib/geometry";
import { PROCESS_PROFILES, RULES_NOTICE } from "@/lib/rules";
import { downloadBlob } from "@/lib/stl";
import { useDemo } from "@/lib/store";
import { InsoleViewer } from "../../three/InsoleViewer";
import { ThicknessMap } from "../../ThicknessMap";
import { Callout, Card, Chip, Icon, Segmented, SliderField, btn, fmtDate } from "../../ui";

const GROUPS = ["Contorno y base", "Arco y talón", "Antepié", "Cuñas y elevación"] as const;
const mm = (v: number) => `${v.toFixed(1).replace(".", ",")} mm`;

export function DesignEditor() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const draft = c.design.draft;
  const spec = c.spec.final ?? c.spec.proposal;
  const [showFoot, setShowFoot] = useState(true);
  const [showHeat, setShowHeat] = useState(true);
  const [compareId, setCompareId] = useState<number | null>(null);

  const side = c.rx.lado;
  const profile = PROCESS_PROFILES[spec?.ruta ?? "por_confirmar"];
  const approved = c.design.approved;
  const locked = approved !== null || STATE_RANK[c.state] > STATE_RANK.diseno_aprobado;

  const result = useMemo(() => (draft ? computeInsole(draft, side, profile.minMm) : null), [draft, side, profile.minMm]);
  const compareVersion = c.design.versions.find((v) => v.id === compareId) ?? null;
  const compareResult = useMemo(
    () => (compareVersion ? computeInsole(compareVersion.params, side, profile.minMm) : null),
    [compareVersion, side, profile.minMm],
  );
  const mesh = useMemo(() => {
    const t = insoleTopology();
    return { ...edgeStats([t.topIndex, t.bodyIndex]) };
  }, []);

  if (!draft || !result || !spec) {
    return (
      <Callout tone="muted" title="Todavía no hay diseño">
        <p>El diseño parte de la especificación aceptada. Primero acepta (o cambia) la propuesta en la pestaña «Especificación».</p>
        <button type="button" className={btn("ghost", "sm") + " mt-2"} onClick={() => dispatch({ type: "labTab", tab: "especificacion" })}>
          Ir a Especificación
        </button>
      </Callout>
    );
  }

  const volumeCm3 = signedVolume(result.positions, [insoleTopology().topIndex, insoleTopology().bodyIndex]) / 1000;
  const lastVersion = c.design.versions[c.design.versions.length - 1];
  const dirty = !lastVersion || JSON.stringify(lastVersion.params) !== JSON.stringify(draft);

  const setParam = (key: keyof InsoleParams, value: number | string) =>
    dispatch({ type: "draft", params: { ...draft, [key]: value } as InsoleParams });

  const approvedVersion = approved ? c.design.versions.find((v) => v.id === approved.versionId) : null;
  const exportStl = () => {
    if (!approvedVersion) return;
    const r = computeInsole(approvedVersion.params, side, profile.minMm);
    const name = `caso-${c.code}-${side}-v${approvedVersion.id}`;
    downloadBlob(`${name}.stl`, insoleToSTL(r.positions, name), "model/stl");
  };

  return (
    <div data-tour="editor-diseno" data-testid="design-editor" className="grid gap-5 rounded-2xl xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 content-start gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {approved ? (
            <Chip tone="ok" icon>
              Aprobado por {approved.by} · {fmtDate(approved.at)}
            </Chip>
          ) : (
            <Chip tone="warn" icon>
              Borrador generado automáticamente: requiere validación del técnico
            </Chip>
          )}
          <Chip tone="muted" icon={false}>
            Versión {lastVersion ? lastVersion.id : 1}
            {dirty && !locked ? " + cambios sin guardar" : ""}
          </Chip>
        </div>

        <InsoleViewer side={side} result={result} compare={compareResult} footLift={result.stats.heelTopZ + draft.grosorForro} showFoot={showFoot} showHeat={showHeat} />

        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
          <Card className="grid place-items-center bg-ink-900 !p-3">
            <ThicknessMap result={result} side={side} height={260} theme="dark" testId="thickness-map" />
          </Card>
          <Card className="grid content-start gap-3">
            <h2 className="text-base font-semibold">Medidas del borrador</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm" data-testid="stats">
              <div>
                <dt className="text-muted">Grosor mínimo</dt>
                <dd className="font-mono font-semibold" data-testid="stat-min">
                  {mm(result.stats.minMm)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Grosor máximo</dt>
                <dd className="font-mono font-semibold" data-testid="stat-max">
                  {mm(result.stats.maxMm)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Largo × ancho</dt>
                <dd className="font-mono font-semibold">
                  {result.stats.lengthMm.toFixed(0)} × {result.stats.widthMm.toFixed(0)} mm
                </dd>
              </div>
              <div>
                <dt className="text-muted">Volumen del shell</dt>
                <dd className="font-mono font-semibold">{volumeCm3.toFixed(1).replace(".", ",")} cm³</dd>
              </div>
              <div>
                <dt className="text-muted">Total con forro (máx.)</dt>
                <dd className="font-mono font-semibold">{mm(result.stats.maxMm + draft.grosorForro)}</dd>
              </div>
              <div>
                <dt className="text-muted">Malla</dt>
                <dd className="font-semibold" data-testid="stat-mesh">
                  {mesh.closed ? "Cerrada" : "Abierta"} · {mesh.triangles.toLocaleString("es-ES")} triángulos
                </dd>
              </div>
            </dl>
            <p className="text-xs leading-snug text-muted">
              Perfil de proceso de ejemplo: <b className="text-fg">{profile.label}</b>, grosor mínimo {mm(profile.minMm)}. {RULES_NOTICE}
            </p>
            {result.stats.warnings.length > 0 ? (
              <ul className="grid gap-2" data-testid="warnings">
                {result.stats.warnings.map((w) => (
                  <li key={w}>
                    <Callout tone="warn">{w}</Callout>
                  </li>
                ))}
              </ul>
            ) : (
              <Callout tone="ok">Sin avisos para el perfil de proceso de ejemplo.</Callout>
            )}
          </Card>
        </div>
      </div>

      <aside className="grid min-w-0 content-start gap-4" aria-label="Controles del diseño">
        <Card className="grid gap-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Largo de la ortesis</p>
            <Segmented
              label="Largo de la ortesis"
              value={draft.largo}
              disabled={locked}
              onChange={(v) => setParam("largo", v)}
              options={[
                { id: "completa", label: "Completa" },
                { id: "tres_cuartos", label: "¾" },
              ]}
              testId="seg-largo"
            />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <label className="flex min-h-9 cursor-pointer items-center gap-2">
              <input type="checkbox" checked={showFoot} onChange={(e) => setShowFoot(e.target.checked)} className="size-4 accent-brand" /> Mostrar el pie
            </label>
            <label className="flex min-h-9 cursor-pointer items-center gap-2">
              <input type="checkbox" checked={showHeat} onChange={(e) => setShowHeat(e.target.checked)} className="size-4 accent-brand" /> Mapa de calor
            </label>
          </div>

          {!locked ? (
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className={btn("ghost", "md")} disabled={!dirty} onClick={() => dispatch({ type: "saveVersion", note: "Ajustes del técnico", at: Date.now() })} data-testid="save-version">
                  Guardar versión
                </button>
                <button type="button" className={btn("primary", "md")} onClick={() => dispatch({ type: "approve", at: Date.now() })} data-testid="approve">
                  <Icon name="check" /> Aprobar diseño
                </button>
              </div>
              <p className="text-xs leading-snug text-muted">Hasta que apruebes, el diseño es un borrador y no se puede exportar.</p>
            </div>
          ) : (
            <div className="grid gap-2" data-testid="export-box">
              <Callout tone="ok" title={`Diseño aprobado · versión ${approved?.versionId ?? "—"}`}>
                Ilustrativo: no está calibrado y no es apto para fabricar.
              </Callout>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className={btn("primary", "md")} onClick={exportStl} data-testid="export-stl">
                  <Icon name="download" /> Exportar STL
                </button>
                <button type="button" className={btn("ghost", "md")} onClick={() => dispatch({ type: "overlay", sheet: true })} data-testid="open-sheet">
                  <Icon name="file" /> Hoja de fabricación
                </button>
              </div>
              {STATE_RANK[c.state] <= STATE_RANK.diseno_aprobado ? (
                <button type="button" className={btn("ghost", "sm")} onClick={() => dispatch({ type: "reopen", at: Date.now() })} data-testid="reopen">
                  Reabrir el diseño
                </button>
              ) : null}
            </div>
          )}
        </Card>

        <Card className="grid gap-3">
          <h2 className="text-base font-semibold">Versiones</h2>
          <ul className="grid gap-2" data-testid="versions">
            {c.design.versions.map((v) => (
              <li key={v.id} className="rounded-xl border border-line bg-bone-50 p-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <b>Versión {v.id}</b>
                  <span className="font-mono text-[11px] text-muted">{fmtDate(v.at)}</span>
                </div>
                <p className="text-xs text-muted">
                  {v.by} · {v.note}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className={btn("ghost", "sm")} disabled={locked} onClick={() => dispatch({ type: "draft", params: v.params })}>
                    Cargar
                  </button>
                  <button
                    type="button"
                    className={btn("ghost", "sm")}
                    aria-pressed={compareId === v.id}
                    onClick={() => setCompareId(compareId === v.id ? null : v.id)}
                    data-testid={`compare-${v.id}`}
                  >
                    {compareId === v.id ? "Quitar comparación" : "Comparar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {compareId ? <p className="text-xs text-muted">La versión {compareId} se dibuja con líneas ámbar sobre el borrador.</p> : null}
        </Card>

        {GROUPS.map((g) => (
          <Card key={g} className="grid gap-4">
            <h2 className="text-base font-semibold">{g}</h2>
            {PARAM_SPECS.filter((s) => s.group === g).map((s) => (
              <SliderField key={s.key} spec={s} params={draft} disabled={locked} onChange={(k, v) => setParam(k, v)} />
            ))}
          </Card>
        ))}
        <p className="text-xs leading-snug text-muted">
          Rangos y valores de ejemplo, no clínicos. La geometría se calcula en tu navegador con una aproximación en JavaScript; la versión real usaría un servicio en Python calibrado con escaneos reales.
        </p>
      </aside>
    </div>
  );
}
