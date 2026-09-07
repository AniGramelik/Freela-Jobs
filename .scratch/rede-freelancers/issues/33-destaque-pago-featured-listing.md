# 33: Destaque pago (FeaturedListing)

**O que construir:** a empresa destaca uma vaga por um período e ela ganha
posição na busca; a cobrança é registrada manualmente no início.

**Bloqueado por:** 28.

**Status:** done

Decisão pendente (D10): preço e duração do destaque.

- [x] `FeaturedListing` (vaga, período `featuredUntil`, origem do pagamento).
      Liberação manual pelo suporte.
- [x] Vaga destacada ranqueia acima do teto do plano e em posição de maior
      visibilidade na busca (29).
- [x] Fim do período remove o destaque automaticamente.
- [x] Teste: destaque expira sozinho; sem destaque, ordenação normal.
