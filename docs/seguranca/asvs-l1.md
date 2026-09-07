# Revisão de segurança — OWASP ASVS nível 1 (ticket 21)

Estado no fechamento do piloto. `ok` = atendido; `⚠️` = pendente/parcial.

## Autenticação (V2)

- ok — Senha com hash Argon2id (`@node-rs/argon2`).
- ok — Magic link e convite: token de 256 bits, hash SHA-256 no banco, uso
  único, expiração (15 min / 60 dias).
- ok — OTP de claim: 6 dígitos, hash no banco, expira em 10 min, máx. 5
  tentativas, rate limit 3/10 min por telefone.
- ok — Verificação de e-mail obrigatória antes do primeiro acesso por senha.
- ⚠️ — MFA para contas de empresa: fora do piloto.

## Sessão (V3)

- ok — Token opaco de 256 bits, só o hash no banco.
- ok — Cookie `httpOnly`, `SameSite=Lax`, `Secure` em produção, `Path=/`.
- ok — Expiração absoluta 30 dias + renovação deslizante; sessão expirada é
  apagada ao resolver.
- ok — Logout destrói a sessão no servidor.

## Controle de acesso (V4)

- ok — Todo caso de uso de dado de empresa deriva `companyId` da sessão +
  `CompanyMembership`; `companyId` do cliente é validado, nunca confiado.
- ok — Troca de contexto de empresa sem membership → 403 + `AuditLog`.
- ok — Telas do profissional/empresa isoladas por `professionalProfileId` /
  `companyId` do vínculo.

## Validação e injeção (V5)

- ok — Acesso a dados só via Prisma (queries parametrizadas).
- ok — E-mail normalizado; telefone normalizado para E.164; enums validados.
- ⚠️ — Sanitização de saída: as telas do piloto são texto simples; revisar ao
  introduzir HTML rico.

## Rate limiting / anti-automação (V11)

- ok — Login (10/15 min), magic link (3/15 min), OTP de claim (3/10 min),
  persistidos em `RateLimitBucket`.
- ⚠️ — Chave só por e-mail/telefone; adicionar IP quando houver proxy confiável.
- ⚠️ — CAPTCHA/desafio: fora do piloto.

## Logging e monitoramento (V7)

- ok — Logs estruturados JSON com `requestId`; segredos redigidos.
- ok — `AuditLog` append-only para claim, merge, avaliação, negativa de
  autorização, acesso de suporte.
- ⚠️ — `SENTRY_DSN` a configurar em produção.

## Dados sensíveis (V6/V8)

- ok — Nota privada da empresa nunca exposta ao profissional nem a outra
  empresa (teste garante).
- ok — Avaliação interna nunca exposta ao profissional (teste garante).
- ok — Endereço aproximado (bairro) para empresas sem vínculo / vagas públicas.
- ⚠️ — Bases legais LGPD e prazos de retenção: **pendente de revisão jurídica
  (D1/D2)**. Mecanismo pronto (`Consent`, `runRetention`, `anonymizeProfile`,
  tela "meus dados"), não liberar para usuários reais sem a confirmação.

## Dependências

- `npm audit`: pendências apenas em ferramentas de desenvolvimento (transitivas
  de `vitest`/`prisma`), sem exposição em produção. Acompanhar upstream.

## Teste de carga

- ⚠️ — Executar um teste sintético do fluxo de convocação (criar → publicar →
  N respostas concorrentes) antes do go-live e registrar p95 do despacho.
