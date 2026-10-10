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

function svg({ titulo, subtitulo }) {
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
  <text x="380" y="270" font-family="Georgia, 'Playfair Display', serif" font-weight="700" font-size="74" fill="#f2ca50">${esc(titulo)}</text>
  <text x="380" y="340" font-family="Helvetica, Arial, sans-serif" font-size="36" fill="#d0c5af">${esc(subtitulo)}</text>
  <text x="380" y="430" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#dde1fa">Amor · Trabalho · Dinheiro · Saúde</text>
  <text x="380" y="560" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="28" fill="#f2ca50" letter-spacing="2">HORÓSCOPO ELEITORAL</text>
  <text x="380" y="596" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#d0c5af">conteúdo eleitoral independente · 2º turno, 25 de outubro</text>
</svg>`;
}

const todas = [
  { nome: 'default', titulo: 'Horóscopo do dia', subtitulo: 'Os 12 signos e o 2º turno' },
  ...signos.map((s) => ({ nome: s.slug, titulo: `Horóscopo de ${s.nome}`, subtitulo: `${s.periodo} · hoje e o 2º turno` })),
];

for (const img of todas) {
  const destino = img.nome === 'default' ? join(raiz, 'public/og.png') : join(saida, `${img.nome}.png`);
  await sharp(Buffer.from(svg(img))).png().toFile(destino);
}
console.log(`✓ ${todas.length} imagens OG geradas`);
