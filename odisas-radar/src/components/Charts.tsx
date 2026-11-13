'use client';
import { useState } from 'react';

/**
 * Gráficos del panel. Una serie → sin leyenda (la nombra el título). Varias series →
 * leyenda y etiqueta directa al final de cada línea. Colores validados para daltonismo.
 */
const fmtWeek = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

export function WeekBars({ data, label }: { data: { week: string; value: number }[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 190;
  const pad = { l: 30, r: 8, t: 10, b: 24 };
  const max = Math.max(4, ...data.map((d) => d.value));
  const step = (W - pad.l - pad.r) / data.length;
  const bw = Math.min(26, step - 6);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const ticks = [0, Math.round(max / 2), max];
  return (
    <div className="viz">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} por semana`}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * step + (step - bw) / 2;
          const h = Math.max(d.value ? 2 : 0, H - pad.b - y(d.value));
          return (
            <g key={d.week} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.l + i * step} y={pad.t} width={step} height={H - pad.t - pad.b} fill="transparent" />
              <path d={`M${x},${H - pad.b} v${-Math.max(0, h - 4)} q0,-4 4,-4 h${bw - 8} q4,0 4,4 v${Math.max(0, h - 4)} z`} fill="var(--series-1)" opacity={hover == null || hover === i ? 1 : 0.45} />
              {i % 2 === 1 && <text x={x + bw / 2} y={H - 6} textAnchor="middle">{fmtWeek(d.week)}</text>}
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div className="tip" style={{ left: `${((pad.l + hover * step + step / 2) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}>
          Semana del {fmtWeek(data[hover].week)}: <b>{data[hover].value}</b>
        </div>
      )}
    </div>
  );
}

const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)'];

export function WeekLines({ weeks, series }: { weeks: string[]; series: { label: string; values: number[] }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 200;
  const pad = { l: 30, r: 78, t: 12, b: 24 };
  const max = Math.max(4, ...series.flatMap((s) => s.values));
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, weeks.length - 1);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  // Etiquetas finales separadas para que no se pisen.
  const ends = series.map((s, i) => ({ i, y: y(s.values.at(-1) ?? 0) })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 13) ends[k].y = ends[k - 1].y + 13;
  return (
    <div className="viz">
      <div className="legend">
        {series.map((s, i) => (
          <span key={s.label}>
            <i style={{ background: SERIES[i] }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolución semanal de la captación" onMouseLeave={() => setHover(null)}>
        {[0, Math.round(max / 2), max].map((t) => (
          <g key={t}>
            <line className="grid-line" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}
        {weeks.map((w, i) => i % 2 === 1 && <text key={w} x={x(i)} y={H - 6} textAnchor="middle">{fmtWeek(w)}</text>)}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#b9b5aa" strokeWidth="1" />}
        {series.map((s, i) => (
          <g key={s.label}>
            <polyline fill="none" stroke={SERIES[i]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={s.values.map((v, k) => `${x(k)},${y(v)}`).join(' ')} />
            {hover != null && <circle cx={x(hover)} cy={y(s.values[hover])} r="4" fill={SERIES[i]} stroke="#fff" strokeWidth="2" />}
          </g>
        ))}
        {ends.map((e) => (
          <text key={e.i} x={W - pad.r + 8} y={e.y + 4} style={{ fill: 'var(--text)' }}>
            {series[e.i].label}
          </text>
        ))}
        {weeks.map((w, i) => (
          <rect key={w} x={x(i) - (W - pad.l - pad.r) / weeks.length / 2} y={pad.t} width={(W - pad.l - pad.r) / weeks.length} height={H - pad.t - pad.b} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover != null && (
        <div className="tip" style={{ left: `${(x(hover) / W) * 100}%`, top: '18%' }}>
          Semana del {fmtWeek(weeks[hover])}
          {series.map((s) => (
            <div key={s.label}>
              {s.label}: <b>{s.values[hover]}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HBars({ rows, unit = '' }: { rows: { label: string; value: number; note?: string }[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      {rows.map((r) => (
        <div className="hbar" key={r.label} title={`${r.label}: ${r.value}${unit}${r.note ? ` · ${r.note}` : ''}`}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
          <span className="track">
            <i style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="num nowrap">
            <b>{r.value}</b>
            {unit}
            {r.note && <span className="muted tiny"> · {r.note}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
