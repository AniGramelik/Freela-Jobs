# ADR-0009 — Mensageria na plataforma (empresa ↔ profissional)

- Status: aceito
- Data: 2026-09-07
- Relacionado: ADR-0002 (identidade/tenancy), ADR-0004 (notificação abstraída),
  ADR-0005 (LGPD), ADR-0007 (mural nacional)

## Contexto

Empresa e profissional precisam combinar detalhes (horário, local, valor,
documentos) sem sair da plataforma e sem trocar telefone antes da hora. Hoje
isso acontece por fora (WhatsApp), o que quebra a proposta do produto e tira
qualquer registro/trilha.

O e-mail do profissional já é visível para a empresa com quem ele tem contato;
o **telefone não** — deve continuar sob controle explícito do titular
(ADR-0005: visibilidade de contato é consentimento granular e revogável).

## Decisão

### Modelo

- Uma **`Conversation` por par `(companyId, professionalProfileId)`**
  (`@@unique`). A vaga ou a convocação de onde a conversa nasceu é **metadado**
  opcional (`jobPostingId?`, `callOutId?`), não cria conversas separadas.
- **`ChatMessage`** pertence à conversa: `senderSide` (`COMPANY` |
  `PROFESSIONAL`), `senderUserId` (o `User` que digitou), `body`, `createdAt`.
- Não-lido por lado: `lastMessageAt > companyLastReadAt` /
  `> professionalLastReadAt`.
- `phoneRevealedAt` na conversa: quando não-nulo, a empresa vê o telefone do
  profissional **naquela conversa**. Liberar/ocultar é ação só do profissional e
  grava `Consent` (`type = "conversation_phone_reveal"`, append-only).

### Quem pode iniciar

Anti-spam: a **empresa** só abre conversa com um profissional com quem já tem
laço — `WorkRelationship` (qualquer estado), uma `Application` a uma vaga da
empresa, ou uma `CallOutResponse` a uma convocação da empresa — **ou** que tenha
`PublicListing` ativo (se colocou o perfil na rede, aceita ser contatado). O
profissional pode responder sempre e iniciar com empresas com quem tem laço.

### Notificação

Nova categoria `chat_message`, **não transacional** (o titular pode silenciar
via `NotificationOptOut`). Enfileira pelo outbox (ADR-0004),
`dedupeKey = chat-message:<messageId>`, destinatário = o outro lado.

### Tempo real

Sem push (SSE/WebSocket) nesta fase — mesma limitação registrada para o placar
da convocação. A thread revalida no envio e faz `router.refresh()` a cada ~15 s
enquanto a aba está visível. Evoluir para SSE é trabalho separado.

### LGPD

- **Exportação** (`exportMyData`): inclui as conversas e mensagens do titular.
- **Anonimização** (`anonymizeProfile`): mensagens do lado `PROFESSIONAL` viram
  `[removido]`; `phoneRevealedAt` volta a nulo. Mensagens do lado empresa ficam
  (registro da controladora).
- **Retenção** (`runRetention`): apaga conversas sem `WorkRelationship` entre o
  par e paradas há mais de `chatIdleDays` (365, ⚠️ D1).

## Consequências

- Schema novo: `Conversation`, `ChatMessage`, enums `ConversationState`,
  `ChatSenderSide`; back-relations em `Company` e `ProfessionalProfile`.
- Casos de uso em `src/use-cases/chat.ts`; regras puras em `src/domain/chat.ts`.
- Telas `/painel/mensagens` e `/prof/mensagens`; entradas "Conversar" na vaga,
  na rede e nas candidaturas; item de navegação com marcador de não-lido.
