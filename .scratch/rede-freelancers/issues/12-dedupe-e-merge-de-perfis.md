# 12: Dedupe + merge de perfis no claim

**O que construir:** uma pessoa cadastrada por várias empresas termina como um
único perfil, com todo o histórico preservado.

**Bloqueado por:** 11.

**Status:** done

- [x] Chave de dedupe: telefone verificado em E.164.
- [x] Criar perfil gerenciado com telefone já existente adiciona só um
      `WorkRelationship` da nova empresa (`PENDING_CONSENT` se já `CLAIMED`).
- [x] No claim, perfis duplicados fazem merge transacional: `WorkRelationship`,
      `CallOutResponse`, `InternalRating` movem para o canônico; duplicado →
      `MERGED` e redireciona leituras.
- [x] `AuditLog` de cada merge; suporte inspeciona e reverte.
- [x] Teste: contagens antes/depois conferem; dois merges simultâneos não
      corrompem.
