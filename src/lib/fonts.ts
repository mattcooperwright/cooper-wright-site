// Font roles and the self-hosted families behind them. Documented in docs/fonts.md.
// No Astro imports here: the manifest schema reads FONT_ROLES.

export const FONT_ROLES = [
  'display',
  'body',
  'serif',
  'geometric',
  'poster',
  'humanist',
  'rounded',
  'grotesque',
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
  fallback: 'sans-serif' | 'serif';
}

export const FONT_FAMILIES: FontFamily[] = [
  {
    role: 'display',
    family: 'Inter',
    package: '@fontsource-variable/inter',
    version: '5.3.0',
    licence: 'OFL-1.1',
    stylesheets: ['wght.css'],
    weights: '100 900',
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
];

// The variable Astro defines when a page loads a role. Pages use the --font-<role>
// tokens in src/styles/global.css instead, which fall back to system fonts.
export const fontVariable = (role: FontRole) => `--webfont-${role}` as const;
