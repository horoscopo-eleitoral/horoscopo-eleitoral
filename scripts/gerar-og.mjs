// Gera as imagens de prévia de link (1200×630) em public/og/.
// Uso: npm run og  (roda sozinho antes do build)
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const signos = JSON.parse(readFileSync(join(raiz, 'src/data/signos.json'), 'utf8'));
const saida = join(raiz, 'public/og');
mkdirSync(saida, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Ilustração do signo (José Arija, 1904, domínio público) à direita, já em dourado.
async function ilustracao(slug) {
  if (!slug) return null;
  const arquivo = join(raiz, `public/ilustracoes/${slug}.webp`);
  return sharp(arquivo).resize({ width: 290, height: 540, fit: 'inside' }).png().toBuffer({ resolveWithObject: true });
}

function svg({ nome, sobretitulo, titulo, subtitulo }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#080d1e"/>
  <circle cx="1040" cy="120" r="260" fill="#0e1324"/>
  <circle cx="150" cy="560" r="180" fill="#161b2c"/>
  <g fill="#f2ca50" opacity=".9">
    <circle cx="180" cy="110" r="4"/><circle cx="260" cy="70" r="3"/><circle cx="330" cy="150" r="2"/>
    <circle cx="900" cy="520" r="4"/><circle cx="980" cy="470" r="2"/><circle cx="1100" cy="560" r="3"/>
  </g>
  <circle cx="200" cy="300" r="120" fill="#161b2c" stroke="#d4af37" stroke-width="3"/>
  <text x="200" y="350" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-weight="700" font-size="140" fill="#f2ca50">13</text>
  <text x="200" y="455" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#d0c5af" letter-spacing="2">NÚMERO DA SORTE</text>
  <text x="380" y="200" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#d0c5af">${esc(sobretitulo)}</text>
  <text x="380" y="290" font-family="Georgia, 'Playfair Display', serif" font-weight="700" font-size="${titulo.length > 9 ? 70 : 84}" fill="#f2ca50">${esc(titulo)}</text>
  <text x="380" y="350" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#d0c5af">${esc(subtitulo)}</text>
  <text x="380" y="560" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="28" fill="#f2ca50" letter-spacing="2">HORÓSCOPO ELEITORAL</text>
  <text x="380" y="596" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#d0c5af">conteúdo eleitoral independente · 2º turno, 25 de outubro</text>
</svg>`;
}

const todas = [
  { nome: 'default', sobretitulo: 'Horóscopo do dia', titulo: 'Os 12 signos', subtitulo: 'e o que os astros dizem do 2º turno' },
  ...signos.map((s) => ({ nome: s.slug, sobretitulo: 'Horóscopo de hoje', titulo: s.nome, subtitulo: s.periodo })),
];

for (const img of todas) {
  const destino = img.nome === 'default' ? join(raiz, 'public/og.png') : join(saida, `${img.nome}.png`);
  const desenho = await ilustracao(img.nome === 'default' ? null : img.nome);
  const camadas = desenho ? [{ input: desenho.data, left: 1175 - desenho.info.width, top: Math.round((630 - desenho.info.height) / 2) }] : [];
  await sharp(Buffer.from(svg(img))).composite(camadas).png().toFile(destino);
}
console.log(`✓ ${todas.length} imagens OG geradas`);
