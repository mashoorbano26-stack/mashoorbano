// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// NOTE: sitemap removed — it crashes in full SSR mode.
// Generate sitemap manually or add back only after site is live.

export default defineConfig({
  site: 'https://mashoorbano.pages.dev',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false,
    imageService: 'passthrough',
  }),
  integrations: [
    react(),
    tailwind(),
    // sitemap() removed — incompatible with output:'server' on Cloudflare
  ],
  vite: {
    ssr: {
      external: ['node:crypto', 'node:buffer', 'node:stream', 'node:path'],
    },
    build: {
      rollupOptions: {
        // Prevent circular chunk warnings from becoming errors
        onwarn(warning, warn) {
          if (warning.code === 'CIRCULAR_DEPENDENCY') return;
          warn(warning);
        },
      },
    },
  },
});
