# 07: Alternar entre empresas

**O que construir:** um usuário que administra mais de uma empresa escolhe em qual
está agindo, e só vê os dados da empresa ativa.

**Bloqueado por:** 06, 04.

**Status:** ready-for-agent

- [ ] Seletor de contexto "agindo como empresa X"; estado na sessão.
- [ ] Toda tela e caso de uso de dado de empresa usa o `companyId` do contexto.
- [ ] Usuário em duas empresas não enxerga dado da inativa.
- [ ] Tentativa de agir sobre empresa sem membership → 403 + `AuditLog`.
- [ ] Teste: troca de contexto; isolamento; papel insuficiente (`MANAGER` x
      ação de `OWNER`).
