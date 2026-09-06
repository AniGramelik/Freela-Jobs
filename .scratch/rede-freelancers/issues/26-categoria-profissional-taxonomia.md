# 26: Categoria profissional (taxonomia extensível)

**O que construir:** o conceito de categoria profissional existe, com um conjunto
inicial ativado, e o profissional escolhe a sua.

**Bloqueado por:** 08.

**Status:** done

- [x] `ProfessionalCategory` com seed das categorias operacionais/eventuais do
      piloto; flag de ativa/inativa.
- [x] Profissional (perfil `CLAIMED`) e perfil gerenciado carregam uma ou mais
      categorias.
- [x] Estrutura permite categoria futura exigir campos e verificação próprios,
      sem migração de modelo (só dados).
- [x] Teste: categoria inativa não aparece para seleção nem para busca.

## Resultado (lote A)

`ProfessionalCategory` + `ProfessionalProfileCategory`. `seedPilotCategories`
(7 categorias operacionais), `listActiveCategories`, `setProfessionalCategories`
(substitui o conjunto). `registerManagedProfessional` aceita `categorySlugs`.
`prisma/seed.ts` + `npm run db:seed`. Verde: 2 testes de integração.
