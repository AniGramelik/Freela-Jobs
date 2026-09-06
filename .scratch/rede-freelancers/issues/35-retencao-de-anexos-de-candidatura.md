# 35: Retenção de anexos de candidatura

**O que construir:** currículo e carta enviados em candidaturas são apagados no
prazo ou a pedido do titular.

**Bloqueado por:** 30, 20.

**Status:** needs-info

Depende de D1 (prazo de retenção do anexo — proposta: 12 meses após o
encerramento da vaga).

- [ ] O job de retenção (20) passa a cobrir `Application.attachments` e
      `coverMessage`.
- [ ] Pedido de exclusão do titular (19) remove anexos de candidaturas
      anteriores dentro do prazo de atendimento.
- [ ] Remoção do anexo não apaga o registro da candidatura (fica pseudonimizado
      para a empresa).
- [ ] Teste: anexo além do prazo é removido no dry-run/apply; pedido de titular
      limpa retroativo.
