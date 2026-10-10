import { defineConfig } from 'astro/config';

// SITE e BASE podem ser sobrescritos no deploy (ex.: GitHub Pages usa BASE=/horoscopo-eleitoral).
const site = process.env.SITE ?? 'https://horoscopoeleitoral.com.br';
const base = process.env.BASE ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
