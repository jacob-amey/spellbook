import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";

// Use the actual product screenshot, not a mock interface or fictional metrics.
const destination = new URL("../docs/assets/", import.meta.url);
await mkdir(destination, { recursive: true });
const screenshot = await sharp(await readFile(new URL("../docs/screenshots/home.png", import.meta.url)))
  .resize(704, 489, { fit: "contain", background: "#0b1210" })
  .png()
  .toBuffer();
const icon = await sharp(await readFile(new URL("../app/icon.svg", import.meta.url)))
  .resize(48, 48).png().toBuffer();
const typography = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640">
  <rect width="1280" height="640" fill="#0b1210"/>
  <path d="M48 160h400M48 528h400" stroke="#2a3830"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="112" y="119" fill="#eee8dc" font-size="42" font-weight="700">Spellbook</text>
    <text x="48" y="231" fill="#eee8dc" font-size="38" font-weight="700">MTG card search</text>
    <text x="48" y="282" fill="#b4d6bf" font-size="38" font-weight="700">&amp; deck builder</text>
    <text x="48" y="347" fill="#b7beb8" font-size="21">Search. Inspect. Build.</text>
    <text x="48" y="444" fill="#eee8dc" font-size="18">Next.js · React · TypeScript</text>
    <text x="48" y="479" fill="#b7beb8" font-size="18">Vitest · Playwright · GitHub Actions</text>
    <text x="48" y="565" fill="#b7beb8" font-size="17">Card data and artwork: Scryfall</text>
  </g>
  <rect x="510" y="76" width="708" height="493" rx="2" fill="#0b1210" stroke="#34483b"/>
</svg>`);
const result = await sharp(typography)
  .composite([{ input: icon, left: 48, top: 80 }, { input: screenshot, left: 512, top: 78 }])
  .png({ compressionLevel: 9 })
  .toFile(new URL("github-social-preview.png", destination).pathname);
if (result.size >= 1_000_000) throw new Error("GitHub social preview must be under 1 MB.");
console.log(`Social preview: ${result.width} × ${result.height}, ${result.size} bytes.`);
