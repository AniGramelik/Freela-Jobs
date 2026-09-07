# 32: Oferta + vínculo a partir de candidatura aceita

**O que construir:** a empresa faz uma oferta ao candidato selecionado; ao
aceitar, ele entra na base privada da empresa como vínculo pendente de
consentimento.

**Bloqueado por:** 31, 08, 14.

**Status:** done

- [x] `SHORTLISTED → OFFERED`; profissional aceita (`ACCEPTED`) ou recusa
      (`WITHDRAWN`).
- [x] Soma de `ACCEPTED` por vaga ≤ `positions`; ao atingir, `JobPosting →
      FILLED` e para de receber candidatura.
- [x] `Application` `ACCEPTED` cria `WorkRelationship` `PENDING_CONSENT` entre a
      empresa e o profissional.
- [x] Profissional confirma ou recusa o vínculo pela tela "meus vínculos" (14).
- [x] Teste: aceitação concorrente além de `positions` é bloqueada; vaga vai a
      `FILLED` no momento certo.
