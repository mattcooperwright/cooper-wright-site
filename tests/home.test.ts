import { describe, expect, it } from 'vitest';
import { homePages, tileFontRole } from '../src/lib/home';

const page = (id: string, status: string, date: string) => ({ id, data: { status, date: new Date(date) } });

describe('homePages', () => {
  const pages = [
    page('old', 'published', '2025-01-01'),
    page('draft', 'draft', '2026-09-01'),
    page('new', 'published', '2026-10-01'),
    page('hidden', 'unlisted', '2026-08-01'),
    page('mid', 'published', '2026-03-01'),
  ];

  it('excludes draft and unlisted pages', () => {
    expect(homePages(pages).map((p) => p.id)).not.toContain('draft');
    expect(homePages(pages).map((p) => p.id)).not.toContain('hidden');
  });

  it('orders by date, newest first', () => {
    expect(homePages(pages).map((p) => p.id)).toEqual(['new', 'mid', 'old']);
  });

  it('does not reorder the input', () => {
    const ids = pages.map((p) => p.id);
    homePages(pages);
    expect(pages.map((p) => p.id)).toEqual(ids);
  });
});

describe('tileFontRole', () => {
  it('keeps a font role name', () => {
    expect(tileFontRole('serif')).toBe('serif');
    expect(tileFontRole('poster')).toBe('poster');
  });

  it('falls back to plain for anything else', () => {
    expect(tileFontRole('Georgia')).toBe('plain');
    expect(tileFontRole('var(--font-serif)')).toBe('plain');
    expect(tileFontRole(undefined)).toBe('plain');
  });
});
