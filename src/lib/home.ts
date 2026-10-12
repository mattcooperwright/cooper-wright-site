// Home page rules: which pages get a tile, in what order, and in which font role.
// No Astro imports here, so the rules can be unit-tested.
import { FONT_ROLES, type FontRole } from './fonts';

// Every published page, newest first by date. Drafts and unlisted pages are left out.
export function homePages<T extends { data: { status: string; date: Date } }>(pages: T[]): T[] {
  return pages
    .filter(({ data }) => data.status === 'published')
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// The home page shows only the newest published Writing pages.
export const HOME_ARTICLE_COUNT = 3;
export function recentArticles<T extends { data: { status: string; date: Date; section?: string } }>(
  pages: T[],
  count = HOME_ARTICLE_COUNT,
): T[] {
  return homePages(pages.filter(({ data }) => data.section === 'Writing')).slice(0, count);
}

// A tile uses indexStyle.fontFamily only when it names a font role; otherwise the plain role.
export function tileFontRole(fontFamily?: string): FontRole {
  return (FONT_ROLES as readonly string[]).includes(fontFamily ?? '') ? (fontFamily as FontRole) : 'plain';
}

// Tile colours when a page's indexStyle doesn't set them. Also used by the contrast check.
export const TILE_DEFAULTS = { background: '#ffffff', color: '#171717' } as const;
