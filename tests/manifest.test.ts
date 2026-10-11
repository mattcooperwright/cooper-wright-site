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
});
