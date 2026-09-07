# Runbook — Incidente

## Classificação rápida

| Sinal | Severidade |
| --- | --- |
| App fora do ar / `/healthz` 503 sustentado | P1 |
| Convocações/notificações não saem (outbox parado) | P2 |
| Erro em um fluxo isolado | P3 |
| Suspeita de vazamento de dado pessoal | P1 + jurídico |

## Primeiros passos

1. Abrir `/healthz` — ver qual check falha (`app`, `database`, `queue`).
2. Error tracking (Sentry, quando `SENTRY_DSN` configurado) — buscar o pico.
3. Logs estruturados: filtrar por `requestId` do primeiro erro reportado.

## Banco fora

- Confirmar no painel do provedor (Neon/Supabase).
- Se corrupção/perda: seguir `runbooks/restore.md`.
- Repontar `DATABASE_URL` se trocou o endpoint.

## Outbox parado

- `GET /api/internal/outbox-tick` com `Authorization: Bearer $CRON_SECRET` —
  ver se processa. Se 401, o secret mudou.
- Checar mensagens em `DEAD` (`select * from "OutboxMessage" where status='DEAD'`).
- Cron da Vercel: Project → Settings → Cron Jobs.

## Deploy quebrado

- `runbooks/rollback.md`.

## Vazamento de dado pessoal

- Congelar o acesso suspeito (revogar sessão / bloquear usuário via suporte).
- Preservar logs.
- Acionar o encarregado (DPO) e o jurídico. Avaliar comunicação à ANPD
  (prazo legal).
