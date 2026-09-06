# 02: Pipeline de CI

**O que construir:** nenhum merge entra sem lint, typecheck, testes e migração
passando.

**Bloqueado por:** 01.

**Status:** done

- [x] CI roda `lint`, `typecheck`, `test` e `migrate` (Postgres efêmero de
      serviço) a cada PR e no push para `main` — `.github/workflows/ci.yml`.
- [~] PR com erro de tipo ou teste falho é bloqueado: o job `verify` falha
      corretamente; **habilitar o gate** é config do repositório no GitHub
      (branch ruleset exigindo o check `verify`) — passo manual documentado no
      README.
- [x] Relatório de cobertura comentado no PR
      (`davelosert/vitest-coverage-report-action`); threshold de 80% em
      `src/domain/**` faz o job falhar se cair abaixo.
- [x] Alvo de tempo ≤ 5 min: `timeout-minutes: 10` como teto duro;
      `concurrency` cancela runs obsoletos.

## Resultado

Verificado localmente (verde): `npm ci` (lockfile), `npx prisma generate`,
`npm run lint`, `npm run typecheck`, `npm run test:coverage` (domínio 100%,
threshold 80% OK), `npm run build`. Migração confirmada sem drift contra o
schema (`prisma migrate diff --from-empty`). Workflow validado com
`@action-validator/cli` (schema-válido).

Não executável neste ambiente: a run real no GitHub (sem remote) e o
`db:deploy` contra o Postgres de serviço — padrão canônico de service container,
comando correto (`prisma migrate deploy`).

### Mudanças

- `.github/workflows/ci.yml` — job `verify` em `ubuntu-latest` com service
  `postgres:16`.
- `.nvmrc` (`24`); `setup-node` usa `node-version-file` + cache npm.
- `vitest.config.ts` — reporters `json`/`json-summary`, `reportOnFailure`,
  threshold por glob em `src/domain/**`.
- `package.json` — script `test:coverage`; devDep `@vitest/coverage-v8`.
- `README.md` — seção "CI e proteção de branch" com o passo manual do ruleset.

### Pendente do usuário

1. Após criar o repo no GitHub: Settings → Branches → ruleset em `main`
   exigindo o status check `verify` (passos no README). Sem isso o CI roda mas
   não bloqueia merge.
