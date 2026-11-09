# Plano – Pipeline CI/CD do Germinaflix

## Terreno (Passo 1)

- Repositório: https://github.com/ArthurMachado2501/Germinaflix (público, branch padrão `main`).
- Site estático: 4 páginas HTML (`index.html`, `resenha_ilhaDoMedo.html`, `resenha_pecadores.html`, `sobre_o_desenvolvedor.html`), 4 CSS e a pasta `imgs/` (47 imagens). Sem JavaScript e sem `package.json`.
- Todas as referências locais são relativas (`./imgs/...`, `style.css`), então o subcaminho `/Germinaflix/` não deve quebrar nada. Os CSS não usam `url()` nem `@import`.
- URL do Pages: `https://arthurmachado2501.github.io/Germinaflix/`. O Pages já está ligado com origem "branch main" (`build_type=legacy`); será trocado para `workflow`.
- Riscos conhecidos:
  1. Subcaminho: nenhum link começa com `/` hoje; o script de links vai impedir que isso apareça no futuro.
  2. Maiúsculas/minúsculas: o Windows ignora, o runner Linux não. O script confere o nome exato do arquivo no disco.
- Pontos suspeitos vistos na leitura (o lint dirá se são problemas reais): `href=""` no filme 7 do `index.html`, `<meta http-equiv="refresh" content="5">` no `index.html`.

## Estratégia de CI

Um job `ci` com três verificações reais:

1. **Lint de HTML com `html-validate`.** Escolhida em vez de `htmlhint` porque é mantida ativamente, traz o conjunto `html-validate:recommended` (atributos obrigatórios, ids duplicados, `alt` ausente, elementos mal aninhados, `href` vazio) e roda só com Node, sem navegador.
2. **Script `scripts/check-links.mjs`** (Node, sem dependências): lê cada `.html`, extrai `href` e `src`, ignora URLs externas (`http:`, `https:`, `mailto:`, `#`), reprova links absolutos começando com `/` (quebram no subcaminho) e confere se o arquivo existe **com a grafia exata** (lê o diretório e compara nomes, o que detecta `Alee.jpg` vs `alee.jpg` mesmo no Windows). Também checa `href`/`src` vazios.
3. **`npm ci`** com `package-lock.json` commitado, para instalação reproduzível.

Gatilhos: `push` na `main` e `pull_request` para a `main`.

## Estratégia de CD

GitHub Pages por Actions, no mesmo workflow (`.github/workflows/ci-cd.yml`):

- Job `deploy` com `needs: ci` e `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`. Em PR ele fica *skipped*; se a CI falhar, não roda.
- `permissions` mínimas: `contents: read` no topo; `pages: write` e `id-token: write` apenas no `deploy`.
- `environment: github-pages`, `concurrency: group: pages` com `cancel-in-progress: false`.
- Artefato montado com apenas `index.html`, as outras páginas, os CSS e `imgs/` (nada de `node_modules`, `docs/`, `scripts/`).
- Após o deploy, um passo `curl` na URL publicada exige HTTP 200 e o texto "Achados do Tutu" (com algumas tentativas, por causa do atraso de propagação do Pages).

**Por que GitHub Pages:** o site é 100% estático (HTML, CSS, imagens), então não precisa de servidor, banco ou container. O Pages é gratuito, já está no mesmo lugar do código, entrega HTTPS e CDN, integra-se com `GITHUB_TOKEN`/OIDC sem guardar segredos, e a URL já é a que o projeto usa. Alternativas (Netlify, Vercel, Cloud Run) acrescentariam conta externa, tokens e custo sem ganho para este caso.

Versões das actions (conferidas em 2026-11-09 pela API de releases): `checkout` v7, `setup-node` v7, `configure-pages` v6, `upload-pages-artifact` v5, `deploy-pages` v5. Node 24 no runner.

## Ordem de execução da iteração 1 e critério de pronto

| # | Ação | Como saberemos que está pronto |
|---|------|-------------------------------|
| 1 | Criar branch `feat/ci-cd` | `git branch` mostra a branch |
| 2 | `package.json` + lockfile + `html-validate` + `.htmlvalidate.json` | `npm ci` roda limpo local e no runner (C5) |
| 3 | `scripts/check-links.mjs` | `npm run check:links` passa/falha como esperado (C6) |
| 4 | `.github/workflows/ci-cd.yml` | arquivo em `.github/workflows/` (C10); gatilhos push+PR (C1, C2); checkout/setup-node/npm ci (C3–C5) |
| 5 | Pages com origem Actions | `gh api repos/.../pages` mostra `build_type: workflow` |
| 6 | Testes locais | lint e links rodam na máquina |
| 7 | PR → CI roda, `deploy` *skipped* | `gh run view` (C2, C7) |
| 8 | Merge → CI e deploy em sequência, verde | `gh run view` (C7, C8) |
| 9 | `curl` na URL pública, dentro da pipeline e fora dela | HTTP 200 + texto esperado (C9) |
| 10 | PR descartável com erro real, fechado sem merge | deploy não executa quando a CI falha (gate C7) |
| 11 | ANALISE.md, PROCESSO.md, evidências, RELATORIO.md/PDF | C11, C12 |

Se algum item C1–C12 falhar, a iteração seguinte replaneja apenas os itens que falharam (máximo 4 iterações).
