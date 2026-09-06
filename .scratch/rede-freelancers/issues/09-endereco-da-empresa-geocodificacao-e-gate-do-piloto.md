# 09: Endereço da empresa + geocodificação + gate do piloto

**O que construir:** a empresa informa o endereço e o sistema guarda lat/long
para consulta por raio; no lançamento, só endereços de Colatina/ES entram.

**Bloqueado por:** 06.

**Status:** ready-for-agent

Decisão pendente (D4): provedor de geocodificação. Construir atrás de uma
interface com stub; trocar pelo real é follow-up.

- [ ] `Address` (linha, bairro, cidade, estado, CEP, latitude, longitude,
      `geocodedAt`) + raio default 20 km, editável.
- [ ] Geocodificação no cadastro, resultado persistido, cache por endereço
      normalizado; nunca geocodificar em consulta.
- [ ] Falha do provedor não perde o cadastro (`PENDING_GEOCODE`, worker
      re-tenta).
- [ ] Gate do piloto (config de lançamento, não regra de schema): com o gate
      ligado, só Colatina/ES é aceita; com o gate desligado, qualquer cidade.
- [ ] Teste: gate ligado recusa fora de Colatina com mensagem clara; gate
      desligado aceita.
