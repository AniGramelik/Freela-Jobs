# 08: Cadastrar profissional gerenciado + vínculo

**O que construir:** a empresa adiciona ao seu acervo alguém que já usa, com
funções e nota privada, e encontra essa pessoa numa lista pesquisável.

**Bloqueado por:** 06.

**Status:** done

- [x] `ProfessionalProfile` estado `MANAGED` (nome, telefone E.164, e-mail?,
      `createdByCompanyId`, `sourceNote?`) — migração `20260906224802_*`.
- [x] `WorkRelationship` empresa↔profissional com `roles[]` e `privateNote?`,
      único por (`companyId`, `professionalProfileId`).
- [x] Nota privada só aparece na visão da própria empresa
      (`listCompanyProfessionals` escopa por `companyId`); não há visão do
      profissional nem de outra empresa neste ponto, e o teste garante que cada
      empresa lê apenas a própria nota.
- [x] Lista pesquisável por nome (case-insensitive), telefone (dígitos) e função
      (token exato) — `?q=` em `/painel/equipe`.
- [x] Telefone já existente **não** duplica o perfil:
      `registerManagedProfessional` procura perfil ativo por `phoneE164` e, se
      achar, só cria o `WorkRelationship` da empresa (`reused: true`); mesma
      empresa de novo → `already_linked`.
- [x] Testes: E.164 inválido e nome vazio recusados; isolamento entre empresas;
      dedupe por telefone; `updateWorkRelationship` escopado
      (`professionals.int.test.ts`, 7) + `toE164`/`isValidE164` unitário (6).

## Resultado

Verde local: `typecheck`, `lint`, `test` (73 testes), `build`.

### Mudanças

- Schema: `ProfessionalProfile` + `ProfessionalProfileState`,
  `WorkRelationship` + `WorkRelationshipState`.
- `src/domain/phone.ts` (+ teste) — `toE164` (BR por padrão), `isValidE164`.
- `src/use-cases/professionals.ts` — `registerManagedProfessional`,
  `listCompanyProfessionals`, `updateWorkRelationship`.
- `src/app/painel/equipe/` — lista com busca, form de adição (usa a empresa
  ativa do ticket 07).

### Notas

- A unicidade **por telefone verificado** (invariante 7 / ADR-0003) e a fusão de
  perfis duplicados ficam para o ticket 12. Aqui o dedupe é a nível de caso de
  uso, para perfis não `CLAIMED`.
- Busca por função é por token exato (`roles has`); busca parcial de função pode
  entrar depois se necessário.
