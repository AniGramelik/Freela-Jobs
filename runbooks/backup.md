# Runbook — Backup do Postgres

## Fonte primária: provedor gerenciado

Ativar antes do go-live do piloto.

### Neon
- Console → projeto → **Settings → Storage / History retention**.
- Definir retenção de **7 dias** (piloto). Isso habilita restore point-in-time
  dentro da janela.

### Supabase
- Dashboard → **Database → Backups**.
- Plano Pro: backups diários automáticos; confirmar retenção de 7 dias.
- Anotar que o restore é feito pelo suporte/dashboard, não por `pg_restore`
  direto no piloto.

Verificar mensalmente que o backup mais recente tem < 24 h.

## Reforço: cópia fora do provedor

Workflow `.github/workflows/backup.yml` roda `pg_dump` diário (04:17 UTC) e
guarda o `.dump` como artefato do GitHub com **retenção de 7 dias**.

Configuração única:
1. Criar o secret `PRODUCTION_DATABASE_URL` no repositório
   (Settings → Secrets and variables → Actions).
2. Rodar o workflow manualmente uma vez (**Run workflow**) e confirmar que o
   artefato `postgres-backup` foi gerado.

> O `pg_dump` do runner `ubuntu-latest` é da linha 16. Se o Postgres de produção
> subir para um major mais novo, adicionar um passo instalando o
> `postgresql-client` correspondente (repositório PGDG).

## Restore

Ver [restore.md](./restore.md).
