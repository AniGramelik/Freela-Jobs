# 04: AuditLog + helper de autorização multi-tenant

**O que construir:** toda ação sensível fica gravada de forma imutável e nenhuma
leitura/escrita de dado de empresa acontece fora do escopo da sessão.

**Bloqueado por:** 01.

**Status:** done

- [x] `AuditLog` append-only — `src/use-cases/audit.ts`: interface `AuditRecorder`
      que só expõe `record()` (sem update/delete, imutável por construção),
      `InMemoryAuditRecorder` (fake de teste) e `PrismaAuditRecorder`
      (`src/use-cases/audit.prisma.ts`, só `create` na tabela `AuditLog` do
      ticket 01). A política no banco entra no ticket 21.
- [x] Helper de autorização — `src/domain/authorization.ts`
      (`resolveCompanyContext`, puro) + `src/use-cases/authorize.ts`
      (`authorizeCompanyAction`). O contexto é derivado dos `memberships` do
      ator (da sessão); `requestedCompanyId` é entrada não confiável e é
      validada contra eles. `companyId` forjado → `no_membership`.
- [x] Acesso sem membership → 403 + `AuditLog` — `authorizeCompanyAction`
      retorna `err({ status: 403, reason })` e grava
      `action: "authorization.denied"` (`targetType: "Company"`,
      `targetId: <requestedCompanyId>`, `after: { attemptedAction, reason }`).
- [x] Teste: isolamento entre duas empresas; negativa auditada —
      `authorization.test.ts` (5) + `authorize.test.ts` (4), com fakes em
      memória.

## Resultado

Verde local: `typecheck`, `lint`, `test:coverage` (16 testes; `src/domain/**` e
`src/use-cases/**` a 100%), `build`. `audit.prisma.ts` fica fora da métrica de
cobertura (adaptador de banco, coberto pela seam de integração no ticket 06+).

### Camadas (ADR-0001)

- Puro: `src/domain/authorization.ts`.
- Aplicação: `src/use-cases/authorize.ts`, `src/use-cases/audit.ts`.
- Infra (só typecheck aqui): `src/use-cases/audit.prisma.ts`.

### Amarração pendente (tickets 06/07)

- `Actor` (userId + memberships) hoje é um tipo; o preenchimento a partir da
  sessão real + tabela `CompanyMembership` entra no ticket 06.
- Wrapper de rota que chama `authorizeCompanyAction` e traduz o `err(403)` em
  resposta HTTP entra no ticket 07, junto com o `runWithRequestContext` do
  ticket 03.
- `PrismaAuditRecorder` passa a ser exercitado pelos testes de integração da
  seam primária no ticket 06.
