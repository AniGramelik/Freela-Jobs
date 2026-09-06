# 01: Scaffold Next.js + Prisma + Postgres

**O que construir:** um projeto de pé em local, preview e produção, que qualquer
pessoa do time clona e roda do zero seguindo o README.

**Bloqueado por:** nenhum (pode começar já).

**Status:** done

- [x] `npm run dev` sobe o app; página inicial responde (HTTP 200, "Freela Jobs").
      Ver desvio abaixo — `npm`, não `pnpm`.
- [x] Prisma configurado com Postgres; primeira migração versionada em
      `prisma/migrations/20260906120000_init/` (cria a tabela `AuditLog`).
      Aplicação em banco limpo depende de um Postgres — ver "Pendente do usuário".
- [x] `docker-compose.yml` com Postgres 16 local; README documenta Postgres
      gerenciado (Neon/Supabase) para preview e prod.
- [x] `.env.example` completo; `README.md` reproduz o setup do zero.
- [~] Deploy de preview por PR: passo manual (conta Vercel + repo no GitHub),
      documentado no README. Não executável neste ambiente.
- [x] Estrutura `src/domain` (puro) · `src/use-cases` (seam) · `src/lib` (infra)
      · `src/app` (UI), conforme ADR-0001.

## Resultado

Verificado localmente (verde): `npm run typecheck`, `npm run lint`,
`npm run test` (2 testes), `npm run build`, `npm run dev` (200 em `/`).

Stack instalada: Next 16.3, React 19, Prisma 6.19, Vitest 3.2, TypeScript 5.
Git inicializado; `.gitattributes` (eol=lf) e `.gitignore` no lugar. Arquivos
staged, **sem commit** (aguarda decisão do usuário).

### Desvios do plano

- **`npm` em vez de `pnpm`** (ADR-0001 previa `pnpm`): corepack sem permissão de
  escrita em `C:\Program Files\nodejs`. Documentado no README; reversível.
- **Next/Vitest bumpados** de 15/2 para 16/3 para eliminar um CVE crítico
  (dev-tooling) reportado pelo `npm audit`. Restam 5 pendências `npm audit`,
  todas em ferramentas de desenvolvimento (transitivas de `vitest`/`prisma`),
  sem exposição em produção — gate contínuo fica no ticket 02 e no 21.
- **Tabela `AuditLog` já no schema**: é infra transversal (ADR-0002/0004) sem
  comportamento próprio; o ticket 04 adiciona o helper de autorização e o
  caminho de escrita, não a tabela. Dá substância à primeira migração.

### Pendente do usuário

1. Subir um Postgres (`docker compose up -d` ou URL gerenciada) e rodar
   `npm run db:deploy` para aplicar a migração inicial em banco limpo.
2. Criar o repositório no GitHub e importar na Vercel para os previews por PR
   (passos no README).
3. Fazer o commit inicial dos arquivos staged, se aprovar.
