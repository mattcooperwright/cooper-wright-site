import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SECTIONS } from './manifest';
import { findRawHtml } from './markdown-safety';
import { contrastRatio, parseColor } from './contrast';
import { TILE_DEFAULTS } from './home';

export type Page = CollectionEntry<'pages'>;

const PAGES_DIR = join(process.cwd(), 'src/content/pages');
const PUBLIC_DIR = join(process.cwd(), 'public');
// Hydrated react pages get a route shim here, named after the slug.
const ROUTES_DIR = join(process.cwd(), 'src/pages');
const FIXED_ROUTES = new Set([
  'index.astro',
  '404.astro',
  '[slug].astro',
  '[section].astro',
  '[sandboxed].astro',
  'rss.xml.ts',
  'sitemap.xml.ts',
]);

export type Section = (typeof SECTIONS)[number];
// URL slug of each section's index page, e.g. /writing/.
export const sectionSlug = (section: Section) => section.toLowerCase();
// Page folder names that would collide with a fixed route.
const RESERVED_SLUGS = new Set([...SECTIONS.map(sectionSlug), 'rss.xml', 'sitemap.xml', 'robots.txt', '404']);

// The single payload file each page type expects next to its manifest.
// External pages have no payload: their url lives in the manifest.
const PAYLOAD_FILE: Record<Page['data']['type'], string | null> = {
  mdx: 'index.mdx',
  md: 'index.md',
  html: 'index.html',
  react: 'index.tsx',
  external: null,
};

const IGNORED_FILES = new Set(['manifest.json', '.DS_Store']);

const mdxPayloads = import.meta.glob<{ default: (props: Record<string, unknown>) => unknown }>(
  '/src/content/pages/*/index.mdx',
);
const reactPayloads = import.meta.glob<{ default: () => unknown }>('/src/content/pages/*/index.tsx');
const mdPayloads = import.meta.glob<{
  Content: (props: Record<string, unknown>) => unknown;
  rawContent: () => string;
}>('/src/content/pages/*/index.md');
const htmlPayloads = import.meta.glob<string>('/src/content/pages/*/index.html', {
  query: '?raw',
  import: 'default',
});

// Fails the build unless the folder holds the payload its type expects and nothing else,
// and any share image exists in public/.
function assertPage(page: Page): void {
  if (RESERVED_SLUGS.has(page.id)) {
    throw new Error(`Page folder "${page.id}" is reserved for a site route. Rename the folder.`);
  }
  const expected = PAYLOAD_FILE[page.data.type];
  const files = readdirSync(join(PAGES_DIR, page.id)).filter((f) => !IGNORED_FILES.has(f));
  const ok = expected ? files.length === 1 && files[0] === expected : files.length === 0;
  if (!ok) {
    throw new Error(
      `Page "${page.id}" has type "${page.data.type}" and must contain ` +
        `${expected ? `exactly one payload, ${expected}` : 'no payload'}. ` +
        `Found: ${files.length ? files.join(', ') : 'nothing'}.`,
    );
  }
  if (page.data.image && !existsSync(join(PUBLIC_DIR, page.data.image))) {
    throw new Error(`Page "${page.id}": image ${page.data.image} not found in public/.`);
  }
  if (page.data.type === 'md') {
    const [first] = findRawHtml(readFileSync(join(PAGES_DIR, page.id, 'index.md'), 'utf8'));
    if (first) {
      throw new Error(
        `Page "${page.id}": raw HTML is not allowed in md (line ${first.line}: ${first.html.slice(0, 60)}). ` +
          'Use type html for HTML, which runs sandboxed.',
      );
    }
  }
  if (page.data.hydrate && !existsSync(join(ROUTES_DIR, `${page.id}.astro`))) {
    throw new Error(`Page "${page.id}" has hydrate: true but no route shim at src/pages/${page.id}.astro.`);
  }
  // A shim is a static route, so it would publish a draft. Use unlisted instead.
  if (page.data.hydrate && page.data.status === 'draft' && import.meta.env.PROD) {
    throw new Error(`Page "${page.id}": a hydrated page cannot be a draft in a production build.`);
  }
}

// Every route shim must belong to a hydrated page.
function assertShims(pages: Page[]): void {
  const hydrated = new Set(pages.filter((p) => p.data.hydrate).map((p) => `${p.id}.astro`));
  for (const file of readdirSync(ROUTES_DIR)) {
    if (!FIXED_ROUTES.has(file) && !hydrated.has(file)) {
      throw new Error(`src/pages/${file} has no matching page with hydrate: true.`);
    }
  }
}

// Warns, without failing the build, when a page's tile colours are hard to read.
let contrastChecked = false;
function warnLowContrast(pages: Page[]): void {
  if (contrastChecked) return;
  contrastChecked = true;
  for (const page of pages) {
    const style = page.data.indexStyle;
    if (!style?.background && !style?.color) continue;
    const background = style.background ?? TILE_DEFAULTS.background;
    const color = style.color ?? TILE_DEFAULTS.color;
    const [bg, fg] = [parseColor(background), parseColor(color)];
    if (!bg || !fg) {
      console.warn(`[tiles] Page "${page.id}": can't check indexStyle contrast for ${color} on ${background}.`);
      continue;
    }
    const ratio = contrastRatio(fg, bg);
    if (ratio < 4.5) {
      console.warn(
        `[tiles] Page "${page.id}": indexStyle contrast ${ratio.toFixed(2)}:1 (${color} on ${background}) is below 4.5:1.`,
      );
    }
  }
}

async function getAllPages(): Promise<Page[]> {
  const pages = await getCollection('pages');
  pages.forEach(assertPage);
  assertShims(pages);
  warnLowContrast(pages);
  return pages;
}

// Pages that get their own route. Drafts only render in dev; external pages link out.
export async function getBuildPages(): Promise<Page[]> {
  const pages = await getAllPages();
  return pages.filter(
    ({ data }) => data.type !== 'external' && (data.status !== 'draft' || import.meta.env.DEV),
  );
}

// Pages rendered by [slug].astro. Hydrated pages have their own route shim,
// and html pages their own route so they never pull in the site stylesheet.
export async function getSlugRoutePages(): Promise<Page[]> {
  return (await getBuildPages()).filter(({ data }) => !data.hydrate && data.type !== 'html');
}

// Pages rendered by [sandboxed].astro: html payloads in the sandboxed shell.
export async function getHtmlPages(): Promise<Page[]> {
  return (await getBuildPages()).filter(({ data }) => data.type === 'html');
}

// The page a route shim renders. Fails the build if the shim and manifest disagree.
export async function getHydratedPage(id: string): Promise<Page> {
  const page = (await getBuildPages()).find((p) => p.id === id);
  if (!page?.data.hydrate) {
    throw new Error(`Route shim for "${id}" needs a react page with hydrate: true.`);
  }
  return page;
}

// Pages shown in the menu and the index, and the set any future sitemap should use.
export async function getListedPages(): Promise<Page[]> {
  const pages = await getAllPages();
  return pages.filter(({ data }) => data.status === 'published');
}

const newestFirst = (a: Page, b: Page) => b.data.date.getTime() - a.data.date.getTime();

// A section's published pages, newest first: its index page and, for Writing, the RSS feed.
export async function getSectionPages(section: Section): Promise<Page[]> {
  return (await getListedPages()).filter((p) => p.data.section === section).sort(newestFirst);
}

// Section index order: menuOrder ascending, then pages without one by date, newest first.
export const byMenuOrderThenNewest = (a: Page, b: Page) =>
  (a.data.menuOrder ?? Infinity) - (b.data.menuOrder ?? Infinity) || newestFirst(a, b);

export function isExternal(page: Page): boolean {
  return page.data.type === 'external';
}

export function pageHref(page: Page): string {
  return page.data.url ?? `/${page.id}/`;
}

export async function loadMdxPayload(page: Page) {
  const load = mdxPayloads[`/src/content/pages/${page.id}/index.mdx`];
  if (!load) throw new Error(`Page "${page.id}": index.mdx not found.`);
  return (await load()).default;
}

export async function loadReactPayload(page: Page) {
  const load = reactPayloads[`/src/content/pages/${page.id}/index.tsx`];
  if (!load) throw new Error(`Page "${page.id}": index.tsx not found.`);
  return (await load()).default;
}

export async function loadMdPayload(page: Page) {
  const load = mdPayloads[`/src/content/pages/${page.id}/index.md`];
  if (!load) throw new Error(`Page "${page.id}": index.md not found.`);
  return load();
}

export async function loadHtmlPayload(page: Page): Promise<string> {
  const load = htmlPayloads[`/src/content/pages/${page.id}/index.html`];
  if (!load) throw new Error(`Page "${page.id}": index.html not found.`);
  return load();
}

// UK date for display, e.g. "11 October 2026". Manifest dates are UTC midnight.
export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);

