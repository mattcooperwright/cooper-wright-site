// Reads @font-face rules from a Fontsource package's own CSS, so file names and
// unicode ranges always match the installed version. Runs in Node at build time.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { FontFamily } from './fonts';

const require = createRequire(import.meta.url);

// Only these subsets are served. Others, such as Cyrillic or Korean, are skipped.
export const SUBSETS = ['latin', 'latin-ext'] as const;

export interface FontFace {
  file: string;
  subset: string;
  style: 'normal' | 'italic';
  weight: string;
  unicodeRange: string[];
}

function read(block: string, property: string): string {
  const match = block.match(new RegExp(`${property}:\\s*([^;]+);`));
  if (!match) throw new Error(`@font-face rule is missing ${property}: ${block}`);
  return match[1].trim();
}

export function fontFaces(font: FontFamily): FontFace[] {
  const faces: FontFace[] = [];
  for (const stylesheet of font.stylesheets) {
    const css = readFileSync(require.resolve(`${font.package}/${stylesheet}`), 'utf8');
    for (const [, block] of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
      const file = read(block, 'src').match(/url\(\.\/files\/([^)]+\.woff2)\)/)?.[1];
      if (!file) throw new Error(`No woff2 source in ${font.package}/${stylesheet}`);
      const subset = SUBSETS.find((s) => file.match(new RegExp(`-${s}-[^-]+-(normal|italic)\\.woff2$`)));
      if (!subset) continue;
      faces.push({
        file: `${font.package}/files/${file}`,
        subset,
        style: read(block, 'font-style') as FontFace['style'],
        weight: read(block, 'font-weight'),
        unicodeRange: read(block, 'unicode-range').split(','),
      });
    }
  }
  return faces;
}
