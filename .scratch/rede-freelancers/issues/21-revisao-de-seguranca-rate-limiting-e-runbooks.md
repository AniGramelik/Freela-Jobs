# 21: Revisão de segurança + rate limiting + runbooks

**O que construir:** o gate de liberação para os primeiros negócios reais do
piloto.

**Bloqueado por:** 19, 20.

**Status:** done (mecanismo) — D1/D2 pendente

- [x] Rate limiting em login, envio de convite, verificação de OTP e endpoints
      de escrita.
- [x] Proteção contra enumeração de convite e de magic link.
- [x] Revisão OWASP ASVS nível 1 registrada.
- [~] Teste de carga sintético (documentado em docs/seguranca/asvs-l1.md; rodar antes do go-live) do fluxo de convocação (despacho ≤ 60 s p95 na
      escala-alvo).
- [x] Runbooks: deploy, rollback, restore, incidente, pedido de titular.
