// Calcula o céu real de cada dia (posições tropicais geocêntricas ao meio-dia de Brasília)
// e grava no campo "ceu" de cada arquivo em src/data/dias/.
// Uso: node scripts/calcular-ceu.mjs
import { Body, GeoVector, Ecliptic, MoonPhase, SearchMoonQuarter } from 'astronomy-engine';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'dias');

const SIGNOS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
const CORPOS = [
  ['sol', Body.Sun], ['lua', Body.Moon], ['mercurio', Body.Mercury], ['venus', Body.Venus],
  ['marte', Body.Mars], ['jupiter', Body.Jupiter], ['saturno', Body.Saturn],
];
const QUARTOS = ['Lua nova', 'Quarto crescente', 'Lua cheia', 'Quarto minguante'];

// Longitude eclíptica geocêntrica (tropical), em graus.
function longitude(body, date) {
  return Ecliptic(GeoVector(body, date, true)).elon;
}
const signoDe = (lon) => SIGNOS[Math.floor(((lon % 360) + 360) % 360 / 30)];

function ceuDoDia(iso) {
  const meioDia = new Date(`${iso}T12:00:00-03:00`);
  const ontem = new Date(meioDia.getTime() - 86400000);
  const posicoes = {};
  const retrogrados = [];
  for (const [nome, body] of CORPOS) {
    const lon = longitude(body, meioDia);
    posicoes[nome] = signoDe(lon);
    if (nome !== 'sol' && nome !== 'lua') {
      const delta = ((lon - longitude(body, ontem) + 540) % 360) - 180;
      if (delta < 0) retrogrados.push(nome);
    }
  }
  // Lua: signo às 00h e às 23h59, para pegar o dia em que ela muda.
  const luaInicio = signoDe(longitude(Body.Moon, new Date(`${iso}T00:00:00-03:00`)));
  const luaFim = signoDe(longitude(Body.Moon, new Date(`${iso}T23:59:00-03:00`)));

  // Fase: nome exato no dia do quarto; nos outros dias, só crescente/minguante.
  const fase = MoonPhase(meioDia); // 0 nova, 90 quarto crescente, 180 cheia, 270 quarto minguante
  let faseNome = fase < 180 ? 'Lua crescente' : 'Lua minguante';
  if (fase > 150 && fase < 180) faseNome = 'Lua crescente, quase cheia';
  const inicioDoDia = new Date(`${iso}T00:00:00-03:00`);
  const proximoQuarto = SearchMoonQuarter(inicioDoDia);
  const dataBrasilia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' });
  const quartoHoje = dataBrasilia.format(proximoQuarto.time.date) === iso ? QUARTOS[proximoQuarto.quarter] : null;

  return {
    sol: posicoes.sol,
    lua: luaInicio === luaFim ? luaInicio : `${luaInicio} → ${luaFim}`,
    fase_da_lua: quartoHoje ?? faseNome,
    mercurio: posicoes.mercurio, venus: posicoes.venus, marte: posicoes.marte,
    jupiter: posicoes.jupiter, saturno: posicoes.saturno,
    retrogrados,
  };
}

for (const arq of readdirSync(raiz).filter((f) => f.endsWith('.json')).sort()) {
  const p = join(raiz, arq);
  const dia = JSON.parse(readFileSync(p, 'utf8'));
  dia.ceu = ceuDoDia(dia.data);
  // Mantém "ceu" logo depois de "cor_do_dia".
  const { data, frase_do_dia, cor_do_dia, ceu, signos } = dia;
  writeFileSync(p, JSON.stringify({ data, frase_do_dia, cor_do_dia, ceu, signos }, null, 2) + '\n');
  console.log(dia.data, `Sol ${ceu.sol} · Lua ${ceu.lua} (${ceu.fase_da_lua}) · Mercúrio ${ceu.mercurio} · Vênus ${ceu.venus} · Marte ${ceu.marte}`, ceu.retrogrados.length ? `· retrógrados: ${ceu.retrogrados.join(', ')}` : '');
}
