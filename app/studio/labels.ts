import {
  WORDMARK_BUBBLES,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from "@/components/product-showcase/wordmark";

export type CanSpec = {
  id: string;
  /** Label gradient, top to bottom. */
  base: [string, string];
  /** Wordmark and headline color. */
  ink: string;
  /** Bottom band and details. */
  accent: string;
  /** Text on the bottom band. */
  onAccent: string;
  flavor: string;
  sub: string;
  claims: [string, string];
  /** Printed-aluminium look: higher = more metallic sheen. */
  metalness: number;
};

export const cans: CanSpec[] = [
  {
    id: "volt",
    base: ["#2442f0", "#1126b0"],
    ink: "#ffffff",
    accent: "#ff5a36",
    onAccent: "#ffffff",
    flavor: "VOLT",
    sub: "BLUE RASPBERRY ENERGY",
    claims: ["ZERO SUGAR", "80MG CAFFEINE"],
    metalness: 0.45,
  },
  {
    id: "cola",
    base: ["#d21a2c", "#9c0c1f"],
    ink: "#fff1dc",
    accent: "#161212",
    onAccent: "#fff1dc",
    flavor: "COLA",
    sub: "KALA KHATTA",
    claims: ["ZERO SUGAR", "ZERO CALORIES"],
    metalness: 0.45,
  },
  {
    id: "zero",
    base: ["#fbfbf9", "#e9e9e6"],
    ink: "#c8102e",
    accent: "#c8102e",
    onAccent: "#ffffff",
    flavor: "ZERO",
    sub: "VANILLA CREAM SODA",
    claims: ["ZERO SUGAR", "ZERO CALORIES"],
    metalness: 0.12,
  },
  {
    id: "hydrate",
    base: ["#f7e600", "#9cc31a"],
    ink: "#3b1f8f",
    accent: "#3b1f8f",
    onAccent: "#f7e600",
    flavor: "HYDRATE+",
    sub: "NIMBU LIME + ELECTROLYTES",
    claims: ["ELECTROLYTES", "ZERO SUGAR"],
    metalness: 0.3,
  },
];

// Label wraps the full can body. Aspect = circumference / body height.
export const LABEL_W = 3072;
export const LABEL_H = 2088;

/** Deterministic PRNG so every render of a label is identical. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  weight: number,
  maxWidth: number,
  maxSize: number,
) {
  let size = maxSize;
  ctx.font = `${weight} ${size}px ${family}`;
  const w = ctx.measureText(text).width;
  if (w > maxWidth) size = Math.floor((size * maxWidth) / w);
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}

/**
 * Paints one can label. The front of the can is the horizontal centre
 * of the canvas; the edges wrap round to the back.
 */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  spec: CanSpec,
  family: string,
) {
  const W = LABEL_W;
  const H = LABEL_H;
  const cx = W / 2;
  const front = 860; // comfortably readable width on the front face

  // Base
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, spec.base[0]);
  g.addColorStop(1, spec.base[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Fizz: bubbles everywhere, denser and bigger towards the bottom
  const rand = rng(spec.id.length * 7919);
  ctx.fillStyle = spec.ink;
  for (let i = 0; i < 260; i++) {
    const y = H * Math.pow(rand(), 0.6);
    const x = rand() * W;
    const r = 6 + (y / H) * 34 * rand();
    ctx.globalAlpha = 0.05 + 0.1 * rand();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Top rule + running line
  ctx.fillStyle = spec.ink;
  ctx.fillRect(0, 64, W, 10);
  ctx.font = `600 44px ${family}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  const top = "SPARKLING SODA  •  250ML  •  ";
  const topW = ctx.measureText(top).width;
  for (let x = cx - topW * 4; x < W + topW; x += topW) ctx.fillText(top, x, 142);

  // Wordmark, tilted like a sticker
  ctx.save();
  const scale = front / WORDMARK_VIEWBOX.width;
  ctx.translate(cx, 560);
  ctx.rotate((-9 * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.translate(-WORDMARK_VIEWBOX.width / 2, -(WORDMARK_VIEWBOX.y + WORDMARK_VIEWBOX.height / 2));
  ctx.fillStyle = spec.ink;
  ctx.fill(new Path2D(WORDMARK_PATH));
  for (const b of WORDMARK_BUBBLES) {
    ctx.beginPath();
    ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Flavor headline with an offset accent shadow
  const size = fitFont(ctx, spec.flavor, family, 800, front, 400);
  const fy = 1110;
  ctx.fillStyle = spec.accent;
  ctx.fillText(spec.flavor, cx + 12, fy + 12);
  ctx.fillStyle = spec.ink;
  ctx.fillText(spec.flavor, cx, fy);

  // Sub-flavor
  fitFont(ctx, spec.sub, family, 700, front, 78);
  ctx.fillText(spec.sub, cx, fy + size * 0.5 + 70);

  // Claims as outlined pills
  ctx.font = `700 46px ${family}`;
  const py = 1560;
  const gap = 28;
  const pw = spec.claims.map((c) => ctx.measureText(c).width + 72);
  let px = cx - (pw[0] + pw[1] + gap) / 2;
  ctx.lineWidth = 6;
  ctx.strokeStyle = spec.ink;
  spec.claims.forEach((c, i) => {
    ctx.beginPath();
    ctx.roundRect(px, py - 44, pw[i], 88, 44);
    ctx.stroke();
    ctx.fillText(c, px + pw[i] / 2, py + 2);
    px += pw[i] + gap;
  });

  // Bottom band
  ctx.fillStyle = spec.accent;
  ctx.fillRect(0, H - 250, W, 250);
  ctx.fillStyle = spec.onAccent;
  ctx.font = `800 64px ${family}`;
  const band = "ZUZU  •  FIZZ YOU CAN HEAR  •  ";
  const bandW = ctx.measureText(band).width;
  for (let x = cx - bandW * 4; x < W + bandW; x += bandW) ctx.fillText(band, x, H - 140);

  // Back of the can
  ctx.fillStyle = spec.ink;
  ctx.font = `600 40px ${family}`;
  ctx.fillText("BREWED IN CODE BY @RAHULDECODE", W * 0.08, 1300);
  ctx.fillText("A FICTIONAL BRAND. NOT FOR SALE.", W * 0.92, 1300);
}
