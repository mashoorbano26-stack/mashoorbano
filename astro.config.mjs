import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mashoorbano.pages.dev',
  output: 'static',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') && !page.includes('/api'),
    }),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
