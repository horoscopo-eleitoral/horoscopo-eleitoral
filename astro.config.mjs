import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// SITE e BASE podem ser sobrescritos no deploy (ex.: GitHub Pages usa BASE=/horoscopo-eleitoral).
const site = process.env.SITE ?? 'https://horoscopo-eleitoral.pages.dev';
const base = process.env.BASE ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
