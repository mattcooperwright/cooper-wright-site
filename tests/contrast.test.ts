import { describe, expect, it } from 'vitest';
import { contrastRatio, parseColor } from '../src/lib/contrast';

describe('parseColor', () => {
  it('reads hex, rgb() and the two named colours', () => {
    expect(parseColor('#fff')).toEqual([255, 255, 255]);
    expect(parseColor('#F3F0EA')).toEqual([243, 240, 234]);
    expect(parseColor('#10172080')).toEqual([16, 23, 32]);
    expect(parseColor('rgb(243, 240, 234)')).toEqual([243, 240, 234]);
    expect(parseColor('rgba(0 0 0 / 50%)')).toEqual([0, 0, 0]);
    expect(parseColor('Black')).toEqual([0, 0, 0]);
  });

  it('returns null for colours it cannot check', () => {
    expect(parseColor('tomato')).toBeNull();
    expect(parseColor('var(--x)')).toBeNull();
    expect(parseColor('#12345')).toBeNull();
    expect(parseColor('rgb(300, 0, 0)')).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBeCloseTo(1, 5);
    expect(contrastRatio(parseColor('#777')!, parseColor('#fff')!)).toBeCloseTo(4.48, 2);
  });

  it('is symmetric', () => {
    const a = parseColor('#101720')!;
    const b = parseColor('#F7F7F2')!;
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });
});
