# 23: Busca na rede + convite fora da base

**O que construir:** uma empresa encontra profissionais fora do próprio acervo e
envia proposta; o vínculo só se efetiva com o aceite do profissional.

**Bloqueado por:** 22, 16, 14.

**Status:** done

- [x] Busca por função + raio + disponibilidade sobre os `PublicListing`, sem
      score.
- [x] Enviar proposta cria `WorkRelationship` `PENDING_CONSENT`; nenhum acesso
      ao perfil antes do aceite.
- [x] Profissional aceita/recusa (reusa a tela "meus vínculos", 14).
- [x] Teste: empresa sem vínculo não lê disponibilidade nem endereço exato antes
      do aceite.
