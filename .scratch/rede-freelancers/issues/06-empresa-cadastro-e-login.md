# 06: Empresa se cadastra e faz login

**O que construir:** um dono cria a conta da empresa, confirma o e-mail, entra e
cai num painel (ainda vazio).

**Bloqueado por:** 01, 02. (Verificação de e-mail usa o Notifier/outbox do 05.)

**Status:** done

- [x] Cadastro por e-mail + senha (Argon2id via `@node-rs/argon2`), e-mail
      normalizado, verificação obrigatória antes do primeiro acesso.
      `signUpCompany` cria `User` + `Company` + `CompanyMembership(OWNER)` +
      `EmailVerificationToken` e enfileira o e-mail de verificação numa única
      transação (via `enqueueOutbox`).
- [x] Login por magic link — `requestMagicLink` / `consumeMagicLink`; token de
      alta entropia, hash SHA-256 no banco, validade 15 min, uso único, sem
      enumeração (resposta idêntica exista ou não a conta). Magic link também
      confirma posse do e-mail.
- [x] Login por senha — `logInWithPassword`; exige e-mail verificado.
- [x] Criador vira `OWNER` (`CompanyMembership`).
- [x] Sessão em cookie `fj_session` httpOnly + SameSite=Lax + Secure(prod),
      TTL 30 dias, renovação deslizante ao passar de metade da validade
      (`resolveSession`), expiração apaga a linha. `/painel` protegido por
      `requireSession()`; `/sair` destrói a sessão.
- [x] Rate limiting em login (10/15min por e-mail) e magic link (3/15min),
      persistido em `RateLimitBucket` (janela fixa, transacional).
- [~] Teste E2E cadastro → verificação → login → painel: coberto a nível
      **funcional** — `auth.int.test.ts` percorre o caminho pelos casos de uso
      reais sobre Postgres real, e as páginas/guard foram checadas ao vivo
      (`/cadastro` 200, `/painel` sem sessão → 307 `/entrar`). Um smoke de
      **browser** (Playwright) fica como follow-up.

## Resultado

Verde local: `typecheck`, `lint`, `test` (52 testes; unit + integração),
`test:coverage` (`src/domain` 100%; `use-cases` ~86% — `auth` 94%, `session`
90%, `rate-limit` 100%), `build` (rotas `/cadastro`, `/entrar`, `/verificar`,
`/entrar/magico`, `/painel`, `/sair`).

### Mudanças

- Schema: `User`, `Company`, `CompanyMembership`, `CompanyRole`, `Session`,
  `EmailVerificationToken`, `MagicLinkToken`, `RateLimitBucket` + migração
  `20260906222740_auth`.
- `src/domain/auth.ts` (+ teste) — normalização de e-mail, política de senha,
  TTLs, renovação de sessão.
- `src/lib/tokens.ts`, `src/lib/password.ts`, `src/lib/session.ts` (cookie +
  `getSessionUser` / `requireSession`).
- `src/use-cases/auth.ts`, `session.ts`, `rate-limit.ts` (+ `auth.int.test.ts`).
- Rotas/páginas em `src/app/` (formulários sem estilo — o design entra depois
  via impeccable).
- dep: `@node-rs/argon2`.

### Amarração pendente (ticket 07)

- Seletor de contexto de empresa (o usuário só tem 1 empresa hoje; o `Actor`
  com `memberships` reais do ticket 04 passa a ser preenchido a partir de
  `getSessionUser`).
- `runWithRequestContext` (ticket 03) num wrapper de request.
