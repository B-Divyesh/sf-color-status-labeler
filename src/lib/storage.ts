import { browser } from 'wxt/browser';
import { emptyConfig, type SiteConfig } from './types';

export const storageKey = (origin: string) => `color-status-labeler:${origin}`;

export async function getSiteConfig(origin: string): Promise<SiteConfig> {
  const key = storageKey(origin);
  const result = await browser.storage.local.get(key);
  const config = result[key] as SiteConfig | undefined;
  return config?.origin === origin ? config : emptyConfig(origin);
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const updated = { ...config, updatedAt: Date.now() };
  await browser.storage.local.set({ [storageKey(config.origin)]: updated });
}
