# 05: Notifier + Outbox (e-mail + push)

**O que construir:** o sistema envia uma notificação transacional de forma
confiável, sem bloquear o request do usuário, com um gatilho de dev para
demonstrar.

**Bloqueado por:** 01.

**Status:** done

Decisão pendente (D4): provedor real de e-mail e estratégia de push.
Implementado atrás da interface `Notifier` com um provedor de log; trocar pelo
real é follow-up trivial.

- [x] Interface `Notifier` (`src/use-cases/notifier.ts`) com canais `EMAIL` e
      `PUSH`; provedores de log em `notification-providers.ts`.
- [x] `OutboxMessage` gravada na mesma transação — `enqueueOutbox(db, ...)`,
      idempotente por `dedupeKey` (P2002 → `{ enqueued: false }`).
      `processOutboxOnce(deps)` reivindica lote (select + claim com guard
      `status: PENDING`), despacha, aplica backoff exponencial
      (`src/domain/notifications.ts`).
- [x] `NotificationLog` por canal: `SENT` no sucesso, `FAILED` na exceção do
      provedor (com `error`).
- [x] Preferências por categoria: `NotificationOptOut` + regra pura `canSend`;
      transacionais (`auth`, `callout`, `invite`, `application_*`) ignoram
      opt-out; `digest`/`marketing` respeitam.
- [x] Testes: worker cai no meio → mensagem presa em `PROCESSING` é recuperada
      após `staleProcessingMs`; reprocessar `DONE` não reenvia; falha agenda
      retry; 5 falhas → `DEAD`. (7 testes de integração + 8 unitários.)

## Resultado

Verde local: `typecheck`, `lint`, `test` (33 testes; unit + integração sobre
Postgres real via `embedded-postgres`), `test:coverage`
(`src/domain` 100%, `outbox.ts` 97%), `build` (rota `/api/internal/outbox-tick`
registrada).

### Infra de teste (nova)

- `test/global-setup.ts` — sobe `embedded-postgres` em porta livre + dir único,
  aplica migrações, publica a URL via `provide`. Se `TEST_DATABASE_URL` estiver
  definido (CI), usa esse banco.
- `test/db.ts` — `getTestDb()` / `resetDb()`.
- `vitest.config.ts` — projetos `unit` e `integration` (`*.int.test.ts`,
  `singleFork`).
- CI (`ci.yml`) — passa `TEST_DATABASE_URL` do service container.
- devDeps: `embedded-postgres`, `tsx`.

### Entrega do despacho

- `src/worker/run.ts` — worker autônomo (`npm run worker`) para hosts sem cron.
- `src/app/api/internal/outbox-tick/route.ts` — uma passada por request,
  protegida por `Authorization: Bearer $CRON_SECRET`.
- `vercel.json` — cron de 1 min chamando a rota.
- `.env.example` — `CRON_SECRET`, `WORKER_INTERVAL_MS`, `TEST_DATABASE_URL`.

### Pendente do usuário

1. Definir `CRON_SECRET` na Vercel (e o cron passa a rodar).
2. Escolher o provedor de e-mail e push reais (D4) e trocar `LogProvider`.
