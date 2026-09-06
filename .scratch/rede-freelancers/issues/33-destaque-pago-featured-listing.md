# 33: Destaque pago (FeaturedListing)

**O que construir:** a empresa destaca uma vaga por um período e ela ganha
posição na busca; a cobrança é registrada manualmente no início.

**Bloqueado por:** 28.

**Status:** ready-for-agent

Decisão pendente (D10): preço e duração do destaque.

- [ ] `FeaturedListing` (vaga, período `featuredUntil`, origem do pagamento).
      Liberação manual pelo suporte.
- [ ] Vaga destacada ranqueia acima do teto do plano e em posição de maior
      visibilidade na busca (29).
- [ ] Fim do período remove o destaque automaticamente.
- [ ] Teste: destaque expira sozinho; sem destaque, ordenação normal.
