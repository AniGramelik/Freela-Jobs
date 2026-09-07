import { ImageResponse } from "next/og";

export const alt = "Freela Jobs — trabalho freelancer e temporário, sem o grupo de WhatsApp";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #12293F 0%, #17364F 42%, #1FA98A 140%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg viewBox="0 0 40 40" width="64" height="64">
            <path
              d="M4 27.5c7.4 1.7 14.6-.2 21-6 2.8-2.5 4.8-4.6 8.7-5.8l1.9 6.2c-2.7.8-3.9 1.8-5.9 3.6-7.4 6.7-16.4 9.6-25.7 8.1Z"
              fill="#8FE3D0"
            />
            <path
              d="M15 13.2C15 8.7 18.6 5 23.2 5H27v6.1h-3.3c-1.4 0-2.1.9-2.1 2.6V16H26v6h-4.4v13h-6.6V22H12v-6h3v-2.8Z"
              fill="#ffffff"
            />
            <circle cx="29.3" cy="8.9" r="4.9" fill="#8FE3D0" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
            Freela Jobs
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 66, fontWeight: 600, lineHeight: 1.05, maxWidth: 900, letterSpacing: -2 }}>
            Freelancers e empresas se encontram.
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.82)", maxWidth: 820 }}>
            Banco de talentos, mural de vagas, convocações e conversa — num lugar só.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
