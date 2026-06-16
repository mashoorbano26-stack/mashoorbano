// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://Mashooroorbano.pages.dev',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false,
    imageService: 'passthrough',
    // This exposes Cloudflare runtime (including secrets) via Astro.locals.runtime
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    ssr: {
      external: ['node:crypto', 'node:buffer', 'node:stream', 'node:path'],
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'CIRCULAR_DEPENDENCY') return;
          warn(warning);
        },
      },
    },
  },
});
