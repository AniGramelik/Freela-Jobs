# ADR-0001 — Stack: Next.js + PostgreSQL + Prisma

- Status: aceito
- Data: 2026-09-05

## Contexto

Greenfield. Time de 1–2 pessoas com conforto em TypeScript. Escala-alvo de 12
meses: ~100 empresas / ~3.000 profissionais. Entregas exigem testes, documentação
e desempenho verificáveis por fase.

## Decisão

- **Next.js (App Router)** como aplicação única: web para empresa e PWA
  mobile-first para profissional no mesmo deploy.
- **PostgreSQL** único (sem sharding, sem read replicas no piloto). Extensão
  `earthdistance`/`cube` **ou** coluna `geography` do PostGIS para consulta por raio
  — decidir no ADR-0006.
- **Prisma** como ORM e ferramenta de migração.
- Hospedagem: Vercel (app) + Neon ou Supabase (Postgres gerenciado).
- Sem microserviços. Trabalho assíncrono (envio de notificação) via fila leve
  (tabela `outbox` + worker) antes de adotar infra dedicada.

## Consequências

- Um só runtime e uma só linguagem: menor custo cognitivo e de operação.
- Tipagem ponta a ponta (schema Prisma → tipos → API).
- Limite conhecido: funções serverless da Vercel têm timeout curto; jobs longos
  exigem worker separado (Fase 2, quando entrar matching/relatórios).
- Se a escala real superar ~10x a projeção, revisitar: extrair worker, adicionar
  replica de leitura, cache.
