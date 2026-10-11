import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Page = CollectionEntry<'pages'>;

const PAGES_DIR = join(process.cwd(), 'src/content/pages');

// The single payload file each page type expects next to its manifest.
const PAYLOAD_FILE: Record<Page['data']['type'], string> = {
  mdx: 'index.mdx',
  html: 'index.html',
  react: 'index.tsx',
  external: 'url.txt',
};

const IGNORED_FILES = new Set(['manifest.json', '.DS_Store']);

const mdxPayloads = import.meta.glob<{ default: (props: Record<string, unknown>) => unknown }>(
  '/src/content/pages/*/index.mdx',
);

// Fails the build unless the folder holds exactly one payload matching its type.
function assertPayload(page: Page): void {
  const expected = PAYLOAD_FILE[page.data.type];
  const files = readdirSync(join(PAGES_DIR, page.id)).filter((f) => !IGNORED_FILES.has(f));
  if (files.length !== 1 || files[0] !== expected) {
    throw new Error(
      `Page "${page.id}" has type "${page.data.type}" and must contain exactly one payload, ` +
        `${expected}. Found: ${files.length ? files.join(', ') : 'nothing'}.`,
    );
  }
  if (page.data.type !== 'mdx') {
    throw new Error(`Page "${page.id}": type "${page.data.type}" is not implemented yet.`);
  }
}

export async function getVisiblePages(): Promise<Page[]> {
  const pages = await getCollection('pages', ({ data }) => data.visible);
  pages.forEach(assertPayload);
  return pages;
}

// Menu order: menuOrder ascending, pages without one last, then by title.
export async function getMenuPages(): Promise<Page[]> {
  const pages = await getVisiblePages();
  return pages.sort(
    (a, b) =>
      (a.data.menuOrder ?? Infinity) - (b.data.menuOrder ?? Infinity) ||
      a.data.title.localeCompare(b.data.title),
  );
}

export async function loadMdxPayload(page: Page) {
  const load = mdxPayloads[`/src/content/pages/${page.id}/index.mdx`];
  if (!load) throw new Error(`Page "${page.id}": index.mdx not found.`);
  return (await load()).default;
}
