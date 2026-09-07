# 30: Candidatar-se a uma vaga

**O que construir:** o profissional se apresenta a uma vaga com mensagem e
anexos, e acompanha o estado da candidatura.

**Bloqueado por:** 29, 11.

**Status:** done

- [x] `Application` (`jobPostingId`, `professionalProfileId`, `coverMessage?`,
      `attachments[]`). Estado inicial `SUBMITTED`.
- [x] Candidatar-se exige `ProfessionalProfile` em `CLAIMED`.
- [x] Uma `Application` por (vaga, profissional).
- [x] Não aceita candidatura se a vaga está `FILLED`/`CLOSED`/`CANCELLED` ou fora
      do prazo.
- [x] Notifica a empresa (`application_received`); profissional vê a lista das
      suas candidaturas e o estado de cada.
- [x] Teste: perfil gerenciado não se candidata; candidatura duplicada é
      recusada.
