# Map — Freela Jobs

Índice do esforço. Spec completa em `spec.md`. Decisões em `/docs/adr/`.
Glossário e invariantes em `/CONTEXT.md`.

## Decisões travadas

### Rodadas 1–2 (entrevista original)

- Entregável: spec + arquitetura por fases com grelha de "pronto". Sem código até
  a árvore fechar.
- Stack: **Next.js (App Router) + PostgreSQL + Prisma + TS**, Vercel + Neon/Supabase.
  Time 1–2 pessoas. (ADR-0001)
- Identidade: `User` separado de `CompanyMembership` e `ProfessionalProfile`;
  papel no vínculo; um login serve aos dois lados. Magic link (profissional),
  senha + magic link (empresa). (ADR-0002)
- Notificação: camada `Notifier` abstraída; push PWA + e-mail; SMS/WhatsApp
  plugáveis; entrega via outbox. (ADR-0004)
- Perfil gerenciado: empresa opera 100% antes do claim; após o claim edita só o
  vínculo; dedupe/merge por telefone verificado. (ADR-0003)
- Convocação: `CallOut` com modo `TARGETED` ou `OPEN`; vagas por função; turno;
  local; remuneração texto livre; sem pagamento na plataforma.
- Avaliação interna: privada da empresa autora na Etapa 1. Reputação pública só
  na Etapa 2, agregada e anônima, com opt-in.
- Piloto: **Colatina, ES** (D3 resolvido). "Local" = raio em km sobre lat/long,
  default 20 km. (ADR-0006)

### Rodada de reencaixe (pivô de escopo)

O produto passou a ser, **além** da plataforma local de freelancers, um **mural
de vagas nacional** para qualquer categoria profissional (garçom a advogado),
com vínculo diária/temporário/PJ/CLT/estágio.

- **Faseamento, não pivô** (ADR-0007): Etapas 1–2 no piloto de Colatina; Etapa 3
  (mural nacional) só abre com densidade de perfis `CLAIMED` e herda os usuários
  do piloto. Modelo de dados já é nacional.
- **Base privada + convocação continuam sendo o núcleo.** `Vaga` + `Candidatura`
  entram como objeto de primeira classe **ao lado** da convocação, não no lugar.
  (ADR-0007)
- **Vínculo:** cada `Vaga` declara `tipoDeVínculo`; a plataforma divulga e
  conecta, não gerencia contrato/folha/eSocial.
- **Categoria profissional** é extensível; piloto ativa categorias operacionais;
  reguladas entram sem verificação de conselho de classe no piloto.
- **Raio vira filtro** (cidade / estado / raio / remoto), não a fronteira do
  produto. (ADR-0006 emendado)
- **Monetização** (ADR-0008): base privada + convocação + rede local sempre
  grátis; profissional nunca paga. Receita na Etapa 3 = `CompanyPlan` mensal com
  teto de vagas ativas no free + `FeaturedListing` (destaque pago). Billing
  manual no início.
- `Application` `ACCEPTED` → `WorkRelationship` `PENDING_CONSENT`: o mural
  realimenta a base privada.

## Fog — decisões abertas

| # | Assunto | Trava |
| --- | --- | --- |
| D1 | Bases legais LGPD e retenção (escopo nacional; inclui currículo/carta) | F1c / F3 |
| D2 | DPO + revisão jurídica de Termos/Política | F1c |
| D4 | Provedores de e-mail, push e OTP | F0 |
| D5 | Remuneração livre vs estruturada | F1b / F3 |
| D6 | Matching da rede local (filtro, sem score) | F2 |
| D7 | Forma da reputação pública | F2 |
| D8 | App nativo | pós-F3 |
| D9 | Wedge de aquisição do mural além da herança do piloto | F3 |
| D10 | Preços: N no plano free, mensalidade, destaque | F3 |
| D11 | Infra de busca de vagas dedicada (PostGIS / índice de texto / worker) | F3 |

D3 (cidade do piloto) — **resolvido: Colatina, ES**.

## Fases

F0 fundação · F1a base privada · F1b convocações · F1c endurecimento LGPD/operação ·
F2 rede local por opt-in · **F3 mural de vagas nacional** (Vaga/Candidatura,
`CompanyPlan`, destaque, moderação de vaga).

## Estado — 2026-09-07

**35/35 tickets concluídos e mesclados em `main`.** 149 testes (unit +
integração sobre Postgres real). 11 migrações. `lint` / `typecheck` / `build`
verdes.

Pendências que NÃO são código (bloqueiam go-live com usuários reais):
- **D1/D2** — bases legais LGPD e prazos de retenção + encarregado (DPO):
  revisão jurídica. O mecanismo está pronto (`Consent`, `runRetention`,
  `anonymizeProfile`, tela "meus dados"), mas os tickets 18–20 e 35 estão
  "done (mecanismo)", não liberáveis sem a confirmação.
- **D4** — provedores reais de e-mail / push / SMS-OTP (hoje: `LogProvider` /
  `LogOtpSender` / `StubGeocoder`).
- **D3 (resolvido: Colatina/ES)** · **D10** preços do plano/destaque ·
  **D11** infra de busca dedicada (só se o volume nacional exigir).
- Passos de infra: `CRON_SECRET` na Vercel, backups do provedor, ruleset de
  branch, drill de restore, teste de carga do fluxo de convocação.

## Issues

35 fatias verticais publicadas em `issues/01`–`35`, em ordem de dependência
(bloqueadores primeiro). Aprovadas no `/to-tickets` de 2026-09-06. Substituíram
as 15 issues horizontais anteriores.

- **Fundação:** 01 scaffold · 02 CI · 03 observabilidade · 04 auditlog+authz ·
  05 notifier+outbox
- **F1a base privada:** 06–14
- **F1b convocações:** 15–17
- **F1c endurecimento:** 18–21
- **F2 rede local:** 22–25
- **F3 mural nacional:** 26–35

Frontier inicial (sem bloqueador): **01**. Depois 02/03/04 (só dependem de 01).

`needs-info` (travadas por decisão): 18, 19, 20, 24, 35 (D1/D2/D7). As demais
com decisão pendente (05, 09, 11 → D4/OTP; 27, 29, 33 → D10/D11) estão
`ready-for-agent` — construídas atrás de interface, a decisão é config ou
follow-up.
