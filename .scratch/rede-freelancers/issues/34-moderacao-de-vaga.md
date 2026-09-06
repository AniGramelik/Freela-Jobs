# 34: Moderação de vaga

**O que construir:** o suporte remove uma vaga abusiva ou enganosa e a empresa é
notificada.

**Bloqueado por:** 28.

**Status:** ready-for-agent

- [ ] Denúncia de vaga com motivo (por qualquer usuário).
- [ ] Suporte remove a vaga (`JobPosting → CANCELLED` por moderação) e notifica a
      empresa com a razão.
- [ ] Candidaturas em aberto são encerradas e os candidatos avisados.
- [ ] Ação gera `AuditLog`.
- [ ] Teste: vaga removida some da busca; candidaturas não ficam penduradas.
