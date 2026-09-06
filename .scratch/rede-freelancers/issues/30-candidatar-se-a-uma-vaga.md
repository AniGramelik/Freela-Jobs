# 30: Candidatar-se a uma vaga

**O que construir:** o profissional se apresenta a uma vaga com mensagem e
anexos, e acompanha o estado da candidatura.

**Bloqueado por:** 29, 11.

**Status:** ready-for-agent

- [ ] `Application` (`jobPostingId`, `professionalProfileId`, `coverMessage?`,
      `attachments[]`). Estado inicial `SUBMITTED`.
- [ ] Candidatar-se exige `ProfessionalProfile` em `CLAIMED`.
- [ ] Uma `Application` por (vaga, profissional).
- [ ] Não aceita candidatura se a vaga está `FILLED`/`CLOSED`/`CANCELLED` ou fora
      do prazo.
- [ ] Notifica a empresa (`application_received`); profissional vê a lista das
      suas candidaturas e o estado de cada.
- [ ] Teste: perfil gerenciado não se candidata; candidatura duplicada é
      recusada.
