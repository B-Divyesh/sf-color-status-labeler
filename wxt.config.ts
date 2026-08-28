import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Color Status Labeler',
    description: 'Add words and patterns to recurring color-only statuses on the sites you use.',
    version: '1.0.0',
    permissions: ['storage', 'activeTab'],
    action: { default_title: 'Color Status Labeler' },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png'
    }
  }
});
