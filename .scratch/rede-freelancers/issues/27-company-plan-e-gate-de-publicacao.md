# 27: CompanyPlan + gate de publicação

**O que construir:** cada empresa tem um plano com teto de vagas ativas, e um
caso de uso central checa esse teto antes de publicar.

**Bloqueado por:** 06.

**Status:** done

Decisão pendente (D10): valor de N no plano `FREE` e mensalidade — são
configuração, não código. Construir com N configurável.

- [x] `CompanyPlan` (`FREE` com teto N; pago mensal com teto maior). Atribuição
      manual pelo suporte no início da Etapa 3.
- [x] Caso de uso `assertCanPublishJob(companyId)` usado por qualquer caminho de
      publicação.
- [x] Nenhuma função das Etapas 1–2 passa a depender de plano (teste de
      regressão trava isso).
- [x] Teste: publicar além do teto é bloqueado com mensagem clara; mudar o plano
      libera.

## Resultado (lote A)

`CompanyPlan` (FREE com `activeJobLimit` configurável; PAID). `getCompanyPlan`
(default FREE/3), `setCompanyPlan` (suporte), `assertCanPublishJob` (conta
`PUBLISHED` < teto; PAID ilimitado). Coberto pelos testes do ticket 28.
