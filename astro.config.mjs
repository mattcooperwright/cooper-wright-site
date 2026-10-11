// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { FONT_FAMILIES, fontVariable } from './src/lib/fonts';
import { fontFaces } from './src/lib/font-faces';

/**
 * @template T
 * @param {T[]} items
 * @param {string} what
 * @returns {[T, ...T[]]}
 */
function nonEmpty(items, what) {
  if (items.length === 0) throw new Error(`Font config: no ${what} found.`);
  return /** @type {[T, ...T[]]} */ (items);
}

// Self-hosted fonts from the pinned Fontsource packages. Pages load roles with <Font>.
const fonts = FONT_FAMILIES.map((font) => {
  const faces = fontFaces(font);
  return {
    provider: fontProviders.local(),
    name: font.family,
    cssVariable: fontVariable(font.role),
    fallbacks: [font.fallback],
    weights: /** @type {[string]} */ ([font.weights]),
    styles: nonEmpty([...new Set(faces.map((f) => f.style))], `styles for ${font.family}`),
    options: {
      variants: nonEmpty(
        faces.map((face) => ({
          src: /** @type {[string]} */ ([face.file]),
          weight: face.weight,
          style: face.style,
          unicodeRange: nonEmpty(face.unicodeRange, `unicode ranges for ${face.file}`),
        })),
        `faces for ${font.family}`,
      ),
    },
  };
});

export default defineConfig({
  site: 'https://cooper-wright.com',
  output: 'static',
  integrations: [react(), mdx()],
  fonts,
  vite: {
    plugins: [tailwindcss()],
  },
});
