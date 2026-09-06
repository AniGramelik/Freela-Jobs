# 27: CompanyPlan + gate de publicação

**O que construir:** cada empresa tem um plano com teto de vagas ativas, e um
caso de uso central checa esse teto antes de publicar.

**Bloqueado por:** 06.

**Status:** ready-for-agent

Decisão pendente (D10): valor de N no plano `FREE` e mensalidade — são
configuração, não código. Construir com N configurável.

- [ ] `CompanyPlan` (`FREE` com teto N; pago mensal com teto maior). Atribuição
      manual pelo suporte no início da Etapa 3.
- [ ] Caso de uso `assertCanPublishJob(companyId)` usado por qualquer caminho de
      publicação.
- [ ] Nenhuma função das Etapas 1–2 passa a depender de plano (teste de
      regressão trava isso).
- [ ] Teste: publicar além do teto é bloqueado com mensagem clara; mudar o plano
      libera.
