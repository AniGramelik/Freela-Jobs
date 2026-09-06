# 22: Opt-in de visibilidade (PublicListing)

**O que construir:** o profissional autoriza aparecer na rede local, escolhendo o
que expõe, e revoga quando quiser.

**Bloqueado por:** 13, 19.

**Status:** ready-for-agent

- [ ] `PublicListing` com granularidade: funções, raio, campos exibidos.
      Consentimento específico e revogável (usa `Consent`).
- [ ] Endereço aparece de forma aproximada (bairro) para empresas sem vínculo.
- [ ] Revogar remove o perfil da busca na hora.
- [ ] Teste: revogação tem efeito imediato; campos fora do opt-in não vazam.
