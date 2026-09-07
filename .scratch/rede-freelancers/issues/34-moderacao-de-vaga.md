# 34: Moderação de vaga

**O que construir:** o suporte remove uma vaga abusiva ou enganosa e a empresa é
notificada.

**Bloqueado por:** 28.

**Status:** done

- [x] Denúncia de vaga com motivo (por qualquer usuário).
- [x] Suporte remove a vaga (`JobPosting → CANCELLED` por moderação) e notifica a
      empresa com a razão.
- [x] Candidaturas em aberto são encerradas e os candidatos avisados.
- [x] Ação gera `AuditLog`.
- [x] Teste: vaga removida some da busca; candidaturas não ficam penduradas.
