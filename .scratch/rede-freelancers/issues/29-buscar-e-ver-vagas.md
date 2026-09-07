# 29: Buscar e ver vagas

**O que construir:** o profissional filtra as vagas publicadas e abre o detalhe
de uma.

**Bloqueado por:** 28.

**Status:** done

Decisão pendente (D11): infra dedicada de busca só se o volume nacional exigir.
Construir com `earthdistance` + filtros SQL.

- [x] Filtros: categoria, `tipoDeVinculo`, `modoDeLocal`, UF/cidade e raio (só
      `PRESENCIAL`).
- [x] Lista paginada, sem N+1; consulta por raio usa índice.
- [x] Detalhe da vaga com todos os campos públicos e endereço aproximado.
- [x] Teste: cada filtro isola o resultado esperado; `REMOTO` ignora raio.
