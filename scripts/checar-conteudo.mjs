// Confere se o conteúdo está consistente antes do build.
// Uso: npm run checar
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const ler = (p) => JSON.parse(readFileSync(join(raiz, p), 'utf8'));

const signos = ler('signos.json').map((s) => s.slug);
const propostas = ler('propostas.json').itens;
const lado = Object.fromEntries(propostas.map((p) => [p.id, p.lado]));
const areas = ['amor', 'trabalho', 'dinheiro', 'saude', 'proposta', 'recomendacao'];

let erros = 0;
const erro = (m) => { console.error('✗', m); erros++; };

for (const p of propostas) {
  if (!p.fonte?.url) erro(`proposta "${p.id}" sem fonte.url`);
  if (!['lula', 'flavio'].includes(p.lado)) erro(`proposta "${p.id}" com lado inválido`);
  if (p.status !== 'verificado') console.warn(`⚠ proposta "${p.id}" ainda está como "${p.status}"`);
}

for (const arq of readdirSync(join(raiz, 'dias')).filter((f) => f.endsWith('.json'))) {
  const dia = ler(join('dias', arq));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia.data) || arq !== `${dia.data}.json`) erro(`${arq}: campo "data" não bate com o nome do arquivo`);
  if (!dia.ceu?.sol || !dia.ceu?.lua) erro(`${arq}: sem "ceu" (rode: node scripts/calcular-ceu.mjs)`);
  for (const s of signos) {
    const t = dia.signos?.[s];
    if (!t) { erro(`${arq}: falta o signo "${s}"`); continue; }
    for (const a of areas) if (!t[a]) erro(`${arq}: ${s} sem "${a}"`);
    if (t.proposta && lado[t.proposta] !== 'lula') erro(`${arq}: ${s} usa proposta "${t.proposta}" inexistente ou que não é do lado lula`);
    if (t.contraste && lado[t.contraste] !== 'flavio') erro(`${arq}: ${s} usa contraste "${t.contraste}" inexistente ou que não é do lado flavio`);
  }
}

if (erros) { console.error(`\n${erros} erro(s).`); process.exit(1); }
console.log('✓ conteúdo ok');
