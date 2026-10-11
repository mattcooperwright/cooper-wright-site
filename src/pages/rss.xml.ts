// RSS feed of published Writing pages, newest first.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getSectionPages, pageHref } from '../lib/pages';

export async function GET(context: APIContext) {
  const pages = await getSectionPages('Writing');
  return rss({
    title: 'Matt Cooper-Wright: Writing',
    description: 'Writing by Matt Cooper-Wright.',
    site: context.site!,
    items: pages.map((page) => ({
      title: page.data.title,
      description: page.data.description,
      pubDate: page.data.date,
      link: new URL(pageHref(page), context.site).href,
      categories: page.data.tags,
    })),
  });
}
