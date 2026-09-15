import { ImageResponse } from "next/og";

export const alt = "Spellbook — Magic: The Gathering card search and deck builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#101413", color: "#edf0ed", borderLeft: "12px solid #91c4a5" }}>
      <div style={{ display: "flex", fontSize: 28, color: "#91c4a5" }}>Magic: The Gathering</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 96, fontWeight: 700 }}>Spellbook</div>
        <div style={{ fontSize: 36 }}>Card research. Deck building.</div>
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #39423d", paddingTop: 24, fontSize: 24, color: "#b4c0b8" }}>Search the catalogue · Compare printings · Build your next deck</div>
    </div>, size,
  );
}
