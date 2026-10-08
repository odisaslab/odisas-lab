import { ImageResponse } from "next/og";

export const alt = "Zona Pies · Ingeniería digital aplicada al movimiento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen social generada por código. Provisional: sustituir por una composición con el modelo 3D renderizado. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(60% 80% at 85% 40%, rgba(62,230,201,0.22), #07090b 70%)",
          color: "#eef1f2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, letterSpacing: 10, textTransform: "uppercase", fontWeight: 600 }}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none" stroke="#3ee6c9" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12.2 28c-2.1 0-3.5-1.7-3.3-3.8.3-2.6 1.6-3.7 1.5-6.2-.1-2.5-1.6-4.4-1.2-7.3C9.6 7.7 12 5.5 15 5.5c3.1 0 5.7 2.1 6 5.4.3 3-1 4.8-1.2 7.1-.2 2.6 1.3 3.5 1.1 5.9-.2 2.5-2.2 4.1-5 4.1h-3.7Z" />
            <path d="M3.5 17h25" strokeWidth="1" />
          </svg>
          Zona Pies
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 92, lineHeight: 0.98, letterSpacing: -4, fontWeight: 600, maxWidth: 900, display: "flex", flexWrap: "wrap" }}>
            <span>Ingeniería digital aplicada al&nbsp;</span>
            <span style={{ color: "#3ee6c9" }}>movimiento.</span>
          </div>
          <div style={{ fontSize: 30, color: "#9aa6ae", maxWidth: 820 }}>Laboratorio de ortesis plantares y plantillas a medida para profesionales.</div>
        </div>
      </div>
    ),
    size,
  );
}
