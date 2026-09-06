# 21: Revisão de segurança + rate limiting + runbooks

**O que construir:** o gate de liberação para os primeiros negócios reais do
piloto.

**Bloqueado por:** 19, 20.

**Status:** ready-for-agent

- [ ] Rate limiting em login, envio de convite, verificação de OTP e endpoints
      de escrita.
- [ ] Proteção contra enumeração de convite e de magic link.
- [ ] Revisão OWASP ASVS nível 1 registrada.
- [ ] Teste de carga sintético do fluxo de convocação (despacho ≤ 60 s p95 na
      escala-alvo).
- [ ] Runbooks: deploy, rollback, restore, incidente, pedido de titular.
