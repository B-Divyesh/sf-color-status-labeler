export const PATTERNS = ['stripes', 'dots', 'crosshatch', 'bars'] as const;
export type Pattern = (typeof PATTERNS)[number];
export type ColorProperty = 'backgroundColor' | 'color' | 'borderTopColor' | 'fill' | 'stroke';

export interface StatusRule {
  id: string;
  label: string;
  color: string;
  property: ColorProperty;
  pattern: Pattern;
  tolerance: number;
  enabled: boolean;
  createdAt: number;
}

export interface SiteConfig {
  origin: string;
  enabled: boolean;
  rules: StatusRule[];
  updatedAt: number;
}

export const emptyConfig = (origin: string): SiteConfig => ({
  origin,
  enabled: true,
  rules: [],
  updatedAt: Date.now()
});
