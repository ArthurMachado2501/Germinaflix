# Análise do checklist – Iteração 1

Repositório: https://github.com/ArthurMachado2501/Germinaflix · URL publicada: https://arthurmachado2501.github.io/Germinaflix/

Runs usados como prova (workflow `CI/CD`):

| Run | Evento | Branch | Resultado | Link |
|-----|--------|--------|-----------|------|
| 42605936433 | pull_request | feat/ci-cd | **falhou** (lint achou erros reais); `deploy` *skipped* | https://github.com/ArthurMachado2501/Germinaflix/actions/runs/42605936433 |
| 42606045502 | pull_request | feat/ci-cd | passou; `deploy` *skipped* | https://github.com/ArthurMachado2501/Germinaflix/actions/runs/42606045502 |
| 42606125771 | push | main | `ci` e `deploy` passaram | https://github.com/ArthurMachado2501/Germinaflix/actions/runs/42606125771 |
| 42606298085 | pull_request | test/gate-ci-falha (PR #2, fechado sem merge) | **falhou** (link com maiúscula errada); `deploy` *skipped* | https://github.com/ArthurMachado2501/Germinaflix/actions/runs/42606298085 |

| Item | Resultado | Evidência |
|------|-----------|-----------|
| C1. CI roda a cada push na `main` | PASSOU | `on.push.branches: [main]` em `.github/workflows/ci-cd.yml`; run 42606125771 tem `event: push` na `main` (`evidencias/06-main-run.json`). |
| C2. CI roda em `pull_request` para a `main` | PASSOU | `on.pull_request.branches: [main]`; runs 42605936433, 42606045502 e 42606298085 têm `event: pull_request` (`evidencias/03`, `05`, `10`). |
| C3. Faz o checkout | PASSOU | Passo `Checkout` (`actions/checkout@v7`) com ✓ em `evidencias/06-main-run-watch.txt`. |
| C4. Configura o ambiente | PASSOU | Passo `Configurar Node` (`actions/setup-node@v7`, Node 24, cache npm), ✓ no mesmo arquivo. |
| C5. Instala dependências com `npm ci` e lockfile commitado | PASSOU | `git ls-files package-lock.json` lista o arquivo; passo `Instalar dependências` (`npm ci`) ✓ no run 42606125771; teste local em `evidencias/01-local-iteracao1.txt`. |
| C6. Etapa real de verificação | PASSOU | `html-validate` (lint) e `scripts/check-links.mjs`. Prova de que são reais: o run 42605936433 falhou com 15 erros de lint no site (`evidencias/03-pr-run-falha.txt`) e o run 42606298085 falhou por `Alee.jpg` (`evidencias/10-gate-pr-descartavel.txt`). |
| C7. CD só após push na `main` e só se a CI passou; sem deploy em PR | PASSOU (com ressalva) | `deploy` tem `needs: ci` e `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`. Observado: `deploy` *skipped* nos 3 runs de PR (inclusive o que teve CI vermelha, `evidencias/10`) e executado depois do `ci` no push da `main` (`evidencias/06`). **Ressalva:** o caso "push na `main` com CI vermelha" não foi testado de fato, porque exigiria quebrar a `main`. Em PR o `if` já pula o `deploy`, então o run 42606298085 prova o comportamento em PR; a garantia do `needs: ci` na `main` vem da semântica do GitHub Actions, não de um teste. |
| C8. Estratégia adequada ao projeto | PASSOU | `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`; `permissions` no topo `contents: read` e, no `deploy`, `pages: write` + `id-token: write`; `environment: github-pages`; `concurrency: pages`. `gh api repos/.../pages` retorna `build_type: workflow` (`evidencias/02-pages-config.txt`). Artefato com só HTML, CSS e `imgs/`; `docs/` retorna 404 no site (`evidencias/08-curl-externo.txt`). |
| C9. Nova versão em URL pública, confirmada por `curl` na pipeline | PASSOU | Passo `Confirmar que o site está no ar`: `tentativa 1: HTTP 200` e `OK: ... respondeu 200 com o texto esperado` (`evidencias/07-curl-na-pipeline.txt`). Fora da pipeline: HTTP 200, "Achados do Tutu" nas linhas 8 e 19 e **0** ocorrências de `http-equiv="refresh"`, ou seja, é a versão nova (`evidencias/08-curl-externo.txt`). Screenshot: `evidencias/09-screenshot-site-publicado.png`. |
| C10. Pipeline em `.github/workflows/` | PASSOU | `.github/workflows/ci-cd.yml` (`git ls-files .github/workflows`). |
| C11. Registro do processo completo | PASSOU | `PLANO.md`, `PROCESSO.md` (seção "Iteração 1"), este `ANALISE.md` e `evidencias/` (01 a 10). |
| C12. Relatório final em um único PDF | PASSOU | `docs/lab-cicd/RELATORIO.pdf`, gerado do `RELATORIO.md` (ver `evidencias/11-pdf.txt`). |

## Decisão (Passo 7)

Nenhum item falhou na iteração 1. Não há segunda iteração.
