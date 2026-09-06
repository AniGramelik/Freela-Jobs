# ADR-0004 — Camada de notificação abstraída

- Status: aceito
- Data: 2026-09-05

## Contexto

A convocação só tem valor se o profissional for avisado com confiabilidade. O
canal ideal (WhatsApp) tem custo e burocracia de aprovação (WhatsApp Business
API) incompatíveis com o piloto. Precisamos poder trocar/adicionar canais sem
reescrever regras de negócio.

## Decisão

- Interface única `Notifier.send(recipient, template, payload, channels[])`.
- Canais na Fase 1: **push da PWA** (Web Push / VAPID) + **e-mail**
  (provedor transacional).
- Canais plugáveis depois: **SMS** e **WhatsApp Business API**, sem mudança nas
  regras de negócio.
- Entrega assíncrona via **outbox**: a transação de negócio grava a intenção de
  notificar na mesma transação; um worker consome e despacha, com retry e
  idempotência (`dedupeKey`).
- Toda notificação tem `category` e respeita **preferências e opt-out** por
  categoria (transacional de convocação não é opt-out; marketing é).
- Registro de entrega (`NotificationLog`): enviado, entregue, falhou, aberto.

## Consequências

- Nenhum envio dentro do request HTTP do usuário.
- Push no iOS exige PWA instalada (iOS 16.4+); e-mail é o fallback garantido.
- Métrica de sucesso do piloto inclui **taxa de alcance** da convocação
  (quantos destinatários efetivamente receberam em X minutos).
