# Runbook — Deploy e rollback

## Deploy (Vercel)

- Merge em `main` dispara o deploy de produção.
- **Antes do `next build`**, o pipeline aplica as migrações:
  `npm run db:deploy` (Build Command da Vercel ou passo de CI).
- Verificar pós-deploy: `/healthz` = 200 e `status: "ok"`.
- Cron jobs (`vercel.json`): outbox (1 min) e retenção (04:17 UTC). Exigem o
  secret `CRON_SECRET` no projeto.

## Rollback

1. Vercel → Deployments → escolher o último deploy bom → **Promote to
   Production** (rollback instantâneo do app).
2. **Migração**: o rollback do app NÃO reverte o schema. Se o deploy ruim
   aplicou uma migração incompatível:
   - Migração aditiva (colunas/tabelas novas, nullable): normalmente o app
     antigo convive. Não fazer nada no banco.
   - Migração destrutiva: restaurar do backup mais recente
     (`runbooks/restore.md`) e reaplicar migrações até o ponto bom.
   - Toda migração destrutiva exige plano explícito no ticket (portão de CI).

## Checklist pré-merge de mudança de schema

- [ ] Migração aditiva ou expand–contract? Se destrutiva, plano no ticket.
- [ ] `npm run db:deploy` roda limpo no CI (banco efêmero).
- [ ] App antigo tolera o schema novo por ~1 deploy (janela de rollback).
