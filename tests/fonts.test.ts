import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { fontFaces } from '../src/lib/font-faces';
import { FONT_FAMILIES, FONT_ROLES } from '../src/lib/fonts';

const require = createRequire(import.meta.url);

describe('font roles', () => {
  it('maps every role to exactly one family', () => {
    expect(FONT_FAMILIES.map((f) => f.role).sort()).toEqual([...FONT_ROLES].sort());
  });
});

describe.each(FONT_FAMILIES)('$family ($role)', (font) => {
  const pkg = require(`${font.package}/package.json`);

  it('matches the installed package version and an open licence', () => {
    expect(pkg.version).toBe(font.version);
    expect(pkg.license).toBe(font.licence);
    expect(font.licence).toMatch(/^OFL-/);
  });

  it('has latin and latin-ext faces whose files exist', () => {
    const faces = fontFaces(font);
    expect(new Set(faces.map((f) => f.subset))).toEqual(new Set(['latin', 'latin-ext']));
    for (const face of faces) expect(() => require.resolve(face.file)).not.toThrow();
  });

  it('records the weights the package ships', () => {
    for (const face of fontFaces(font)) expect(face.weight).toBe(font.weights);
  });
});
