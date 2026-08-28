import type { ColorProperty } from './types';

export type RGB = { r: number; g: number; b: number; a: number };

export function parseCssColor(value: string): RGB | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const hex = normalized.match(/^#([0-9a-f]{6})$/i);
  if (hex) return {
    r: Number.parseInt(hex[1].slice(0, 2), 16),
    g: Number.parseInt(hex[1].slice(2, 4), 16),
    b: Number.parseInt(hex[1].slice(4, 6), 16),
    a: 1
  };
  const rgb = normalized.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d*(?:\.\d+)?))?\s*\)$/);
  if (!rgb) return null;
  return {
    r: Math.min(255, Number(rgb[1])),
    g: Math.min(255, Number(rgb[2])),
    b: Math.min(255, Number(rgb[3])),
    a: rgb[4] === undefined ? 1 : Math.min(1, Number(rgb[4]))
  };
}

export function toHex(value: string): string | null {
  const rgb = parseCssColor(value);
  if (!rgb || rgb.a === 0) return null;
  return `#${[rgb.r, rgb.g, rgb.b].map((part) => Math.round(part).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function colorDistance(left: string, right: string): number {
  const a = parseCssColor(left);
  const b = parseCssColor(right);
  if (!a || !b || a.a === 0 || b.a === 0) return Number.POSITIVE_INFINITY;
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export function detectColor(style: Pick<CSSStyleDeclaration, ColorProperty>): { color: string; property: ColorProperty } | null {
  const candidates: ColorProperty[] = ['backgroundColor', 'fill', 'borderTopColor', 'stroke', 'color'];
  for (const property of candidates) {
    const color = toHex(style[property]);
    if (color) return { color, property };
  }
  return null;
}
