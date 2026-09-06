# 11: Profissional assume o perfil via OTP

**O que construir:** o profissional abre o link do convite, prova posse do
telefone com um código, cria seu acesso e vira dono do próprio perfil.

**Bloqueado por:** 10.

**Status:** done

Decisão pendente: provedor de OTP (SMS). Pode começar com OTP por e-mail,
registrando a limitação; trocar canal é follow-up.

- [x] Abrir link valida token e estado do `Invite`.
- [x] Enviar e validar OTP no telefone do perfil (uso único, expira ~10 min,
      tentativas limitadas).
- [x] Criar `User` (magic link) ou vincular a `User` existente; perfil →
      `CLAIMED`, `ownerUserId` preenchido.
- [x] Passos 2–4 numa transação; falha no meio não deixa perfil meio-reivindicado.
- [x] Após o claim, dados pessoais e disponibilidade passam a ser exclusivos do
      profissional; empresa só edita o vínculo.
- [x] Teste: OTP errado N vezes trava; claim concorrente do mesmo perfil resolve
      para um único dono.
