// Renders a mesh gradient with the studio's own engine (apps/mesh-gradient-studio/app/mesh.ts),
// using @napi-rs/canvas in place of the browser canvas.
import { createCanvas } from "@napi-rs/canvas";
import {
  INITIAL_COLOURS,
  QUICK_COLOUR_GROUPS,
  RANDOM_COLOURS,
  RATIOS,
  makeNodes,
  mulberry32,
  renderMesh,
  type Ratio,
} from "../../mesh-gradient-studio/app/mesh.ts";

export const MIN_COLOURS = 4;
export const MAX_COLOURS = 8;
export const MIN_SIZE = 256;
export const MAX_SIZE = 4096;
export const RATIO_NAMES = Object.keys(RATIOS) as [Ratio, ...Ratio[]];

export interface Palette {
  name: string;
  description: string;
  colours: string[];
}

export const PALETTES: Palette[] = [
  { name: "studio", description: "The studio's default: orange, yellow, magenta, violet, teal and near-black.", colours: INITIAL_COLOURS },
  ...QUICK_COLOUR_GROUPS.map((group) => ({
    name: group.name.toLowerCase().replace(/\s+/g, "-"),
    description: `The studio's quick colours: ${group.name.toLowerCase()}.`,
    colours: group.colours,
  })),
  { name: "spectrum", description: "The studio's full random colour pool, 12 colours across the spectrum. A random pick of 4 to 8 is used.", colours: RANDOM_COLOURS },
];

export interface GradientParams {
  colours?: string[];
  palette?: string;
  ratio?: Ratio;
  size?: number;
  grain?: number;
  blur?: number;
  seed?: number;
}

export interface Gradient {
  png: Buffer;
  jpegPreview: Buffer;
  width: number;
  height: number;
  colours: string[];
  ratio: Ratio;
  grain: number;
  blur: number;
  seed: number;
}

const HEX = /^#[0-9A-Fa-f]{6}$/;

/** Picks `count` colours from `pool` without repeats, deterministically from `seed`. */
function pick(pool: string[], count: number, seed: number): string[] {
  const random = mulberry32(seed);
  const rest = [...pool];
  const out: string[] = [];
  while (out.length < count && rest.length > 0) {
    out.push(rest.splice(Math.floor(random() * rest.length), 1)[0]);
  }
  return out;
}

export function resolveColours(params: Pick<GradientParams, "colours" | "palette">, seed: number): string[] {
  if (params.colours && params.palette) {
    throw new Error("Give either colours or palette, not both.");
  }
  let colours: string[];
  if (params.colours) {
    colours = params.colours;
  } else {
    const palette = PALETTES.find((p) => p.name === (params.palette ?? "studio"));
    if (!palette) {
      throw new Error(`Unknown palette "${params.palette}". Known palettes: ${PALETTES.map((p) => p.name).join(", ")}.`);
    }
    colours = palette.name === "spectrum" ? pick(palette.colours, MIN_COLOURS + Math.floor(mulberry32(seed)() * (MAX_COLOURS - MIN_COLOURS + 1)), seed) : palette.colours;
  }
  if (colours.length < MIN_COLOURS || colours.length > MAX_COLOURS) {
    throw new Error(`A mesh needs ${MIN_COLOURS} to ${MAX_COLOURS} colours, got ${colours.length}.`);
  }
  const bad = colours.filter((c) => !HEX.test(c));
  if (bad.length > 0) {
    throw new Error(`Colours must be 6-digit hex like #FF5C35. Not valid: ${bad.join(", ")}.`);
  }
  return colours.map((c) => c.toUpperCase());
}

const asCanvas = (canvas: object) => canvas as unknown as HTMLCanvasElement;

export function renderGradient(params: GradientParams = {}): Gradient {
  const seed = params.seed ?? Math.floor(Math.random() * 2 ** 31);
  const ratio = params.ratio ?? "1:1";
  const size = Math.round(params.size ?? 2048);
  const grain = params.grain ?? 18;
  const blur = params.blur ?? 28;
  if (!(ratio in RATIOS)) throw new Error(`Unknown ratio "${ratio}". Use one of ${RATIO_NAMES.join(", ")}.`);
  if (size < MIN_SIZE || size > MAX_SIZE) throw new Error(`size must be ${MIN_SIZE} to ${MAX_SIZE} pixels on the long edge.`);
  const colours = resolveColours(params, seed);

  // Same sizing rule as the studio's export: `size` is the long edge.
  const [rw, rh] = RATIOS[ratio];
  const [width, height] = rw >= rh ? [size, Math.round((size * rh) / rw)] : [Math.round((size * rw) / rh), size];

  const canvas = createCanvas(width, height);
  renderMesh(asCanvas(canvas), width, height, colours, makeNodes(colours.length, seed), grain, blur, () => asCanvas(createCanvas(1, 1)));

  // A small JPEG for showing inline. The full-size PNG is far too large to send as an image block.
  const scale = Math.min(1, 768 / Math.max(width, height));
  const preview = createCanvas(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
  preview.getContext("2d").drawImage(canvas, 0, 0, preview.width, preview.height);

  return {
    png: canvas.toBuffer("image/png"),
    jpegPreview: preview.toBuffer("image/jpeg", 85),
    width,
    height,
    colours,
    ratio,
    grain,
    blur,
    seed,
  };
}
