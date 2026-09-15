import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Keep the browser favicon and home-screen icon derived from one vector source.
const source = await readFile(new URL("../app/icon.svg", import.meta.url));
const sizes = [32, 48, 256];
const images = await Promise.all(sizes.map((size) => sharp(source).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(1, 2); // ICO image type
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index] === 256 ? 0 : sizes[index];
  header[entry + 1] = header[entry];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(new URL("../app/favicon.ico", import.meta.url), Buffer.concat([header, ...images]));
await sharp(source).resize(180, 180).png().toFile(new URL("../app/apple-icon.png", import.meta.url).pathname);
console.log("Generated favicon.ico (32, 48, 256px) and apple-icon.png (180px).");
