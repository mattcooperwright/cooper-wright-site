// Home page rules: which pages get a tile, in what order, and in which font role.
// No Astro imports here, so the rules can be unit-tested.
import { FONT_ROLES, type FontRole } from './fonts';

// Every published page, newest first by date. Drafts and unlisted pages are left out.
export function homePages<T extends { data: { status: string; date: Date } }>(pages: T[]): T[] {
  return pages
    .filter(({ data }) => data.status === 'published')
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// A tile uses indexStyle.fontFamily only when it names a font role; otherwise the body role.
export function tileFontRole(fontFamily?: string): FontRole {
  return (FONT_ROLES as readonly string[]).includes(fontFamily ?? '') ? (fontFamily as FontRole) : 'body';
}

// Tile colours when a page's indexStyle doesn't set them. Also used by the contrast check.
export const TILE_DEFAULTS = { background: '#ffffff', color: '#171717' } as const;
