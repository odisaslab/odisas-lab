import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Icono PROVISIONAL (huella con línea de escaneo). Sustituir por el logotipo oficial. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#07090b", borderRadius: 7 }}>
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="#3ee6c9" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12.2 28c-2.1 0-3.5-1.7-3.3-3.8.3-2.6 1.6-3.7 1.5-6.2-.1-2.5-1.6-4.4-1.2-7.3C9.6 7.7 12 5.5 15 5.5c3.1 0 5.7 2.1 6 5.4.3 3-1 4.8-1.2 7.1-.2 2.6 1.3 3.5 1.1 5.9-.2 2.5-2.2 4.1-5 4.1h-3.7Z" />
          <path d="M3.5 17h25" strokeWidth="1.6" />
        </svg>
      </div>
    ),
    size,
  );
}
