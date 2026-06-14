// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://mashurban.com',
  output: 'server',           // SSR for Cloudflare Pages — all pages server-rendered
  adapter: cloudflare({
    mode: 'directory',        // generates _worker.js directory for Pages Functions
    functionPerRoute: false,  // single worker bundle (free tier compatible)
    imageService: 'passthrough',
  }),
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') && !page.includes('/api'),
    }),
  ],
  vite: {
    ssr: {
      external: ['node:crypto', 'node:buffer', 'node:stream'],
    },
  },
});
