import { describe, expect, it } from 'vitest';
import { manifestSchema, type ManifestInput } from '../src/lib/manifest';

const mdx: ManifestInput = {
  schemaVersion: 1,
  title: 'Hello',
  description: 'A page.',
  date: '2026-10-11',
  type: 'mdx',
};

const external: ManifestInput = {
  schemaVersion: 1,
  title: 'Elsewhere',
  description: 'A page on another site.',
  date: '2026-10-11',
  type: 'external',
  url: 'https://example.com/',
};

function issuesFor(input: unknown) {
  const result = manifestSchema.safeParse(input);
  expect(result.success).toBe(false);
  return result.error!.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
}

describe('manifestSchema', () => {
  it('accepts a minimal mdx manifest and applies defaults', () => {
    const data = manifestSchema.parse(mdx);
    expect(data.date).toEqual(new Date('2026-10-11'));
    expect(data.status).toBe('published');
    expect(data.navTheme).toBe('auto');
    expect(data.source).toBe('manual');
    expect(data.fonts).toEqual([]);
    expect(data.hydrate).toBe(false);
  });

  it('accepts an external manifest with a url', () => {
    expect(manifestSchema.parse(external).url).toBe('https://example.com/');
  });

  it('accepts every optional field', () => {
    const result = manifestSchema.safeParse({
      ...mdx,
      status: 'unlisted',
      section: 'Writing',
      updated: '2026-10-12',
      tags: ['design', 'notes'],
      menuOrder: 2,
      navTheme: 'dark',
      image: '/images/share.png',
      indexStyle: { background: '#000', color: '#fff', fontFamily: 'Georgia, serif' },
      source: 'publisher',
      fonts: ['body', 'poster'],
    });
    expect(result.success).toBe(true);
  });

  it.each(['schemaVersion', 'title', 'description', 'date', 'type'] as const)(
    'rejects a manifest missing %s',
    (field) => {
      const { [field]: _omitted, ...rest } = mdx;
      expect(issuesFor(rest).map((i) => i.path)).toContain(field);
    },
  );

  it('rejects an external page without a url', () => {
    const { url: _omitted, ...rest } = external;
    expect(issuesFor(rest)).toContainEqual({
      path: 'url',
      message: 'url is required when type is external',
    });
  });

  it('rejects a url on a non-external page', () => {
    expect(issuesFor({ ...mdx, url: 'https://example.com/' })).toContainEqual({
      path: 'url',
      message: 'url is only allowed when type is external',
    });
  });

  it('rejects unknown fields, including slug', () => {
    expect(issuesFor({ ...mdx, slug: 'hello' })[0].message).toMatch(/slug/);
  });

  it('rejects an unknown section and a non-http url', () => {
    expect(issuesFor({ ...mdx, section: 'Notes' }).map((i) => i.path)).toContain('section');
    expect(issuesFor({ ...external, url: 'javascript:alert(1)' }).map((i) => i.path)).toContain('url');
  });

  it('rejects a font role that does not exist', () => {
    expect(issuesFor({ ...mdx, fonts: ['body', 'Inter'] }).map((i) => i.path)).toContain('fonts.1');
  });

  it('accepts the md type', () => {
    expect(manifestSchema.parse({ ...mdx, type: 'md' }).type).toBe('md');
  });

  it('accepts hydrate on a react page and rejects it on any other type', () => {
    expect(manifestSchema.parse({ ...mdx, type: 'react', hydrate: true }).hydrate).toBe(true);
    expect(issuesFor({ ...mdx, type: 'md', hydrate: true }).map((i) => i.path)).toContain('hydrate');
    expect(issuesFor({ ...mdx, hydrate: true })).toContainEqual({
      path: 'hydrate',
      message: 'hydrate is only allowed when type is react',
    });
  });
});
