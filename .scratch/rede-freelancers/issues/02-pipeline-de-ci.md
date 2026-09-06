# 02: Pipeline de CI

**O que construir:** nenhum merge entra sem lint, typecheck, testes e migração
passando.

**Bloqueado por:** 01.

**Status:** ready-for-agent

- [ ] CI roda `lint`, `typecheck`, `test` e `migrate` (banco efêmero) a cada PR.
- [ ] PR com erro de tipo ou teste falho é bloqueado pelo gate de branch.
- [ ] Relatório de cobertura publicado no PR; regra de domínio ≥ 80%.
- [ ] Pipeline completo em ≤ 5 min no volume do piloto.
