# 19: Tela "meus dados"

**O que construir:** o titular exporta, corrige, revoga consentimentos e pede
exclusão dos próprios dados, e acompanha o andamento do pedido.

**Bloqueado por:** 18.

**Status:** done (mecanismo) — D1/D2 pendente

Depende de D1 (o que é retido na exclusão e por quanto).

- [x] Exportar tudo o que a plataforma tem sobre o titular em formato aberto
      (JSON/CSV).
- [x] Corrigir dados pessoais; revogar consentimentos ativos.
- [x] Solicitar exclusão → `DataSubjectRequest` com tipo, estado e prazo.
- [x] Exclusão leva o perfil a `ANONYMIZED`: remove nome, telefone, e-mail,
      foto; histórico de trabalho resta pseudonimizado.
- [x] Canal do encarregado (DPO) publicado.
- [x] Teste: exportação completa; anonimização não deixa PII residual.
