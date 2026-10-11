// WCAG 2 contrast for indexStyle colours. No Astro imports, so it can be unit-tested.

export type Rgb = [number, number, number];

const NAMED: Record<string, Rgb> = { white: [255, 255, 255], black: [0, 0, 0] };

// Parses #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() and white/black.
// Alpha is ignored: a tile's colours are checked as if opaque. Returns null for anything else.
export function parseColor(css: string): Rgb | null {
  const value = css.trim().toLowerCase();
  if (value in NAMED) return NAMED[value];
  const hex = value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    const digits = hex[1].length <= 4 ? [...hex[1]].map((d) => d + d).join('') : hex[1];
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as Rgb;
  }
  const fn = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*[\d.%]+\s*)?\)$/);
  if (fn) {
    const rgb = fn.slice(1, 4).map(Number);
    return rgb.every((n) => n >= 0 && n <= 255) ? (rgb as Rgb) : null;
  }
  return null;
}

function luminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
