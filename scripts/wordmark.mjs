// Converts a word set in a script font into a standalone SVG path,
// so the wordmark ships as an asset with no runtime font dependency.
// Usage: node scripts/wordmark.mjs <font.woff> <word> <out.svg>
import { readFileSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";

const [fontFile, word = "zuzu", out = "public/brand/wordmark.svg"] = process.argv.slice(2);
const buf = readFileSync(fontFile);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const size = 400;
const path = font.getPath(word, 0, size, size);
const { x1, y1, x2, y2 } = path.getBoundingBox();
const pad = 4;
const w = Math.ceil(x2 - x1 + pad * 2);
const h = Math.ceil(y2 - y1 + pad * 2);
const d = font
  .getPath(word, -x1 + pad, size - y1 + pad, size)
  .toPathData(1);
if (d.includes("NaN")) {
  throw new Error(`opentype.js produced an invalid outline for ${fontFile}; try a different font.`);
}

writeFileSync(
  out,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor"><path d="${d}"/></svg>\n`,
);
console.log(`${out}: ${w}x${h}`);
