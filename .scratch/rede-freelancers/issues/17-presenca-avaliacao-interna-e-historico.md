# 17: Presença + avaliação interna + histórico

**O que construir:** depois do turno, a empresa registra quem compareceu, avalia
internamente e consulta o histórico de cada profissional.

**Bloqueado por:** 15.

**Status:** ready-for-agent

- [ ] Marcar cada `CallOutResponse` como `COMPLETED` ou `NO_SHOW`.
- [ ] `InternalRating` (nota + comentário) exige `WorkRelationship`; privada da
      empresa autora, invisível ao profissional e a outras empresas.
- [ ] Histórico por profissional na empresa (convocações, presenças, faltas,
      avaliações) e histórico do próprio profissional por empresa.
- [ ] Teste: nota privada não vaza em nenhuma API do profissional nem de outra
      empresa.
