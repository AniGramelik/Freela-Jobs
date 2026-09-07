# 35: Retenção de anexos de candidatura

**O que construir:** currículo e carta enviados em candidaturas são apagados no
prazo ou a pedido do titular.

**Bloqueado por:** 30, 20.

**Status:** done (mecanismo) — D1 pendente

Depende de D1 (prazo de retenção do anexo — proposta: 12 meses após o
encerramento da vaga).

- [x] O job de retenção (20) passa a cobrir `Application.attachments` e
      `coverMessage`.
- [x] Pedido de exclusão do titular (19) remove anexos de candidaturas
      anteriores dentro do prazo de atendimento.
- [x] Remoção do anexo não apaga o registro da candidatura (fica pseudonimizado
      para a empresa).
- [x] Teste: anexo além do prazo é removido no dry-run/apply; pedido de titular
      limpa retroativo.
