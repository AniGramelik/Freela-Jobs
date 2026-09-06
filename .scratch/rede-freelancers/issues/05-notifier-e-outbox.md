# 05: Notifier + Outbox (e-mail + push)

**O que construir:** o sistema envia uma notificação transacional de forma
confiável, sem bloquear o request do usuário, com um gatilho de dev para
demonstrar.

**Bloqueado por:** 01.

**Status:** ready-for-agent

Decisão pendente (D4): provedor real de e-mail e estratégia de push. Construir
atrás da interface `Notifier` com um provedor de log/fake; trocar pelo real é
follow-up trivial.

- [ ] Interface `Notifier` com canais e-mail e push (Web Push/VAPID).
- [ ] `OutboxMessage` gravada na mesma transação de negócio; worker
      (`processOutboxOnce`) despacha com backoff e idempotência por `dedupeKey`.
- [ ] `NotificationLog` por canal: enviado, entregue, falhou, aberto.
- [ ] Preferências por categoria; transacional não tem opt-out, `digest`/
      `marketing` têm.
- [ ] Teste: worker cai e volta sem perder mensagem; reprocessar não duplica;
      mensagem venenosa vai a `DEAD` após N tentativas.
