# 15: Convocação direcionada ponta a ponta

**O que construir:** a empresa escolhe pessoas da própria base, dispara uma
convocação, elas recebem e aceitam em poucos toques, e a empresa vê quem topou.

**Bloqueado por:** 08, 05.

**Status:** done

- [x] `CallOut` modo `TARGETED`; `CallOutSlot { role, quantity }`; turno, local,
      remuneração (texto livre), observações.
- [x] Estados `DRAFT → OPEN → FILLED → CLOSED | CANCELLED`; só vai a `OPEN` com
      ≥1 slot e turno no futuro.
- [x] `CallOutResponse` `OFFERED → ACCEPTED → COMPLETED`; ramos `DECLINED`,
      `WITHDRAWN`, `NO_SHOW`.
- [x] Notificação por push + e-mail (outbox); profissional vê detalhe completo e
      aceita/recusa em ≤ 2 toques.
- [x] Soma de `ACCEPTED` por slot ≤ `quantity` (constraint + checagem
      transacional); empresa vê em tempo real quem aceitou/recusou/não respondeu.
- [x] Profissional desiste antes do turno; empresa cancela e avisa quem aceitou.
- [x] Teste E2E do caminho feliz; teste de concorrência no último lugar da vaga.
