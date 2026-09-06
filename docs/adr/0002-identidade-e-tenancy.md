# ADR-0002 — Modelo de identidade e tenancy

- Status: aceito
- Data: 2026-09-05

## Contexto

Dois lados (empresa, profissional) com necessidades distintas. Uma pessoa pode
administrar várias empresas e/ou ser também profissional. Fricção de login do
profissional precisa ser baixa (uso mobile, eventual).

## Decisão

- `User` é a identidade base (autenticação). **Separado** de `CompanyMembership`
  e de `ProfessionalProfile`.
- **Autenticação**
  - Profissional: **e-mail + magic link**. Telefone é obrigatório no cadastro
    (usado para convocação e para verificação por OTP no claim), mas não é o
    fator de login na Fase 1.
  - Empresa: **e-mail + senha** com opção de magic link.
  - OTP por SMS/WhatsApp como login fica para fase posterior, quando houver
    orçamento de mensageria.
- **Tenancy**: papel vive no vínculo, não no usuário.
  - `CompanyMembership { userId, companyId, role: OWNER | MANAGER }`.
  - `ProfessionalProfile { ownerUserId? }` — nulo enquanto `MANAGED`.
- Um `User` pode ter N `CompanyMembership` e no máximo 1 `ProfessionalProfile`.
- Isolamento entre empresas: toda query de dados de empresa é escopada por
  `companyId` derivado da sessão + membership. Sem confiar em `companyId` vindo
  do cliente.

## Consequências

- Troca de contexto ("estou agindo como qual empresa?") é estado de sessão.
- Fusão de perfis (mesma pessoa cadastrada por 2 empresas) é possível porque o
  vínculo é externo ao perfil — ver ADR-0003.
- Auditoria: toda ação sensível registra `actorUserId` + `actingAs`
  (companyId ou professionalProfileId).
