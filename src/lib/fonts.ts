// Font roles and the self-hosted families behind them. Documented in docs/fonts.md.
// No Astro imports here: the manifest schema reads FONT_ROLES.
import { fileURLToPath } from 'node:url';

export const FONT_ROLES = [
  'display',
  'body',
  'serif',
  'geometric',
  'poster',
  'humanist',
  'rounded',
  'grotesque',
  'plain',
  'mono',
] as const;

export type FontRole = (typeof FONT_ROLES)[number];

export interface FontFamily {
  role: FontRole;
  family: string;
  package: string;
  version: string;
  licence: string;
  // Stylesheets inside the package whose @font-face rules are used.
  stylesheets: string[];
  // Weights the family actually ships, as a CSS font-weight value.
  weights: string;
  fallback: 'sans-serif' | 'serif' | 'monospace';
}

// Vendored (non-Fontsource) font packages live under src/assets/fonts/<family>,
// laid out exactly like a Fontsource package (package.json, a stylesheet, files/)
// so font-faces.ts can read them with the same code path. Absolute path: it must
// resolve identically for font-faces.ts's require.resolve (anchored at src/lib/)
// and for Astro's local font provider (which resolves relative to the project root).
const OVERUSED_GROTESK_DIR = fileURLToPath(new URL('../assets/fonts/overused-grotesk', import.meta.url));

export const FONT_FAMILIES: FontFamily[] = [
  {
    // Previously Inter, added only as the open-licence stand-in for Neue Haas Grotesk
    // Display Pro (see docs/decisions.md, 2026-10-11) and unused by any real page.
    // Overused Grotesk is a purpose-built open alternative to that same typeface, so
    // it replaces Inter here rather than taking on a new role. Vendored, not on
    // Fontsource: pinned to github.com/RandomMaerks/Overused-Grotesk release
    // v0.5-alpha.2, subset to latin/latin-ext. See docs/fonts.md.
    role: 'display',
    family: 'Overused Grotesk',
    package: OVERUSED_GROTESK_DIR,
    version: '0.5.0-alpha.2',
    licence: 'OFL-1.1',
    stylesheets: ['overused-grotesk.css'],
    weights: '300 900',
    fallback: 'sans-serif',
  },
  {
    role: 'body',
    family: 'Hanken Grotesk',
    package: '@fontsource-variable/hanken-grotesk',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['wght.css', 'wght-italic.css'],
    weights: '100 900',
    fallback: 'sans-serif',
  },
  {
    role: 'serif',
    family: 'Newsreader',
    package: '@fontsource-variable/newsreader',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['wght.css', 'wght-italic.css'],
    weights: '200 800',
    fallback: 'serif',
  },
  {
    role: 'geometric',
    family: 'Outfit',
    package: '@fontsource-variable/outfit',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['wght.css'],
    weights: '100 900',
    fallback: 'sans-serif',
  },
  {
    role: 'poster',
    family: 'Gasoek One',
    package: '@fontsource/gasoek-one',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['400.css'],
    weights: '400',
    fallback: 'sans-serif',
  },
  {
    role: 'humanist',
    family: 'Sofia Sans',
    package: '@fontsource-variable/sofia-sans',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['wght.css'],
    weights: '1 1000',
    fallback: 'sans-serif',
  },
  {
    role: 'rounded',
    family: 'Rethink Sans',
    package: '@fontsource-variable/rethink-sans',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['wght.css', 'wght-italic.css'],
    weights: '400 800',
    fallback: 'sans-serif',
  },
  {
    role: 'grotesque',
    family: 'DM Sans',
    package: '@fontsource-variable/dm-sans',
    version: '5.3.0',
    licence: 'OFL-1.1',
    // opsz: optical sizing, as the archive's Google Fonts import had.
    stylesheets: ['opsz.css', 'opsz-italic.css'],
    weights: '100 1000',
    fallback: 'sans-serif',
  },
  {
    role: 'plain',
    family: 'Onest',
    package: '@fontsource-variable/onest',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['wght.css'],
    weights: '100 900',
    fallback: 'sans-serif',
  },
  {
    // The site menu, on every page. Also the face behind Tailwind's font-mono.
    role: 'mono',
    family: 'Roboto Mono',
    package: '@fontsource-variable/roboto-mono',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['wght.css'],
    weights: '100 700',
    fallback: 'monospace',
  },
];

// The variable Astro defines when a page loads a role. Pages use the --font-<role>
// tokens in src/styles/global.css instead, which fall back to system fonts.
export const fontVariable = (role: FontRole) => `--webfont-${role}` as const;
