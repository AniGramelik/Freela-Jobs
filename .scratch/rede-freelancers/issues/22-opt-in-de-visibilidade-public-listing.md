# 22: Opt-in de visibilidade (PublicListing)

**O que construir:** o profissional autoriza aparecer na rede local, escolhendo o
que expõe, e revoga quando quiser.

**Bloqueado por:** 13, 19.

**Status:** done

- [x] `PublicListing` com granularidade: funções, raio, campos exibidos.
      Consentimento específico e revogável (usa `Consent`).
- [x] Endereço aparece de forma aproximada (bairro) para empresas sem vínculo.
- [x] Revogar remove o perfil da busca na hora.
- [x] Teste: revogação tem efeito imediato; campos fora do opt-in não vazam.
