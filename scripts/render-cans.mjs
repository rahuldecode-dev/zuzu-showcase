// Renders every can in /studio to a transparent WebP in public/products.
// 1. pnpm dev   2. pnpm render:cans   (BASE_URL defaults to http://localhost:3000)
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["volt", "cola", "zero", "hydrate"];

// Uses your installed Chrome so you don't need `playwright install`.
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 480, height: 1200 } });

for (const id of ids) {
  await page.goto(`${base}/studio?can=${id}`, { waitUntil: "load" });
  await page.waitForSelector("body[data-can-ready]", { timeout: 30_000 });
  await page.waitForTimeout(600); // let a few frames settle after the texture lands
  const dataUrl = await page.evaluate(() =>
    document.querySelector("canvas").toDataURL("image/webp", 0.92),
  );
  const out = `public/products/${id}.webp`;
  writeFileSync(out, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log(`✓ ${out}`);
}

await browser.close();
