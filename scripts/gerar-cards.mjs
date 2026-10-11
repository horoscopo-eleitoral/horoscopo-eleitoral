// Gera os cards verticais (1080×1920) de cada signo para Stories e Status,
// um por dia já revelado, em public/cards/AAAAMMDD/<signo>.png.
// Uso: npm run cards  (roda sozinho antes do build)
import sharp from 'sharp';
import { mkdirSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const signos = JSON.parse(readFileSync(join(raiz, 'src/data/signos.json'), 'utf8'));
const pastaDias = join(raiz, 'src/data/dias');

const site = (process.env.SITE ?? 'https://horoscopo-eleitoral.pages.dev').replace(/^https?:\/\//, '').replace(/\/$/, '');
const base = (process.env.BASE ?? '/').replace(/\/$/, '');

// Mesmo critério do site: só dias até hoje (fuso de Brasília). Dias futuros não geram card.
const hoje = process.env.DIA_FIXO ?? new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const dataPorExtenso = (iso) => new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
}).format(new Date(`${iso}T12:00:00Z`));

// Quebra o texto em linhas de até `max` caracteres (estimativa conservadora,
// porque o servidor de build pode usar uma fonte substituta mais larga).
function quebrar(texto, max) {
  const linhas = [];
  let atual = '';
  for (const palavra of texto.split(/\s+/)) {
    if ((atual + ' ' + palavra).trim().length > max) { linhas.push(atual); atual = palavra; }
    else atual = (atual + ' ' + palavra).trim();
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function svg({ nome, periodo, data, area, frase, endereco }) {
  // Fonte menor para textos longos, para a frase sempre caber inteira (nunca cortada).
  const tamanhos = [
    { fonte: 44, max: 30, linhas: 6, altura: 62 },
    { fonte: 38, max: 35, linhas: 7, altura: 54 },
    { fonte: 33, max: 40, linhas: 8, altura: 47 },
    { fonte: 29, max: 46, linhas: 9, altura: 41 },
  ];
  const t = tamanhos.find((x) => quebrar(frase, x.max).length <= x.linhas) ?? tamanhos.at(-1);
  const linhas = quebrar(frase, t.max);
  if (linhas.length > t.linhas) throw new Error(`Frase longa demais para o card: ${nome}, ${data}`);
  const topoTexto = 1135;
  const texto = linhas
    .map((l, i) => `<text x="540" y="${topoTexto + i * t.altura}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${t.fonte}" fill="#dde1fa">${esc(l)}</text>`)
    .join('\n');
  const estrelas = Array.from({ length: 40 }, (_, i) => {
    const x = (i * 263) % 1080;
    const y = (i * 487) % 1920;
    return `<circle cx="${x}" cy="${y}" r="${1 + (i % 3)}" fill="#f2ca50" opacity="${0.15 + (i % 4) * 0.1}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#080d1e"/><stop offset="0.45" stop-color="#171338"/><stop offset="1" stop-color="#2a1650"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#ceu)"/>
  ${estrelas}
  <text x="540" y="150" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="34" letter-spacing="8" fill="#e5c365">✦ HORÓSCOPO ELEITORAL</text>
  <text x="540" y="210" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="36" fill="#d0c5af">${esc(data)}</text>
  <text x="540" y="905" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-weight="700" font-size="${nome.length > 9 ? 104 : 120}" fill="#f2ca50">${esc(nome)}</text>
  <text x="540" y="965" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="36" fill="#d0c5af">${esc(periodo)}</text>
  <text x="540" y="1055" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="6" fill="#e5c365">${esc(area.toUpperCase())}</text>
  ${texto}
  <circle cx="540" cy="1575" r="84" fill="#161b2c" stroke="#d4af37" stroke-width="4"/>
  <text x="540" y="1607" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-weight="700" font-size="92" fill="#f2ca50">13</text>
  <text x="540" y="1700" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="28" letter-spacing="4" fill="#d0c5af">NÚMERO DA SORTE</text>
  <text x="540" y="1792" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="32" fill="#f2ca50">Leia o seu: ${esc(endereco)}</text>
  <text x="540" y="1850" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="25" fill="#99907c">Conteúdo eleitoral independente · texto escrito com apoio de IA</text>
</svg>`;
}

const dias = readdirSync(pastaDias)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(pastaDias, f), 'utf8')))
  .filter((d) => d.data <= hoje);

// Apaga cards de dias que ainda não chegaram (sobras de testes com DIA_FIXO), para não vazarem no build.
const pastaCards = join(raiz, 'public/cards');
if (existsSync(pastaCards)) {
  const limite = hoje.replaceAll('-', '');
  for (const pasta of readdirSync(pastaCards)) if (pasta > limite) rmSync(join(pastaCards, pasta), { recursive: true });
}

let feitos = 0;
for (const dia of dias) {
  const pasta = join(raiz, 'public/cards', dia.data.replaceAll('-', ''));
  mkdirSync(pasta, { recursive: true });
  for (const s of signos) {
    const destino = join(pasta, `${s.slug}.png`);
    if (existsSync(destino) && process.env.REFAZER_CARDS !== '1') continue;
    const desenho = await sharp(join(raiz, `public/ilustracoes/${s.slug}.webp`))
      .resize({ width: 600, height: 560, fit: 'inside' })
      .png()
      .toBuffer({ resolveWithObject: true });
    const card = svg({
      nome: s.nome,
      periodo: s.periodo,
      data: dataPorExtenso(dia.data),
      area: 'Amor',
      frase: dia.signos[s.slug].amor,
      endereco: `${site}${base}/${s.slug}`,
    });
    await sharp(Buffer.from(card))
      .composite([{ input: desenho.data, left: Math.round((1080 - desenho.info.width) / 2), top: 250 + Math.round((560 - desenho.info.height) / 2) }])
      .png({ compressionLevel: 9 })
      .toFile(destino);
    feitos++;
  }
}
console.log(`✓ ${feitos} cards gerados (${dias.length} dias)`);
