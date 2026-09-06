# 04: AuditLog + helper de autorização multi-tenant

**O que construir:** toda ação sensível fica gravada de forma imutável e nenhuma
leitura/escrita de dado de empresa acontece fora do escopo da sessão.

**Bloqueado por:** 01.

**Status:** ready-for-agent

- [ ] `AuditLog` append-only (`actorUserId`, `actingAs`, ação, alvo, antes,
      depois, timestamp) — sem update nem delete.
- [ ] Helper de autorização que deriva `companyId` da sessão + membership; nenhum
      caso de uso aceita `companyId` vindo do cliente.
- [ ] Acesso a `companyId` sem membership retorna 403 e grava `AuditLog`.
- [ ] Teste: isolamento entre duas empresas; negativa auditada.
