# Runbook — Restore do Postgres

Objetivo: recuperar o banco a partir de um backup, num ambiente limpo, e ter o
tempo de recuperação medido.

## Opção A — restore point-in-time do provedor (preferida no piloto)

- **Neon:** Console → **Restore** → escolher timestamp dentro da janela de
  retenção → confirmar. Gera um branch/estado novo; repontar `DATABASE_URL`.
- **Supabase:** Dashboard → **Database → Backups** → **Restore** no ponto
  desejado.

Mais rápido e sem manuseio de arquivo. Usar isto para incidentes reais.

## Opção B — restore de um `.dump` (`pg_dump --format=custom`)

Para o artefato do workflow de backup ou um dump manual.

```bash
# 1. Baixar o artefato postgres-backup do GitHub Actions e extrair o .dump

# 2. Criar um banco limpo de destino (local ou gerenciado)
createdb -h <host> -U <user> freela_jobs_restore
#   ou, no Docker Compose local:
#   docker compose exec db createdb -U freela freela_jobs_restore

# 3. Restaurar
time pg_restore --no-owner --no-privileges --clean --if-exists \
  --dbname "postgresql://<user>:<pass>@<host>:5432/freela_jobs_restore" \
  freela-jobs-<timestamp>.dump

# 4. Conferir
psql "postgresql://<user>:<pass>@<host>:5432/freela_jobs_restore" \
  -c "select count(*) from \"AuditLog\";" \
  -c "select * from \"_prisma_migrations\" order by finished_at desc limit 5;"
```

Apontar a aplicação para o banco restaurado (`DATABASE_URL`) e abrir `/healthz`
— `database` deve responder `ok`.

## Drill de restore (fazer e registrar)

Rodar a Opção B ao menos uma vez antes do go-live e a cada trimestre. Registrar:

| Data | Origem do dump | Tamanho | Ambiente de destino | Tempo (passo 3) | Observações |
| --- | --- | --- | --- | --- | --- |
| _(pendente do primeiro drill)_ | | | | | |

O critério do ticket 03 só fecha quando a primeira linha estiver preenchida com
um restore real.
