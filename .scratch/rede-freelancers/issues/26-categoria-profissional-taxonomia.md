# 26: Categoria profissional (taxonomia extensível)

**O que construir:** o conceito de categoria profissional existe, com um conjunto
inicial ativado, e o profissional escolhe a sua.

**Bloqueado por:** 08.

**Status:** ready-for-agent

- [ ] `ProfessionalCategory` com seed das categorias operacionais/eventuais do
      piloto; flag de ativa/inativa.
- [ ] Profissional (perfil `CLAIMED`) e perfil gerenciado carregam uma ou mais
      categorias.
- [ ] Estrutura permite categoria futura exigir campos e verificação próprios,
      sem migração de modelo (só dados).
- [ ] Teste: categoria inativa não aparece para seleção nem para busca.
