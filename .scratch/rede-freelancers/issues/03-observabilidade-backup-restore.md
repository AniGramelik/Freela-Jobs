# 03: Observabilidade, backup e restore

**O que construir:** o time sabe quando algo quebra e consegue restaurar o banco.

**Bloqueado por:** 01.

**Status:** done

- [x] Logs estruturados (JSON) com correlação de request — `src/lib/logger.ts`
      (pino + `AsyncLocalStorage`; `runWithRequestContext` / `newRequestId`).
      Redação de segredos por padrão. O wrapper que abre o contexto por request
      entra no ticket 06 (junto com as rotas reais).
- [x] Error tracking de exceção não tratada — `instrumentation.ts`
      (`onRequestError`) + `src/app/global-error.tsx` chamam
      `reportError(err, ctx)` (`src/lib/observability.ts`), que loga stack +
      contexto e é o ponto de integração para Sentry (atrás de `SENTRY_DSN`).
- [x] `/healthz` cobre app, banco e fila — `src/app/healthz/route.ts` +
      `src/domain/health.ts` (agregação pura, testada). Verificado: com Postgres
      fora, responde `{status:"down", ...}` HTTP 503 e emite log JSON com stack;
      `queue` fica `skipped` até o ticket 05.
- [x] Backup diário com retenção 7 dias — `.github/workflows/backup.yml`
      (`pg_dump` diário → artefato, `retention-days: 7`) como reforço;
      `runbooks/backup.md` documenta a fonte primária (backups do provedor
      gerenciado, retenção 7 dias).
- [~] Restore em ambiente limpo com tempo medido — `runbooks/restore.md` tem os
      passos exatos (`pg_restore` com `time`) e a tabela de registro. O critério
      só fecha quando a **primeira linha do drill** estiver preenchida com um
      restore real (precisa de Postgres + dump).

## Resultado

Verde local: `typecheck`, `lint`, `test` (7 testes: +5 de `health`), `build`
(rota `/healthz` como dinâmica; `instrumentation.ts` reconhecido). `/healthz`
exercitado no dev server.

### Mudanças

- `src/lib/logger.ts`, `src/lib/observability.ts` — log estruturado + captura
  de erro abstraída.
- `instrumentation.ts`, `src/app/global-error.tsx` — hooks de erro.
- `src/domain/health.ts` (+ teste), `src/app/healthz/route.ts`.
- `.github/workflows/backup.yml`, `runbooks/backup.md`, `runbooks/restore.md`.
- `.env.example` — `LOG_LEVEL`, `SENTRY_DSN`.
- devDep de runtime: `pino`.

### Pendente do usuário

1. Ativar backups do provedor (Neon/Supabase) com retenção de 7 dias — passos em
   `runbooks/backup.md`.
2. Criar o secret `PRODUCTION_DATABASE_URL` e rodar o workflow de backup uma vez.
3. Fazer um drill de restore e preencher a tabela em `runbooks/restore.md`.
4. (Opcional) Definir `SENTRY_DSN` quando quiser error tracking externo.
