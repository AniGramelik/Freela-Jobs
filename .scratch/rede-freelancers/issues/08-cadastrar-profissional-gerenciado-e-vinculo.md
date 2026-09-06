# 08: Cadastrar profissional gerenciado + vínculo

**O que construir:** a empresa adiciona ao seu acervo alguém que já usa, com
funções e nota privada, e encontra essa pessoa numa lista pesquisável.

**Bloqueado por:** 06.

**Status:** ready-for-agent

- [ ] `ProfessionalProfile` estado `MANAGED` (nome, telefone E.164, e-mail?,
      `createdByCompanyId`, `sourceNote?`).
- [ ] `WorkRelationship` empresa↔profissional com `roles[]` e `privateNote?`,
      único por (empresa, profissional).
- [ ] Nota privada nunca visível a outra empresa nem ao profissional.
- [ ] Lista pesquisável por nome, telefone e função, escopada por empresa.
- [ ] Telefone já existente **não** cria duplicado: encaminha para vincular a
      empresa ao perfil existente (ver 12).
- [ ] Teste: E.164 inválido recusado; isolamento entre empresas.
