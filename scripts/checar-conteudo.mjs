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

// Data da fonte (dd/mm/aaaa no nome). Um fato não pode aparecer num dia anterior à própria fonte.
// "out/2026" sem dia exato só vale a partir do lançamento do site (10/out).
function desde(p) {
  const m = p.fonte?.nome?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  if (/out\/2026/.test(p.fonte?.nome ?? '')) return '2026-10-10';
  return '0000-00-00';
}
const disponivelEm = Object.fromEntries(propostas.map((p) => [p.id, desde(p)]));
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
    for (const id of [t.proposta, t.contraste].filter(Boolean)) {
      if (disponivelEm[id] > dia.data) erro(`${arq}: ${s} usa "${id}", cuja fonte é de ${disponivelEm[id]}, depois deste dia`);
    }
    for (const a of areas) if (t[a] === 'PENDENTE') erro(`${arq}: ${s} com "${a}" ainda PENDENTE`);
  }
}

if (erros) { console.error(`\n${erros} erro(s).`); process.exit(1); }
console.log('✓ conteúdo ok');
