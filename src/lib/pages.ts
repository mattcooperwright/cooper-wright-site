import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SECTIONS } from './manifest';

export type Page = CollectionEntry<'pages'>;
export type MenuGroup = { label: string; pages: Page[] };

const PAGES_DIR = join(process.cwd(), 'src/content/pages');
const PUBLIC_DIR = join(process.cwd(), 'public');

// The single payload file each page type expects next to its manifest.
// External pages have no payload: their url lives in the manifest.
const PAYLOAD_FILE: Record<Page['data']['type'], string | null> = {
  mdx: 'index.mdx',
  html: 'index.html',
  react: 'index.tsx',
  external: null,
};

const IGNORED_FILES = new Set(['manifest.json', '.DS_Store']);

const mdxPayloads = import.meta.glob<{ default: (props: Record<string, unknown>) => unknown }>(
  '/src/content/pages/*/index.mdx',
);

// Fails the build unless the folder holds the payload its type expects and nothing else,
// and any share image exists in public/.
function assertPage(page: Page): void {
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
  if (page.data.type === 'html' || page.data.type === 'react') {
    throw new Error(`Page "${page.id}": type "${page.data.type}" is not implemented yet.`);
  }
}

async function getAllPages(): Promise<Page[]> {
  const pages = await getCollection('pages');
  pages.forEach(assertPage);
  return pages;
}

// Pages that get their own route. Drafts only render in dev; external pages link out.
export async function getBuildPages(): Promise<Page[]> {
  const pages = await getAllPages();
  return pages.filter(
    ({ data }) => data.type !== 'external' && (data.status !== 'draft' || import.meta.env.DEV),
  );
}

// Pages shown in the menu and the index, and the set any future sitemap should use.
export async function getListedPages(): Promise<Page[]> {
  const pages = await getAllPages();
  return pages.filter(({ data }) => data.status === 'published');
}

const byMenuOrderThenNewest = (a: Page, b: Page) =>
  (a.data.menuOrder ?? Infinity) - (b.data.menuOrder ?? Infinity) ||
  b.data.date.getTime() - a.data.date.getTime();

// Writing, Projects, Experiments, then pages with no section under "More".
export async function getMenuGroups(): Promise<MenuGroup[]> {
  const pages = await getListedPages();
  const labels = [...SECTIONS, 'More'];
  return labels
    .map((label) => ({
      label,
      pages: pages
        .filter((p) => (p.data.section ?? 'More') === label)
        .sort(byMenuOrderThenNewest),
    }))
    .filter((group) => group.pages.length > 0);
}

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
