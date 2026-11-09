# Registro do processo

## Iteração 1

**Quem fez:** Claude executou tudo (git, `gh`, arquivos) com a conta GitHub logada do Arthur, a partir de um único prompt. O Arthur não fez nenhuma alteração manual no código; a única outra mensagem dele foi uma autorização complementar ("se precisar, controle a minha tela e edite no meu github"), que não precisou ser usada.

**O que foi tentado**

1. Clonei o repositório, li os 4 HTML e os 4 CSS e conferi a branch padrão (`main`) e a URL do Pages. O Pages já estava ativo, com origem "branch main" (`build_type: legacy`).
2. Escrevi o `PLANO.md` (lint com `html-validate`, script de links, deploy com GitHub Pages).
3. Criei a branch `feat/ci-cd` e fiz 4 commits pequenos: `package.json` + lockfile + `.htmlvalidate.json`; `scripts/check-links.mjs`; `.github/workflows/ci-cd.yml`; plano e saída dos testes locais.
4. Troquei o Pages para origem GitHub Actions: `gh api -X PUT .../pages -f build_type=workflow` (PUT porque o Pages já existia).
5. Abri o PR #1, deixei a CI rodar, corrigi o site, fiz o merge e verifiquei o deploy.
6. Provei o gate com o PR descartável #2 (fechado sem merge, branch apagada).

**O que deu certo**

- Versões das actions conferidas pela API de releases antes de fixar (checkout v7.0.1, setup-node v7.1.0, configure-pages v6.0.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1).
- Nos testes locais, o script de links já apontou o `href=""` do filme 7 e o `html-validate` apontou 15 problemas, tudo antes de subir.
- PR #1: a CI falhou no primeiro run (lint, 15 erros reais) e o `deploy` ficou *skipped*. Depois da correção o run passou, ainda com `deploy` *skipped*.
- Merge na `main`: `ci` e `deploy` em sequência, verdes; `curl` na pipeline com HTTP 200 e "Achados do Tutu"; `curl` externo e screenshot confirmaram o site.
- PR descartável #2: CI vermelha por `Alee.jpg` (o arquivo real é `alee.jpg`) e `deploy` *skipped*.

**Problemas encontrados**

- `npm run lint` não roda localmente: o caminho da pasta contém `&` ("Instituto J&F") e o atalho do npm quebra (`Cannot find module 'C:\Users\arthurmachado-ieg\html-validate\bin\html-validate.mjs'`). Contorno só na máquina local: `node node_modules/html-validate/bin/html-validate.mjs "*.html"`. No runner Linux o `npm run lint` funciona normalmente.
- Erros reais no site:
  - `<meta http-equiv="refresh" content="5">` no `index.html`: a página recarregava sozinha a cada 5 segundos;
  - `href=""` no pôster do filme 7 (pego pelo script de links);
  - 10 elementos `<nav>` usados como caixa de pôster, sem nome acessível (`unique-landmark`);
  - link do Instagram com imagem sem `alt` (`wcag/h30`);
  - espaços no fim de linha em `index.html` (2) e `resenha_pecadores.html` (1).
- O Git avisa que converterá LF em CRLF nos arquivos novos (configuração local do Windows); não afetou a pipeline.

**Alterações feitas (todas por Claude)**

- Pipeline e tooling: `package.json`, `package-lock.json`, `.htmlvalidate.json`, `.gitignore`, `scripts/check-links.mjs`, `.github/workflows/ci-cd.yml`.
- Site (commit `fix: corrige problemas de HTML apontados pelo lint`): removido o meta refresh; `<nav>` trocado por `<div>` (o CSS não usava `nav`); removido o link vazio do filme 7 (ficou só a imagem, sem inventar um trailer); `alt="Instagram"` no ícone; espaços finais removidos.
- Configuração do GitHub: Pages com origem Actions.
- Documentos: `PLANO.md`, `ANALISE.md`, `PROCESSO.md`, `RELATORIO.md`, `RELATORIO.pdf`, `evidencias/`.

**Alterações manuais do Arthur:** nenhuma até aqui.

**Resultado da iteração:** C1 a C12 PASSOU (ver `ANALISE.md`, com a ressalva do C7). Sem segunda iteração.
