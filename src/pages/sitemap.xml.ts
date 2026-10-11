// Sitemap of published pages on this site. Unlisted, draft and external pages are left out.
import type { APIContext } from 'astro';
import { SECTIONS } from '../lib/manifest';
import { getListedPages, isExternal, sectionSlug } from '../lib/pages';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(context: APIContext) {
  const pages = (await getListedPages()).filter((page) => !isExternal(page));
  const entries = [
    { path: '/' },
    ...SECTIONS.map((section) => ({ path: `/${sectionSlug(section)}/` })),
    ...pages.map((page) => ({ path: `/${page.id}/`, lastmod: page.data.updated ?? page.data.date })),
  ];
  const urls = entries.map(({ path, lastmod }: { path: string; lastmod?: Date }) => {
    const loc = escape(new URL(path, context.site).href);
    return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
