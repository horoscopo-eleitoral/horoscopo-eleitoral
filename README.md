# Horóscopo Eleitoral

Um horóscopo diário, abertamente político, para o 2º turno da eleição presidencial de 2026 (25 de outubro).

A pessoa entra pra ler o signo. O horóscopo fala da vida real: trabalho, dinheiro, remédio, família. O "número da sorte" é sempre o 13, e quem pergunta "por que 13?" descobre um fato com fonte, uma pergunta e a recomendação dos astros. No fim, manda pra alguém de outro signo.

Inspirado no método do *Manual da Virada*: escutar, reconhecer que a vida está difícil, um fato, uma pergunta, um plano. Mensagem de conhecido vale mais que qualquer propaganda.

## Rodar

```bash
npm install
npm run dev        # http://localhost:4321
npm run checar     # confere o conteúdo
npm run build      # gera dist/
```

Para ver o site como se fosse outro dia: `DIA_FIXO=2026-10-12 npm run dev`.

O céu de cada dia (Sol, Lua, fase, planetas e retrógrados) é calculado por efemérides com `node scripts/calcular-ceu.mjs`, que preenche o campo `ceu` de cada arquivo em `src/data/dias/`. Os textos citam esses trânsitos reais; se criar um dia novo, rode o script antes de escrever.

## Onde fica o conteúdo

| Arquivo | O que é |
|---|---|
| `src/data/signos.json` | os 12 signos, período e "combina com" |
| `src/data/propostas.json` | banco de fatos com fonte (cada um com `status`) |
| `src/data/dias/AAAA-MM-DD.json` | o horóscopo de cada dia, por signo |

Só o dia atual (e os anteriores) entram no build. Dias futuros ficam fora até chegar a data; um job diário republica o site à meia-noite de Brasília.

## Fontes

Só vale fato com fonte verificável: planos de governo registrados no [TSE](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026-segundo-turno), dados oficiais (IBGE, Diário Oficial, Câmara, Senado) e imprensa de grande circulação. Nada de site partidário. Veja `CONTRIBUTING.md`.

## Créditos

Desenhos das constelações (`src/assets/constelacoes/`): série "Constellation of …" de [Firkin](https://openclipart.org/artist/Firkin) no [OpenClipart](https://openclipart.org/detail/302431), em domínio público. Recoloridos para usar a cor do tema.

## Licença

Código: MIT. Textos: CC BY-SA 4.0.
