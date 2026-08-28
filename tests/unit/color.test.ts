import { describe, expect, it } from 'vitest';
import { colorDistance, detectColor, parseCssColor, toHex } from '../../src/lib/color';

describe('CSS color utilities', () => {
  it('parses rgb, rgba, and hex values', () => {
    expect(parseCssColor('rgb(20, 91, 115)')).toEqual({ r: 20, g: 91, b: 115, a: 1 });
    expect(parseCssColor('rgba(23, 21, 18, 0.5)')).toEqual({ r: 23, g: 21, b: 18, a: 0.5 });
    expect(parseCssColor('#F2C94C')).toEqual({ r: 242, g: 201, b: 76, a: 1 });
  });

  it('normalizes opaque colors and rejects transparent ones', () => {
    expect(toHex('rgb(20, 91, 115)')).toBe('#145B73');
    expect(toHex('transparent')).toBeNull();
  });

  it('measures close colors using RGB distance', () => {
    expect(colorDistance('#145B73', 'rgb(22, 92, 117)')).toBeLessThan(4);
    expect(colorDistance('#145B73', '#A83B32')).toBeGreaterThan(100);
  });

  it('prefers a visible background when sampling an element', () => {
    expect(detectColor({ backgroundColor: 'rgb(242, 201, 76)', borderTopColor: 'rgb(23, 21, 18)', color: 'rgb(0, 0, 0)' } as CSSStyleDeclaration)).toEqual({ color: '#F2C94C', property: 'backgroundColor' });
  });
});
