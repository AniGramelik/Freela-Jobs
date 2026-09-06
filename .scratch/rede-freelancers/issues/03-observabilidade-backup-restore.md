# 03: Observabilidade + backup/restore

**O que construir:** o time sabe quando algo quebra e consegue restaurar o banco.

**Bloqueado por:** 01.

**Status:** ready-for-agent

- [ ] Logs estruturados (JSON) com correlação de request no app e no worker.
- [ ] Error tracking capturando exceção não tratada com stack e contexto.
- [ ] `/healthz` cobre app, banco e fila.
- [ ] Backup diário do Postgres (retenção 7 dias no piloto).
- [ ] Restore executado num ambiente limpo, com tempo medido e registrado em
      `runbooks/restore.md`.
