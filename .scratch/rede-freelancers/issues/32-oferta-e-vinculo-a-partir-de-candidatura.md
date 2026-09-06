# 32: Oferta + vínculo a partir de candidatura aceita

**O que construir:** a empresa faz uma oferta ao candidato selecionado; ao
aceitar, ele entra na base privada da empresa como vínculo pendente de
consentimento.

**Bloqueado por:** 31, 08, 14.

**Status:** ready-for-agent

- [ ] `SHORTLISTED → OFFERED`; profissional aceita (`ACCEPTED`) ou recusa
      (`WITHDRAWN`).
- [ ] Soma de `ACCEPTED` por vaga ≤ `positions`; ao atingir, `JobPosting →
      FILLED` e para de receber candidatura.
- [ ] `Application` `ACCEPTED` cria `WorkRelationship` `PENDING_CONSENT` entre a
      empresa e o profissional.
- [ ] Profissional confirma ou recusa o vínculo pela tela "meus vínculos" (14).
- [ ] Teste: aceitação concorrente além de `positions` é bloqueada; vaga vai a
      `FILLED` no momento certo.
