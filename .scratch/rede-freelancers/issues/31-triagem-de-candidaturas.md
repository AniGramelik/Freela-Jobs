# 31: Triagem de candidaturas

**O que construir:** a empresa vê as candidaturas de uma vaga e as conduz pelos
estados de triagem.

**Bloqueado por:** 30.

**Status:** ready-for-agent

- [ ] Lista de `Application` por vaga, com mensagem e anexos.
- [ ] Transições `SUBMITTED → UNDER_REVIEW → SHORTLISTED`; `REJECTED` a partir de
      qualquer estado antes de `OFFERED`.
- [ ] Cada mudança notifica o profissional (`application_status`).
- [ ] `AuditLog` das transições.
- [ ] Teste: transição inválida é recusada; profissional só vê o próprio estado.
