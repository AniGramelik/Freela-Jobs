# Freela Jobs

Plataforma que dá a pequenos negócios e profissionais uma forma estruturada,
rápida, pesquisável e segura de organizar e encontrar trabalho — do reforço
pontual de equipe à vaga temporária ou efetiva.

- Contexto de produto: [`PRODUCT.md`](./PRODUCT.md)
- Glossário e invariantes: [`CONTEXT.md`](./CONTEXT.md)
- Decisões de arquitetura: [`docs/adr/`](./docs/adr/)
- Especificação e tickets: [`.scratch/rede-freelancers/`](./.scratch/rede-freelancers/)

## Stack

Next.js (App Router) + TypeScript estrito · PostgreSQL + Prisma · Vitest.
Ver [ADR-0001](./docs/adr/0001-stack-next-postgres-prisma.md).

> **Gerenciador de pacotes:** `npm`. O ADR-0001 previa `pnpm`, mas o ambiente de
> desenvolvimento inicial não permitiu ativá-lo (corepack sem permissão de
> escrita). A troca é isolada — se `pnpm` voltar a ser viável, basta gerar o
> `pnpm-lock.yaml` e ajustar os scripts.

## Pré-requisitos

- Node.js ≥ 20 (testado com 24.x)
- npm ≥ 10
- Um PostgreSQL para desenvolvimento. Duas opções:
  - **Docker** (recomendado): `docker compose up -d` sobe um Postgres 16 local.
  - **Postgres gerenciado**: crie um banco (ex.: Neon) e aponte `DATABASE_URL`
    para ele.

## Setup do zero

```bash
# 1. dependências
npm install

# 2. variáveis de ambiente
cp .env.example .env          # ajuste DATABASE_URL se não usar o Docker Compose

# 3. banco local (opção Docker)
docker compose up -d

# 4. aplica a migração inicial
npm run db:deploy             # ou: npm run db:migrate (fluxo de desenvolvimento)

# 5. sobe o app
npm run dev                   # http://localhost:3000
```

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Next) |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint (config flat do Next) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (uma passada) |
| `npm run test:watch` | Vitest em watch |
| `npm run db:migrate` | `prisma migrate dev` — cria/aplica migração no fluxo de dev |
| `npm run db:deploy` | `prisma migrate deploy` — aplica migrações versionadas (CI/prod) |
| `npm run db:generate` | Regenera o Prisma Client |
| `npm run db:studio` | Prisma Studio |

## Estrutura

Camadas do ADR-0001, do mais puro ao mais externo:

```
src/
  domain/      Funções puras: máquinas de estado, invariantes, cálculos.
               Sem I/O, sem Prisma, sem Date.now não injetado.
  use-cases/   Camada de aplicação e seam primária de testes. Cada caso de uso
               recebe um contexto transacional + o ator e retorna um Result
               tipado. Nenhuma regra de negócio fora daqui.
  lib/         Infra: cliente Prisma, validação de env. Detalhe de implementação.
  app/         Next.js App Router. UI fina que apenas fia casos de uso.
prisma/
  schema.prisma
  migrations/  Migrações versionadas (a primeira cria a tabela AuditLog).
```

Testes ficam ao lado do código (`*.test.ts`) e rodam em ambiente Node.
A seam primária (casos de uso sobre Postgres real) entra a partir do ticket 06.

## Deploy de preview por PR

Passo manual único (precisa da conta Vercel + repositório no GitHub):

1. Suba o repositório para o GitHub.
2. Importe o projeto em [vercel.com/new](https://vercel.com/new).
3. Defina `DATABASE_URL` nas variáveis de ambiente do projeto (Preview e
   Production), apontando para o Postgres gerenciado.
4. A partir daí, todo PR ganha um deploy de preview automático; o `main` publica
   em produção.

O build de produção da Vercel deve rodar `npm run db:deploy` antes de `next build`
(configurar em Build Command ou num passo de CI — ver ticket 02).

## CI e proteção de branch

O workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) roda em todo
PR e no push para `main`: `install → prisma generate → lint → typecheck →
migrate (Postgres efêmero de serviço) → test + coverage → build`. Um comentário
de cobertura é postado no PR; o job falha se a cobertura de `src/domain/**` cair
abaixo de 80%.

**Passo manual único** (proteção de branch, feita nas configurações do GitHub):

1. Settings → Branches → Add branch ruleset para `main`.
2. Exigir PR antes do merge e marcar **"Require status checks to pass"** →
   selecionar o check **`verify`**.
3. Opcional: "Require branches to be up to date before merging".

Sem isso, o CI roda mas não bloqueia merge.

## Notas de segurança (dependências)

`npm audit` reporta pendências **apenas em ferramentas de desenvolvimento**
(transitivas de `vitest`/`vite` e da CLI do `prisma`): sem exposição no build de
produção nem em runtime. O gate contínuo de CVE é responsabilidade do ticket 02
(CI) e do ticket 21 (revisão de segurança).
