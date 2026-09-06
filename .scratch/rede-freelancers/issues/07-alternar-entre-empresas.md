# 07: Alternar entre empresas

**O que construir:** um usuário que administra mais de uma empresa escolhe em qual
está agindo, e só vê os dados da empresa ativa.

**Bloqueado por:** 06, 04.

**Status:** done

- [x] Seletor de contexto "agindo como empresa X"; estado na sessão
      (`Session.activeCompanyId` — migração `20260906224802_*`).
      `<CompanySwitcher>` no `/painel` (só aparece com 2+ empresas) posta em
      `/contexto`.
- [x] Toda tela/caso de uso de dado de empresa parte de `requireCompanyContext()`
      (`src/lib/session.ts`), que devolve a empresa ativa resolvida
      (`resolveActiveCompany`, puro: id guardado válido → aquela; senão a
      primeira). O ticket 08 já consome isso.
- [x] Usuário em 2 empresas só enxerga a ativa — `listCompanyProfessionals` e
      afins recebem `company.id` do contexto, nunca do cliente.
- [x] Troca para empresa sem membership → **403 + `AuditLog`**:
      `setActiveCompany` chama `authorizeCompanyAction` (ticket 04); a sessão não
      muda e grava `authorization.denied`.
- [x] Testes: troca de contexto; isolamento; negativa auditada
      (`company-context.int.test.ts`, 4) + `resolveActiveCompany` unitário (4).
      A criação de um 2º membership (que o produto ainda não expõe) é feita no
      setup do teste.

## Resultado

Verde local: `typecheck`, `lint`, `test` (73 testes), `build`. Guardas ao vivo:
`/painel` e `/painel/equipe` sem sessão → 307 `/entrar`.

### Mudanças

- `Session.activeCompanyId`; `resolveSession` passa a devolvê-lo.
- `src/domain/company-context.ts` (+ teste).
- `src/use-cases/company-context.ts` — `setActiveCompany`, `loadSessionContext`,
  `toActor` (liga o `Actor` do ticket 04 ao usuário da sessão do 06).
- `src/lib/session.ts` — `getSessionUser` agora traz `companies` + `activeCompany`
  + `sessionId`; novo `requireCompanyContext()`.
- `src/app/contexto/route.ts`, `src/app/painel/CompanySwitcher.tsx`,
  `src/app/painel/layout.tsx` (guarda tudo sob `/painel`).

### Amarração pendente

- O `runWithRequestContext` (ticket 03) num wrapper de request continua para
  quando houver mais rotas de escrita.
