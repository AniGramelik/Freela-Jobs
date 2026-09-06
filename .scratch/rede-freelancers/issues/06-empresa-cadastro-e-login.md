# 06: Empresa se cadastra e faz login

**O que construir:** um dono cria a conta da empresa, confirma o e-mail, entra e
cai num painel (ainda vazio).

**Bloqueado por:** 01, 02.

**Status:** ready-for-agent

- [ ] Cadastro por e-mail + senha (hash Argon2/bcrypt); verificação de e-mail
      obrigatória antes do primeiro acesso.
- [ ] Login também por magic link (token uso único, expira em 15 min, não
      enumerável).
- [ ] Ao criar a empresa, o criador vira `OWNER` (`CompanyMembership`).
- [ ] Sessão em cookie httpOnly + SameSite, com expiração e renovação.
- [ ] Rate limiting em login e em envio de magic link.
- [ ] Teste E2E: cadastro → verificação → login → painel.
