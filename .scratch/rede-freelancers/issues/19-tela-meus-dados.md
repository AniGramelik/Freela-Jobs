# 19: Tela "meus dados"

**O que construir:** o titular exporta, corrige, revoga consentimentos e pede
exclusão dos próprios dados, e acompanha o andamento do pedido.

**Bloqueado por:** 18.

**Status:** needs-info

Depende de D1 (o que é retido na exclusão e por quanto).

- [ ] Exportar tudo o que a plataforma tem sobre o titular em formato aberto
      (JSON/CSV).
- [ ] Corrigir dados pessoais; revogar consentimentos ativos.
- [ ] Solicitar exclusão → `DataSubjectRequest` com tipo, estado e prazo.
- [ ] Exclusão leva o perfil a `ANONYMIZED`: remove nome, telefone, e-mail,
      foto; histórico de trabalho resta pseudonimizado.
- [ ] Canal do encarregado (DPO) publicado.
- [ ] Teste: exportação completa; anonimização não deixa PII residual.
