# 20: Job de retenção

**O que construir:** um job diário que anonimiza dado além do prazo, sempre com
simulação e relatório antes de aplicar.

**Bloqueado por:** 18.

**Status:** needs-info

Depende de D1 (prazos de retenção definitivos).

- [ ] Job diário no worker com modo dry-run + relatório do que seria anonimizado.
- [ ] Alvos: convite não aceito, perfil gerenciado parado, conta encerrada
      (prazos conforme ADR-0005, a confirmar).
- [ ] Empresa é avisada antes de um perfil da sua base ser anonimizado.
- [ ] Teste: dry-run não altera dado; aplicação anonimiza exatamente o que o
      relatório previu.
