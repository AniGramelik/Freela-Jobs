# 20: Job de retenção

**O que construir:** um job diário que anonimiza dado além do prazo, sempre com
simulação e relatório antes de aplicar.

**Bloqueado por:** 18.

**Status:** done (mecanismo) — D1/D2 pendente

Depende de D1 (prazos de retenção definitivos).

- [x] Job diário no worker com modo dry-run + relatório do que seria anonimizado.
- [x] Alvos: convite não aceito, perfil gerenciado parado, conta encerrada
      (prazos conforme ADR-0005, a confirmar).
- [x] Empresa é avisada antes de um perfil da sua base ser anonimizado.
- [x] Teste: dry-run não altera dado; aplicação anonimiza exatamente o que o
      relatório previu.
