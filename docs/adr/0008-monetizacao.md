# ADR-0008 — Monetização

- Status: aceito quanto ao modelo; **proposto** quanto a preços (D10)
- Data: 2026-09-06
- Substitui a seção "Monetização" do ADR-0005 e as notas anteriores do spec

## Contexto

Antes: "Etapa 1 gratuita; receita na Etapa 2 (acesso à rede pública)". Com o
mural de vagas nacional (ADR-0007), a receita muda de lugar.

## Decisão

### O que é sempre gratuito

- Base privada: cadastro de perfis gerenciados, vínculos, convites, claim.
- Convocação (direcionada e aberta) a partir da própria base.
- Rede local por opt-in (Etapa 2): buscar e convidar profissionais próximos.
- Para o **profissional**: tudo. Criar conta, assumir perfil, declarar
  disponibilidade, receber convocação, candidatar-se a vagas. O profissional
  nunca paga.

### Onde entra receita — o mural nacional (Etapa 3)

- **Plano da empresa** (`CompanyPlan`):
  - `FREE` — até N vagas `PUBLISHED` simultâneas (N a definir, D10).
  - Pago — assinatura mensal por empresa, teto maior ou ilimitado de vagas
    ativas.
- **Destaque / impulsionamento** (`FeaturedListing`) — posição paga de uma vaga
  acima do teto do plano ou em posição de maior visibilidade na busca. Cobrança
  por período.
- Billing pode ser **manual** no início da Etapa 3 (liberação e cobrança fora do
  produto) para validar disposição a pagar antes de integrar um provedor.

### Fora deste ADR

- Preços, valor de N no plano free, duração e preço do destaque: **D10**,
  pendente.
- Comissão sobre contratação, cobrança por candidatura, planos para o
  profissional: **rejeitados** — contradizem "o profissional nunca paga" e o
  princípio de crescer pelo uso.

## Consequências

- Schema: `CompanyPlan` (estado, teto, período) e `FeaturedListing` (vaga,
  período, origem do pagamento). Gate de publicação de vaga checa o plano.
- Nenhuma feature das Etapas 1–2 pode passar a exigir plano pago — isso quebraria
  a isca. Testes devem travar regressão nesse ponto.
- A decisão de billing manual primeiro mantém a Etapa 3 entregável sem
  dependência de provedor de pagamento.
