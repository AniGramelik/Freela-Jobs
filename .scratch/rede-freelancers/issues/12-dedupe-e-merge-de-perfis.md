# 12: Dedupe + merge de perfis no claim

**O que construir:** uma pessoa cadastrada por várias empresas termina como um
único perfil, com todo o histórico preservado.

**Bloqueado por:** 11.

**Status:** ready-for-agent

- [ ] Chave de dedupe: telefone verificado em E.164.
- [ ] Criar perfil gerenciado com telefone já existente adiciona só um
      `WorkRelationship` da nova empresa (`PENDING_CONSENT` se já `CLAIMED`).
- [ ] No claim, perfis duplicados fazem merge transacional: `WorkRelationship`,
      `CallOutResponse`, `InternalRating` movem para o canônico; duplicado →
      `MERGED` e redireciona leituras.
- [ ] `AuditLog` de cada merge; suporte inspeciona e reverte.
- [ ] Teste: contagens antes/depois conferem; dois merges simultâneos não
      corrompem.
