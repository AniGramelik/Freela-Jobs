# ADR-0003 — Perfil gerenciado e fluxo de "assumir perfil"

- Status: aceito
- Data: 2026-09-05

## Contexto

O crescimento depende de empresas cadastrarem profissionais que já usam e
convidarem-nos a assumir o perfil. Isso implica criar dado pessoal de terceiro
antes de qualquer relação do titular com a plataforma.

## Decisão

### Estados do `ProfessionalProfile`

- `MANAGED` — criado por uma empresa, sem dono. A empresa opera 100%: convoca,
  registra presença, avalia internamente.
- `INVITED` — convite enviado, ainda não aceito.
- `CLAIMED` — profissional aceitou, criou `User`, é dono.
- `ANONYMIZED` — dado pessoal removido por retenção ou a pedido do titular; o
  histórico da empresa permanece de forma agregada/pseudonimizada.

### Claim

1. Empresa cria perfil com nome + telefone (mínimo) e opcionalmente e-mail,
   funções, notas.
2. Sistema gera `Invite` com token e validade (**60 dias**, ver ADR-0005).
3. Envio por e-mail e/ou SMS (quando disponível). Reenvio permitido.
4. Profissional abre o link, **verifica o telefone por OTP**, cria `User`
   (magic link) e vira dono.
5. A partir daí: dados pessoais e `Availability` são **exclusivos do
   profissional**. A empresa edita apenas o `WorkRelationship` (funções internas,
   notas privadas, avaliações).

### Fusão (mesma pessoa, várias empresas)

- Chave de deduplicação: **telefone verificado** (E.164).
- Se ao criar um perfil gerenciado o telefone já existe: não cria novo perfil;
  cria apenas um `WorkRelationship` da nova empresa para o perfil existente.
- Se o perfil existente já é `CLAIMED`, a nova empresa entra com `WorkRelationship`
  `PENDING_CONSENT` até o profissional aceitar o vínculo.
- Antes de haver telefone verificado, perfis duplicados podem coexistir; a fusão
  ocorre no claim.

## Consequências

- Empresa nunca fica bloqueada por falta de claim — substitui o WhatsApp no dia 1.
- Necessário registrar, para cada perfil gerenciado, **qual empresa criou** e
  **quando** (base para transparência e para a notificação de tratamento — LGPD,
  ADR-0005).
- Tela de "meus vínculos" para o profissional aceitar/recusar empresas após o claim.
- Merge exige transação cuidadosa: mover `WorkRelationship`, `CallOutResponse`,
  `InternalRating` para o perfil canônico e marcar o duplicado como `MERGED`.
