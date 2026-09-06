# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript estrito, PostgreSQL único, Prisma para schema e
migração. Deploy em Vercel + Postgres gerenciado (Neon ou Supabase). Escolha
confirmada pelo usuário (ver `docs/adr/0001`); ainda sem scaffold em código. PWA
mobile-first para o profissional e web para a empresa saem do mesmo deploy.

## Users

Dois usuários primários, com prioridade igual nas decisões de produto:

- **Dono ou gerente de negócio** — no piloto, pequenos negócios locais (bar,
  restaurante, academia, casa de eventos, buffet, operação de lazer); nas etapas
  seguintes, qualquer empresa que precise contratar. Situação: precisa cobrir um
  turno com pouca antecedência ou preencher uma vaga (diária, temporária, PJ,
  CLT), e hoje resolve o caso urgente por grupo informal de WhatsApp. Job: achar
  e confirmar rápido gente confiável, e manter registro de quem já trabalhou e
  como foi. Opera em web (desktop e mobile).
- **Profissional** — no piloto, mão de obra operacional e eventual (garçom,
  chapeiro, segurança, apoio de eventos); nas etapas seguintes, qualquer
  categoria profissional, inclusive reguladas (advogado, engenheiro, contador),
  ativadas por categoria. Situação: recebe propostas desencontradas em vários
  grupos e não controla quando nem para quem aparece disponível. Job: manter uma
  base privada de trabalho com empresas que já o conhecem, receber convocações
  claras e responder em poucos toques, e — quando quiser — candidatar-se a vagas
  públicas. Usa PWA no celular.

Papel secundário: **suporte interno** (moderação, atendimento a pedidos LGPD,
conta), com acesso auditado.

## Product Purpose

Dar a pequenos negócios e profissionais uma forma estruturada, rápida,
pesquisável e segura de organizar e encontrar trabalho — do reforço pontual de
equipe à vaga temporária ou efetiva —, substituindo o uso informal de grupos de
WhatsApp para o caso urgente e oferecendo um mural de vagas confiável para o
caso planejado.

Sucesso: a empresa preenche turnos e vagas mais rápido e com registro confiável;
o profissional recebe trabalho com clareza e com controle sobre a própria
exposição. Métricas do piloto a instrumentar: tempo entre a convocação aberta e a
vaga preenchida; taxa de alcance da notificação de convocação; proporção de
perfis gerenciados que viram reivindicados; número de convocações por empresa por
semana. Métricas do mural (Etapa 3): vagas publicadas por semana, candidaturas
por vaga, tempo até a primeira triagem.

## Positioning

O mecanismo é o crescimento pelo próprio uso, construído de dentro para fora:

1. Cada empresa cadastra os profissionais que já utiliza como perfis gerenciados
   e os convida a assumir o perfil (base privada).
2. O profissional assume o perfil, declara disponibilidade e pode optar por
   receber propostas de outras empresas (rede local por opt-in).
3. Só depois, com base já formada, abre-se o **mural de vagas nacional**: a
   empresa publica vagas abertas e qualquer profissional se candidata.

Isso evita o problema de partida a frio dos dois lados que um mural de vagas
horizontal enfrenta desde o dia 1. A base privada e a convocação a partir de
gente conhecida são o diferencial que um agregador de vagas genérico
(Catho, Indeed, GupY, Vagas.com) não tem.

## Operating Context

- **Faseamento geográfico.** Piloto em **Colatina, Espírito Santo** (cidade
  única, para densidade). Etapa 3 abre para **todo o Brasil**. Copy,
  geocodificação e cálculo de raio assumem esse faseamento; nada no modelo de
  dados impede o alcance nacional.
- **Dois fluxos de contratação distintos, coexistindo:**
  - **Convocação** — a empresa chama gente da própria base privada (modo
    direcionado a pessoas escolhidas, ou aberto por função + raio dentro da
    base). O profissional aceita; vagas preenchem por aceite. É o fluxo que
    substitui o grupo de WhatsApp.
  - **Vaga pública + Candidatura** — a empresa publica uma vaga aberta a
    estranhos; o profissional se candidata; a empresa faz triagem. É o fluxo de
    mural de vagas (Etapa 3).
- Cada **Vaga** declara `tipoDeVínculo` (diária, temporário, PJ/freela,
  CLT/efetivo, estágio) e `modoDeLocal` (presencial com endereço e raio,
  híbrido, remoto). A plataforma divulga e conecta — **não** gerencia contrato,
  folha nem eSocial.
- "Local" é um filtro (cidade, estado, raio em km sobre lat/long, remoto), não
  mais a fronteira do produto. Raio default de 20 km para convocação e para vaga
  presencial, ajustável.
- Notificação por push da PWA + e-mail; SMS e WhatsApp Business API plugáveis por
  trás de uma camada abstrata.
- **Categoria profissional** é um conceito extensível. O piloto ativa categorias
  operacionais/eventuais (verificação leve). Categorias reguladas
  (advogado, engenheiro, contador) são possíveis no modelo, mas verificação de
  conselho de classe não é priorizada no piloto — entra quando a categoria for
  ativada.
- A plataforma **não** processa pagamento entre empresa e profissional — apenas
  registra o combinado (texto livre na Etapa 1).
- Vocabulário de domínio em `CONTEXT.md`. Trabalho futuro usa esses termos.

## Capabilities and Constraints

Confirmado no escopo do produto:

- Cadastro de perfis gerenciados; vínculos de trabalho com funções e notas
  privadas da empresa.
- Convite e fluxo de "assumir perfil" com verificação de telefone por OTP;
  deduplicação e fusão de perfis por telefone verificado (E.164).
- Disponibilidade declarada pelo profissional; após o claim, dados pessoais e
  disponibilidade são exclusivos do profissional.
- **Convocações** direcionadas e abertas; resposta em poucos toques;
  preenchimento de vagas com limite; registro de presença.
- **Vagas públicas e candidaturas** (Etapa 3): a empresa publica vaga com
  categoria, tipo de vínculo, modo de local e prazo; o profissional se candidata
  com mensagem e anexos; a empresa faz triagem por estados
  (recebida → em análise → selecionada → oferta → aceita/recusada). Uma
  candidatura aceita pode gerar um vínculo de trabalho (com consentimento do
  profissional), realimentando a base privada.
- Avaliações internas privadas da empresa autora (invisíveis ao profissional na
  Etapa 1); histórico por profissional e por empresa.
- Direitos do titular (LGPD): exportar, corrigir, revogar consentimento,
  solicitar exclusão; auditoria de acesso a dado pessoal.
- Rede local por opt-in (Etapa 2): busca por função + raio + disponibilidade;
  reputação pública agregada e anônima; moderação.

Restrições e parâmetros:

- Idioma pt-BR apenas; textos de interface centralizados para i18n futura.
- Escala-alvo de 12 meses do piloto local: ~100 empresas / ~3.000 profissionais;
  PostgreSQL único, sem microserviços. O alcance nacional da Etapa 3 exige
  revisar índices, busca de vagas e, possivelmente, um worker dedicado
  (ver `docs/adr/0007`).
- Monetização: base privada + convocação + rede local **gratuitas**. No mural
  nacional, plano mensal por empresa com teto de vagas ativas no plano grátis e
  cobrança por destaque/impulsionamento acima disso. O profissional **nunca**
  paga; candidatura é sempre gratuita.

Fora de escopo ou explicitamente indefinido:

- Fora: folha de pagamento, eSocial, emissão de contrato ou gestão de vínculo
  trabalhista formal.
- Fora no piloto: checagem de antecedentes; validação documental; verificação de
  conselho de classe; login por OTP de SMS/WhatsApp como fator primário;
  aplicativo nativo iOS/Android.
- Fora: ranking algorítmico de matching; exibição de comentários individuais de
  avaliação na rede pública.
- Indefinido (decisões pendentes registradas no spec): bases legais LGPD e prazos
  de retenção (D1, requer revisão jurídica — escopo agora nacional); DPO (D2);
  remuneração estruturada vs texto livre (D5); detalhes de busca da rede pública
  (D6); forma da reputação pública (D7); wedge de aquisição do mural nacional,
  preços exatos do plano e do destaque, e se a busca de vagas precisa de
  infraestrutura dedicada (D9–D11, ver `docs/adr/0007` e `0008`).

## Brand Commitments

- **Nome: Freela Jobs.** Sem logo, identidade visual, paleta, tipografia ou tom
  de voz definidos ainda — trabalho futuro não deve assumir nenhum desses
  elementos como existente.
- Idioma pt-BR é compromisso, com linguagem simples e sem jargão de RH
  (alfabetização digital variável entre os profissionais).

## Evidence on Hand

- Não existe ainda: cliente-piloto nomeado, dado real de profissional ou de
  empresa, vaga real, depoimento, caso, imprensa ou qualquer asset visual.
  Trabalho futuro não deve fabricar nenhum desses.
- Documentação de produto interna: `CONTEXT.md` (glossário e fronteiras),
  `docs/adr/0001`–`0008` (decisões de arquitetura),
  `.scratch/rede-freelancers/spec.md` (especificação completa) e
  `.scratch/rede-freelancers/map.md`.

## Product Principles

1. **Crescer de dentro para fora.** Base privada → rede local por opt-in → mural
   nacional. Cada etapa só abre quando a anterior deu densidade; nada de partida
   a frio dos dois lados.
2. **O profissional é dono dos próprios dados.** Depois do claim, disponibilidade
   e dados pessoais são só dele; visibilidade pública e candidatura são sempre
   ações ativas dele.
3. **Dois fluxos, um registro.** Convocação (gente conhecida) e vaga pública
   (estranhos) são experiências distintas, mas alimentam o mesmo histórico
   auditável de quem trabalhou e como foi.
4. **Tela funcionando não conclui entrega.** Negócio, segurança, privacidade,
   integridade de dados, testes, desempenho e documentação são critérios de
   "pronto" em cada fase.
5. **Velocidade sob pressão de tempo.** Convocar e responder são as ações mais
   frequentes e precisam ser as mais rápidas: poucos toques, notificação
   confiável, detalhe completo antes do aceite.

## Accessibility & Inclusion

- Alvo WCAG 2.1 AA: navegação por teclado, contraste AA, rótulos ARIA nos fluxos
  de convocação, de resposta e de candidatura.
- Público inclui profissionais em celulares modestos e conexões móveis variáveis:
  a PWA deve carregar rápido (First Contentful Paint ≤ 2,5 s em 4G) e permitir
  leitura offline de convocações já recebidas.
- Linguagem simples em pt-BR, evitando jargão técnico e de RH.
