# Runbook — Pedido do titular (LGPD)

Fila: `select * from "DataSubjectRequest" where state='PENDING' order by "dueAt"`.
SLA: 15 dias corridos (`dueAt`).

## Exportação (EXPORT / portabilidade)

1. Identificar o `userId`.
2. `exportMyData(db, { userId })` — a própria tela "meus dados" já entrega ao
   titular autenticado. Para pedido por outro canal, rodar o caso de uso e
   enviar o JSON pelo canal verificado do titular.
3. Marcar `DONE`.

## Correção (CORRECTION)

- Dados pessoais do perfil só o profissional edita (após o claim). Se ainda
  `MANAGED`, orientar a empresa criadora (`createdByCompanyId`) a corrigir, ou
  o suporte edita e registra em `AuditLog`.

## Exclusão (DELETION)

1. Confirmar identidade pelo canal verificado.
2. `anonymizeProfile(db, { professionalProfileId })` — remove nome, telefone,
   e-mail, localização; mantém histórico de trabalho pseudonimizado.
3. Se o `User` não tem outro vínculo (empresa), remover credenciais:
   `delete from "Session" where "userId" = ...`; anonimizar o e-mail do `User`.
4. Registrar `resolvedAt`, `state = DONE`, e uma linha em `AuditLog`.
5. Responder ao titular confirmando o que foi retido e por quê (necessidade
   legítima da empresa + eventual obrigação legal).

## O que NÃO se apaga

- Registro de convocação/presença (necessidade da empresa; prazo prescricional).
- `AuditLog` (prestação de contas).
- Avaliações internas — pseudonimizadas junto com o perfil.
