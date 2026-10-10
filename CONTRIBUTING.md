# Como contribuir

Toda ajuda é bem-vinda, inclusive de quem não programa. O prazo é curto: o 2º turno é 25 de outubro.

## Jeitos de ajudar

- **Escrever o horóscopo de um dia** (`src/data/dias/AAAA-MM-DD.json`): 12 signos × 4 áreas, uma ou duas frases cada. Tom de horóscopo mesmo, leve, falando da vida real. Uma das áreas planta o gancho da proposta do dia.
- **Verificar um fato** (`src/data/propostas.json`): abrir a fonte, confirmar, trocar `status` para `verificado` e preencher `verificado_em`.
- **Propor um fato novo**: com fonte e link.
- **Código e design**: veja as issues.

## Regras de conteúdo

1. **Todo fato precisa de fonte com link**, e a fonte tem que ser uma que convença quem não votou no Lula: plano de governo no TSE, dados oficiais (IBGE, Diário Oficial, Câmara, Senado) ou imprensa de grande circulação. Site partidário ou de militância não serve.
2. **Sem exagero.** Use o número exato. Um dado inflado vira munição contra o projeto.
3. **Nada de atacar quem votou em outro candidato.** O leitor pode ter votado em qualquer um. Reconheça que a vida está difícil, dê um fato, faça uma pergunta.
4. **Nenhuma fake news, nem contra o Flávio.**
5. **Texto gerado por IA** precisa ser dito no PR.

## Fluxo

1. Abra uma issue ou escolha uma existente.
2. Faça o fork, crie uma branch, rode `npm run checar`.
3. Abra o PR descrevendo o que mudou e, se for fato, colando o link da fonte.

PRs aceitos em outubro recebem a label `hacktoberfest-accepted`.
