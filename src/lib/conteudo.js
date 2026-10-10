import signos from '../data/signos.json';
import propostas from '../data/propostas.json';

const SEGUNDO_TURNO = '2026-10-25';
const INICIO_FASE_LEVAR = '2026-10-22';

// Fases do Manual da Virada: até 21/out "convencer"; de 22 a 25 "levar" (garantir que vá votar).
export function fase(dia = diaAtual()) {
  if (dia.data === SEGUNDO_TURNO) return 'eleicao';
  if (dia.data >= INICIO_FASE_LEVAR) return 'levar';
  return 'convencer';
}

// Todos os dias que existem em src/data/dias, ordenados.
const arquivos = import.meta.glob('../data/dias/*.json', { eager: true });
const dias = Object.values(arquivos)
  .map((m) => m.default ?? m)
  .sort((a, b) => a.data.localeCompare(b.data));

// "Hoje" no fuso de Brasília, no momento do build.
export function hojeISO() {
  if (process.env.DIA_FIXO) return process.env.DIA_FIXO;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

// O dia publicado é o mais recente que não está no futuro.
// Dias futuros ficam fora do build, então não vazam.
export function diaAtual() {
  const hoje = hojeISO();
  const liberados = dias.filter((d) => d.data <= hoje);
  return liberados[liberados.length - 1] ?? dias[0];
}

export function diasAteSegundoTurno() {
  const [y, m, d] = diaAtual().data.split('-').map(Number);
  const [y2, m2, d2] = SEGUNDO_TURNO.split('-').map(Number);
  const ms = Date.UTC(y2, m2 - 1, d2) - Date.UTC(y, m - 1, d);
  return Math.round(ms / 86400000);
}

export function dataPorExtenso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function todosSignos() {
  return signos;
}

export function signo(slug) {
  return signos.find((s) => s.slug === slug);
}

export function proposta(id) {
  return propostas.itens.find((p) => p.id === id);
}

export function leituraDoSigno(slug) {
  const dia = diaAtual();
  const s = signo(slug);
  const texto = dia.signos[slug];
  return {
    dia,
    signo: s,
    texto,
    proposta: proposta(texto.proposta),
    combina: signo(s.combina),
  };
}
