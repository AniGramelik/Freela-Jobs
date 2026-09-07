# 31: Triagem de candidaturas

**O que construir:** a empresa vê as candidaturas de uma vaga e as conduz pelos
estados de triagem.

**Bloqueado por:** 30.

**Status:** done

- [x] Lista de `Application` por vaga, com mensagem e anexos.
- [x] Transições `SUBMITTED → UNDER_REVIEW → SHORTLISTED`; `REJECTED` a partir de
      qualquer estado antes de `OFFERED`.
- [x] Cada mudança notifica o profissional (`application_status`).
- [x] `AuditLog` das transições.
- [x] Teste: transição inválida é recusada; profissional só vê o próprio estado.
