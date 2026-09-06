# 16: Convocação aberta (função + raio + disponibilidade)

**O que construir:** a empresa deixa a convocação aberta e os profissionais
elegíveis da base são notificados e aceitam até preencher as vagas.

**Bloqueado por:** 09, 15, 13.

**Status:** ready-for-agent

- [ ] `CallOut` modo `OPEN`: elegível = função compatível + dentro do raio
      (ADR-0006) + `WorkRelationship` ativo.
- [ ] Disponibilidade declarada é filtro, não trava: profissional fora da janela
      ainda pode responder.
- [ ] Notificação a todos os elegíveis via outbox; empresa vê a taxa de alcance.
- [ ] Vagas param de aceitar ao lotar; `CallOut → FILLED`.
- [ ] Teste: elegibilidade por raio usa índice; sem N+1 na lista.
