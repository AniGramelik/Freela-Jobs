# 09: Endereço da empresa + geocodificação + gate do piloto

**O que construir:** a empresa informa o endereço e o sistema guarda lat/long
para consulta por raio; no lançamento, só endereços de Colatina/ES entram.

**Bloqueado por:** 06.

**Status:** done

Decisão pendente (D4): provedor de geocodificação. Construir atrás de uma
interface com stub; trocar pelo real é follow-up.

- [x] `Address` (linha, bairro, cidade, estado, CEP, latitude, longitude,
      `geocodedAt`) + raio default 20 km, editável.
- [x] Geocodificação no cadastro, resultado persistido, cache por endereço
      normalizado; nunca geocodificar em consulta.
- [x] Falha do provedor não perde o cadastro (`PENDING_GEOCODE`, worker
      re-tenta).
- [x] Gate do piloto (config de lançamento, não regra de schema): com o gate
      ligado, só Colatina/ES é aceita; com o gate desligado, qualquer cidade.
- [x] Teste: gate ligado recusa fora de Colatina com mensagem clara; gate
      desligado aceita.

## Resultado (lote A)

`CompanyAddress` + `setCompanyAddress`/`getCompanyAddress`. `src/domain/geo.ts`
(haversine, raio) e `src/domain/pilot.ts` (`isWithinPilot`, gate por `PILOT_GATE`).
Geocodificação atrás de `Geocoder` (`StubGeocoder` resolve Colatina; D4 troca o real).
Página `/painel/empresa`. Verde: typecheck/lint/build + 4 testes de integração + 5 unitários.
