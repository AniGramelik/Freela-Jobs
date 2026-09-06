# Spec — Freela Jobs

Status: ready-for-agent
Última atualização: 2026-09-06
Relacionado: `/CONTEXT.md`, `docs/adr/0001`–`0008`, `.scratch/rede-freelancers/map.md`

---

## Problem Statement

Pequenos negócios locais que dependem de mão de obra eventual — bares,
restaurantes, academias, casas de eventos, buffets, operações de lazer —
organizam reforço de equipe por grupos informais de WhatsApp. Nesses grupos:

- o dono/gerente não sabe rápido quem está disponível para um turno específico;
- a mensagem de convocação se perde no meio de conversa paralela e nem todo
  profissional recebe a tempo;
- não há registro confiável de quem topou, quem faltou, quem trabalhou bem;
- a informação de contato e histórico vive na cabeça de uma pessoa e some quando
  ela sai;
- não existe forma estruturada de achar um profissional novo quando a base
  conhecida não cobre a demanda.

O profissional, do outro lado, recebe propostas desencontradas em vários grupos,
sem detalhe claro de função, horário, local e pagamento combinado, e não tem
controle de quando e para quem aparece como disponível.

Além do caso urgente, há o **caso planejado**: a empresa precisa preencher uma
vaga temporária, por diária, PJ, CLT ou estágio, e o profissional — de qualquer
categoria, do garçom ao advogado — precisa de um lugar confiável para encontrar
esse trabalho. Hoje isso se espalha entre murais genéricos, indicações e os
mesmos grupos de WhatsApp.

## Solution

Uma plataforma construída de dentro para fora, em três etapas. As Etapas 1 e 2
rodam no piloto (Colatina, ES); a Etapa 3 abre para todo o Brasil. O modelo de
dados suporta alcance nacional desde o início — o lançamento é que é faseado.

**Etapa 1 — base privada.** Cada empresa mantém seu próprio acervo de
profissionais: cadastra quem já usa (perfil gerenciado), registra funções e
notas privadas, dispara convocações direcionadas ou abertas, acompanha quem
aceitou, registra presença e avalia internamente. O profissional é convidado a
assumir o próprio perfil; ao assumir, passa a controlar dados pessoais e
disponibilidade, e a empresa mantém apenas o vínculo de trabalho.

**Etapa 2 — rede local por opt-in.** O profissional que autorizar visibilidade
entra numa rede pesquisável por proximidade. Empresas fora do vínculo podem
encontrá-lo por função e raio e enviar proposta; o vínculo só se efetiva com o
aceite do profissional.

**Etapa 3 — mural de vagas nacional.** A empresa publica uma **vaga** aberta a
estranhos (categoria, tipo de vínculo, modo de local, prazo); qualquer
profissional com perfil assumido se **candidata** com mensagem e anexos; a
empresa faz **triagem** por estados. Uma candidatura aceita gera um vínculo de
trabalho (com consentimento do profissional), realimentando a base privada. O
mural herda os usuários já formados no piloto como oferta e demanda iniciais.

Dois fluxos coexistem e alimentam o mesmo histórico auditável: a **convocação**
(a empresa chama gente conhecida da própria base; substitui a mensagem solta no
grupo) e a **vaga pública + candidatura** (estranhos se candidatam; a empresa
tria). Notificação confiável (push da PWA + e-mail, com SMS/WhatsApp plugáveis
depois) e resposta do profissional em poucos toques valem para os dois.

---

## User Stories

### Conta e acesso

1. Como dono de empresa, quero me cadastrar com e-mail e senha, para criar a
   conta da minha empresa.
2. Como dono de empresa, quero confirmar meu e-mail antes do primeiro acesso,
   para garantir que a conta é minha.
3. Como dono de empresa, quero entrar por magic link como alternativa à senha,
   para não depender de lembrar a senha.
4. Como profissional, quero entrar por magic link no e-mail, para acessar sem
   criar senha.
5. Como usuário, quero que minha sessão expire e se renove com segurança, para
   que um dispositivo esquecido não fique aberto para sempre.
6. Como usuário, quero que tentativas repetidas de login e de envio de magic
   link sejam limitadas, para que minha conta não seja alvo fácil de ataque.
7. Como dono que administra mais de uma empresa, quero um mesmo login para
   todas, para não gerenciar credenciais separadas.
8. Como dono com várias empresas, quero escolher em qual empresa estou agindo,
   para que cada ação e cada dado fiquem no negócio certo.
9. Como dono, quero que o acesso a dados de uma empresa da qual não sou membro
   seja negado e registrado, para ter garantia de isolamento entre empresas.
10. Como pessoa que é dona de empresa e também presta serviço, quero acumular os
    dois papéis no mesmo login, para não manter duas contas.

### Base privada: perfis gerenciados e vínculos

11. Como gerente, quero cadastrar um profissional que já uso informando nome e
    telefone, para tê-lo no meu acervo mesmo antes de ele entrar na plataforma.
12. Como gerente, quero que o telefone seja normalizado para formato
    internacional, para evitar cadastros duplicados por formatação diferente.
13. Como gerente, quero registrar as funções que esse profissional exerce na
    minha casa (ex.: garçom, chapeiro, segurança), para filtrar convocações
    depois.
14. Como gerente, quero anotar observações privadas sobre o profissional, para
    lembrar detalhes que só a minha equipe deve ver.
15. Como gerente, quero uma lista pesquisável do meu acervo por nome, telefone e
    função, para achar rápido quem preciso.
16. Como gerente, quero operar 100% com o perfil gerenciado — convocar, registrar
    presença, avaliar — antes de o profissional assumir o perfil, para não
    depender do aceite dele no dia a dia.
17. Como gerente, quero arquivar um vínculo sem apagar o histórico, para manter
    registro de quem já trabalhou comigo.
18. Como gerente, quero que minha nota privada nunca apareça para o profissional
    nem para outra empresa, para poder registrar avaliação franca.

### Convite e "assumir perfil"

19. Como gerente, quero enviar um convite para o profissional assumir o perfil,
    para que ele passe a manter os próprios dados.
20. Como gerente, quero reenviar o convite se ele não respondeu, gerando um novo
    link e invalidando o anterior, para insistir sem abrir brecha de segurança.
21. Como gerente, quero revogar um convite pendente, para cancelar quando não faz
    mais sentido.
22. Como profissional, quero receber o convite por e-mail (e por SMS quando
    disponível), para acessar de onde for mais fácil.
23. Como profissional, quero abrir o link do convite e verificar meu telefone por
    um código, para provar que aquele perfil é meu.
24. Como profissional, quero criar meu acesso ao aceitar o convite, para virar
    dono do meu perfil.
25. Como profissional, quero que, ao assumir o perfil, os dados pessoais e a
    disponibilidade passem a ser só meus, para ter controle do que a empresa vê
    e edita.
26. Como profissional cadastrado por várias empresas, quero que meus perfis
    convirjam num só quando eu assumo, para não ter identidade fragmentada.
27. Como profissional, quero que o histórico, as respostas a convocações e as
    avaliações das empresas sejam preservados na fusão, para não perder
    reputação nem registro.
28. Como suporte, quero inspecionar e, se preciso, reverter uma fusão de perfis,
    para corrigir engano sem perda de dados.
29. Como profissional, quero ser avisado, no primeiro contato, de que uma empresa
    criou um perfil com meus dados e de qual empresa foi, para exercer meus
    direitos se eu não concordar.

### Disponibilidade

30. Como profissional, quero declarar janelas recorrentes de disponibilidade por
    dia da semana e turno, para receber convocações compatíveis.
31. Como profissional, quero marcar "disponível agora" com expiração automática,
    para sinalizar interesse pontual sem esquecer ligado.
32. Como gerente com vínculo, quero ver a disponibilidade declarada do
    profissional, para convocar quem tende a topar.
33. Como profissional, quero poder responder a uma convocação mesmo fora da minha
    janela declarada, porque disponibilidade é filtro, não trava.

### Meus vínculos (profissional)

34. Como profissional, quero ver todas as empresas com quem tenho vínculo e o
    estado de cada uma, para saber quem pode me convocar.
35. Como profissional, quero aceitar ou recusar o vínculo de uma empresa que
    entrou depois que assumi o perfil, para controlar quem tem acesso a mim.
36. Como profissional, quero arquivar um vínculo ativo, para parar de receber
    convocações daquela empresa.
37. Como profissional, quero ver o que cada empresa enxerga do meu perfil (menos
    a nota privada), para transparência.

### Convocações

38. Como gerente, quero criar uma convocação direcionada escolhendo profissionais
    do meu acervo, para chamar nominalmente quem eu quero.
39. Como gerente, quero criar uma convocação aberta para uma função dentro de um
    raio, para achar reforço quando não tenho nome certo.
40. Como gerente, quero definir vagas por função, turno, local e a remuneração
    combinada (texto livre), para o profissional decidir com informação
    completa.
41. Como gerente, quero salvar a convocação como rascunho e publicar depois, para
    preparar com antecedência.
42. Como profissional, quero receber a convocação por push e por e-mail, para não
    depender de estar num grupo no momento certo.
43. Como profissional, quero aceitar ou recusar em poucos toques, para responder
    rápido pelo celular.
44. Como profissional, quero ver o detalhe completo antes de aceitar (função,
    horário, local, pagamento combinado), para não topar às cegas.
45. Como gerente, quero ver em tempo real quem aceitou, recusou ou ainda não
    respondeu, para saber se preciso chamar mais gente.
46. Como gerente, quero que as vagas parem de aceitar quando lotam, para não
    aparecer mais profissional do que preciso.
47. Como profissional, quero desistir de uma convocação que aceitei, avisando com
    a antecedência que a empresa configurar, para não deixar a empresa na mão sem
    registro.
48. Como gerente, quero cancelar uma convocação e avisar quem já tinha aceitado,
    para comunicar mudança de plano.
49. Como profissional, quero silenciar notificações de resumo e marketing, mas
    continuar recebendo convocação (transacional), para não perder trabalho.
50. Como gerente, quero saber quantos destinatários receberam a convocação em
    poucos minutos, para confiar no alcance.

### Presença, avaliação e histórico

51. Como gerente, quero marcar cada profissional de uma convocação como
    compareceu ou faltou, para ter registro de confiabilidade.
52. Como gerente, quero registrar uma avaliação interna (nota e comentário) sobre
    o profissional após o trabalho, para orientar convocações futuras.
53. Como gerente, quero que essa avaliação seja privada da minha empresa e
    invisível ao profissional, para poder ser honesto.
54. Como gerente, quero ver o histórico de um profissional na minha casa
    (convocações, presenças, faltas, avaliações), para decidir se chamo de novo.
55. Como profissional, quero ver meu próprio histórico de trabalhos por empresa,
    para acompanhar o que já fiz.

### Privacidade e direitos do titular (LGPD)

56. Como profissional, quero uma tela "meus dados" para exportar tudo o que a
    plataforma tem sobre mim, para portabilidade.
57. Como profissional, quero corrigir meus dados pessoais, para mantê-los certos.
58. Como profissional, quero revogar um consentimento que dei (ex.: visibilidade
    pública), para deixar de participar do tratamento.
59. Como profissional, quero solicitar a exclusão dos meus dados, para sair da
    plataforma.
60. Como profissional que pede exclusão, quero que meus dados pessoais sejam
    removidos e o histórico de trabalho reste apenas de forma pseudonimizada,
    para atender a necessidade legítima da empresa sem me expor.
61. Como titular, quero que cada pedido meu tenha prazo e trilha de atendimento,
    para acompanhar o andamento.
62. Como operador da plataforma, quero um job de retenção que anonimize convites
    não aceitos, perfis gerenciados parados e contas encerradas conforme os
    prazos definidos, para não guardar dado além do necessário.
63. Como operador, quero rodar o job de retenção em modo simulação com relatório
    antes de aplicar, para não anonimizar por engano.
64. Como titular, quero um canal de contato com o encarregado (DPO) publicado,
    para exercer meus direitos.
65. Como suporte, quero que todo acesso meu a dado pessoal fique auditado, para
    prestação de contas.

### Segurança e operação

66. Como operador, quero limites de taxa em login, envio de convite e verificação
    de código, para conter abuso.
67. Como operador, quero que tokens de convite e magic link sejam de uso único,
    expiráveis e não enumeráveis, para que não sejam adivinhados.
68. Como operador, quero logs estruturados, rastreio de erro e health check, para
    saber quando algo quebra.
69. Como operador, quero backup diário do banco e um procedimento de restore
    testado, para me recuperar de uma perda de dados.
70. Como operador, quero runbooks de deploy, rollback, restore, incidente e
    pedido de titular, para agir sob pressão sem improviso.
71. Como operador, quero um teste de carga do fluxo de convocação antes de abrir
    para usuários reais, para confiar no desempenho.

### Rede pública local (Etapa 2)

72. Como profissional, quero optar por visibilidade pública escolhendo quais
    funções, qual raio e quais campos aparecem, para controlar minha exposição.
73. Como profissional, quero revogar a visibilidade pública a qualquer momento,
    para sair da rede quando quiser.
74. Como profissional na rede pública, quero que meu endereço apareça só de forma
    aproximada (bairro) para empresas sem vínculo, para preservar minha
    privacidade.
75. Como gerente, quero buscar profissionais na rede pública por função, raio e
    disponibilidade, para achar reforço fora do meu acervo.
76. Como gerente, quero enviar uma proposta a um profissional da rede pública,
    para iniciar um vínculo.
77. Como profissional, quero aceitar ou recusar a proposta de uma empresa nova
    antes de qualquer acesso dela ao meu perfil, para consentir de forma ativa.
78. Como profissional, quero optar por exibir uma reputação pública agregada e
    anônima (ex.: média e número de avaliações), sem comentários individuais,
    para mostrar histórico sem me expor.
79. Como gerente, quero que a rede local por opt-in seja gratuita, para adotar o
    produto sem barreira antes de ele provar valor.
80. Como usuário, quero denunciar um perfil ou comportamento abusivo, para
    manter a rede confiável.
81. Como suporte, quero bloquear um usuário e remover um profissional da rede
    local, para responder a abuso.

### Mural de vagas nacional — Vaga e Candidatura (Etapa 3)

82. Como gerente, quero criar uma vaga com título, descrição, categoria
    profissional, tipo de vínculo (diária, temporário, PJ, CLT, estágio) e modo
    de local (presencial, híbrido, remoto), para descrever com precisão o que
    ofereço.
83. Como gerente, quero definir endereço e raio quando a vaga é presencial, para
    aparecer para quem está por perto.
84. Como gerente, quero salvar a vaga como rascunho e publicar depois, com um
    prazo de inscrição, para preparar com calma.
85. Como gerente, quero editar ou cancelar uma vaga publicada avisando quem já se
    candidatou, para comunicar mudança.
86. Como gerente no plano grátis, quero saber quantas vagas ativas ainda posso
    publicar, para entender meu limite.
87. Como gerente, quero destacar uma vaga pagando por um período, para ganhar
    visibilidade acima do meu teto de plano.
88. Como profissional, quero buscar vagas por categoria, tipo de vínculo, modo de
    local, cidade/estado e raio, para achar o que serve para mim.
89. Como profissional, quero me candidatar a uma vaga com uma mensagem e anexos
    (ex.: currículo), para me apresentar.
90. Como profissional, quero que candidatar-me exija ter assumido meu perfil,
    para que a empresa fale com uma pessoa real e responsável pelos dados.
91. Como profissional, quero acompanhar o estado de cada candidatura (recebida,
    em análise, selecionada, com oferta, aceita, recusada), para saber onde
    estou.
92. Como profissional, quero retirar uma candidatura enquanto ela não virou
    oferta aceita, para desistir sem ruído.
93. Como gerente, quero ver as candidaturas de uma vaga e movê-las pelos estados
    de triagem, para conduzir o processo.
94. Como gerente, quero fazer uma oferta a um candidato selecionado, para
    formalizar o convite.
95. Como profissional, quero aceitar ou recusar a oferta, para decidir.
96. Como gerente, quero que aceitar um candidato crie um vínculo de trabalho
    pendente de consentimento dele, para que ele entre na minha base sem eu
    reCadastrar.
97. Como profissional, quero confirmar ou recusar esse vínculo, para controlar
    quem entra na minha base privada.
98. Como gerente, quero que a vaga marque como preenchida quando as posições
    esgotam, para parar de receber candidatura.
99. Como profissional, quero receber notificação quando o estado da minha
    candidatura muda, para não precisar ficar conferindo.
100. Como gerente, quero receber notificação quando chega uma candidatura nova,
     para agir rápido.
101. Como titular, quero que meu currículo e minha carta de candidatura tenham
     prazo de retenção e possam ser apagados a meu pedido, para não deixar dado
     meu espalhado.
102. Como operador, quero liberar e cobrar plano e destaque de forma manual no
     início da Etapa 3, para validar disposição a pagar antes de integrar um
     provedor de pagamento.
103. Como operador, quero que nenhuma função das Etapas 1 e 2 passe a exigir
     plano pago, para não quebrar a isca de adoção.
104. Como suporte, quero remover uma vaga abusiva ou enganosa e notificar a
     empresa, para manter o mural confiável.

---

## Implementation Decisions

### Arquitetura e stack (ADR-0001)

- Aplicação única Next.js (App Router), TypeScript estrito, servindo web para
  empresa e PWA mobile-first para profissional no mesmo deploy.
- PostgreSQL único (sem réplica, sem sharding no piloto). Prisma para schema e
  migração. Hospedagem Vercel + Postgres gerenciado (Neon/Supabase).
- Sem microserviços. Trabalho assíncrono via tabela `OutboxMessage` + worker
  invocável como função.
- Alvo de escala de 12 meses: ~100 empresas / ~3.000 profissionais.

### Camada de casos de uso (seam primária)

- Toda regra de negócio vive em funções de caso de uso (ex.:
  `registerManagedProfessional`, `sendInvite`, `claimProfile`, `mergeProfiles`,
  `createCallOut`, `respondToCallOut`, `recordAttendance`, `submitInternalRating`,
  `runRetention`).
- Cada caso de uso recebe um contexto transacional e o ator
  (`actorUserId` + `actingAs`: `companyId` ou `professionalProfileId`) e retorna
  resultado ou erro tipado. Sem lógica de negócio em componentes/rotas.
- A UI é fina: server components e forms que apenas fiam casos de uso.
- Módulo `src/domain` puro contém as tabelas de transição das máquinas de estado
  e as checagens de invariante, sem I/O.

### Identidade e tenancy (ADR-0002)

- `User` (autenticação) é separado de `CompanyMembership` e de
  `ProfessionalProfile`. Papel vive no vínculo.
- `CompanyMembership { userId, companyId, role: OWNER | MANAGER }`, único por
  (`userId`, `companyId`). Criador da empresa vira `OWNER`.
- `User` tem N `CompanyMembership` e no máximo 1 `ProfessionalProfile` não
  `MERGED`.
- Autenticação: empresa por senha (hash Argon2/bcrypt) + magic link opcional;
  profissional por magic link. Verificação de e-mail obrigatória.
- Contexto "agindo como empresa X" é estado de sessão; nenhuma rota confia em
  `companyId` vindo do cliente. Acesso fora do membership → 403 + `AuditLog`.

### Perfil gerenciado e claim (ADR-0003)

- Estados de `ProfessionalProfile`: `MANAGED → INVITED → CLAIMED`; qualquer
  estado `→ ANONYMIZED`; duplicado `→ MERGED`.

  Máquina de estados (proveniente da modelagem de domínio):

  ```
  MANAGED    --enviar convite-->        INVITED
  INVITED    --reenviar-->              INVITED   (novo token; antigo revogado)
  INVITED    --revogar-->               MANAGED
  INVITED    --aceitar (OTP ok)-->      CLAIMED   (ownerUserId preenchido)
  qualquer   --retencao/pedido-->       ANONYMIZED
  duplicado  --merge-->                 MERGED    (redireciona leituras p/ canônico)
  ```

- `Invite { professionalProfileId, companyId, token, channel, state, expiresAt }`.
  Token de uso único, alta entropia, não enumerável. Validade **60 dias**
  (⚠️ D1). Estados: `PENDING → ACCEPTED | EXPIRED | REVOKED`.
- Claim: valida token → envia e valida OTP no telefone do perfil (uso único,
  expira ~10 min, tentativas limitadas) → cria/vincula `User` → `CLAIMED` +
  `ownerUserId` → dispara dedupe/merge → transfere edição de dados pessoais e
  `Availability` ao profissional. Tudo numa transação.
- Dedupe por telefone verificado em E.164. Criar perfil gerenciado com telefone
  já existente **não** cria duplicado: adiciona `WorkRelationship` da nova
  empresa (`PENDING_CONSENT` se o perfil já é `CLAIMED`). Merge move
  `WorkRelationship`, `CallOutResponse`, `InternalRating` para o canônico e marca
  o duplicado `MERGED`; auditado; reversível por suporte.
- `ProfessionalProfile` guarda `createdByCompanyId`, `sourceNote?`,
  `firstContactedAt?` para transparência e para o aviso de tratamento ao titular.

### Vínculo de trabalho e avaliação

- `WorkRelationship { companyId, professionalProfileId, state, roles[],
  privateNote? }`, único por (`companyId`, `professionalProfileId`). Estados:
  `ACTIVE`, `PENDING_CONSENT`, `ARCHIVED`.
- Empresa edita `roles` e `privateNote` em qualquer estado do perfil; após o
  claim **não** edita dados pessoais nem disponibilidade.
- `InternalRating` exige `WorkRelationship`; na Etapa 1 nunca é legível pelo
  profissional nem por outra empresa.

### Disponibilidade

- `Availability`: janelas `{ weekday, shift: MORNING | AFTERNOON | NIGHT }` +
  flag `availableNow` com expiração automática. Só o dono edita. Visível a
  empresa com vínculo; na rede pública só com opt-in. É filtro de convocação
  aberta, não bloqueio.

### Convocação (`CallOut`)

- Objeto único com modo `TARGETED` (destinatários escolhidos) ou `OPEN` (por
  função + raio). Campos: vagas por função (`CallOutSlot { role, quantity }`),
  turno, local, remuneração (texto livre na Etapa 1 — ⚠️ D5), observações.
- Estados `CallOut`: `DRAFT → OPEN → FILLED → CLOSED | CANCELLED`. Só vai a
  `OPEN` com ≥1 slot e turno no futuro.
- `CallOutResponse`: `OFFERED → ACCEPTED → COMPLETED`; ramos `DECLINED`,
  `WITHDRAWN`, `NO_SHOW`. Soma de `ACCEPTED` por slot ≤ `quantity` (constraint +
  checagem transacional contra corrida).
- Elegibilidade da convocação aberta: função compatível, dentro do raio
  (ADR-0006), com `WorkRelationship` ativo na Etapa 1.

### Notificação (ADR-0004)

- Interface única `Notifier`; canais Etapa 1: push da PWA (Web Push/VAPID) +
  e-mail transacional (⚠️ D4). SMS e WhatsApp Business API plugáveis sem mudar
  regra de negócio.
- Entrega assíncrona: a transação de negócio grava a intenção em `OutboxMessage`;
  o worker despacha com backoff e idempotência por `dedupeKey`. Nenhum envio
  dentro do request do usuário.
- `NotificationLog` registra por canal: enviado, entregue, falhou, aberto.
  Categorias; `callout` é transacional (sem opt-out), `digest`/`marketing` têm
  opt-out.

### Geografia (ADR-0006, emendado por ADR-0007)

- `Address` (empresa) e `ProfessionalProfile` guardam `latitude`/`longitude` +
  `geocodedAt`. Geocodificação por provedor externo no cadastro, com cache;
  nunca em tempo de consulta. Raio default 20 km, ajustável.
- Raio é **um filtro** entre cidade, estado, raio (só presencial) e remoto — não
  a fronteira do produto. O modelo suporta alcance nacional desde a Etapa 1.
- Etapa 1: `cube` + `earthdistance` com índice GiST. Migração para PostGIS
  (`geography`, `ST_DWithin`) e/ou índice de texto dedicado só se o volume
  nacional da Etapa 3 exigir (D11).
- Endereço exibido de forma aproximada (bairro) para empresas sem vínculo e em
  vagas públicas.

### LGPD (ADR-0005 — ⚠️ pendente de confirmação D1/D2)

- Plataforma é operadora quanto à base privada da empresa; controladora quanto a
  conta, autenticação, telemetria e rede pública.
- `Consent` append-only (tipo, versão do texto, timestamp, origem, estado);
  revogação é novo registro. `DataSubjectRequest` com tipo, estado e prazo.
- Visibilidade pública e reputação pública exigem consentimento específico,
  destacado e revogável.
- Exclusão → estado `ANONYMIZED`: remove nome, telefone, e-mail, foto; mantém
  registro de trabalho pseudonimizado.
- Job diário de retenção com dry-run e relatório. Prazos propostos: convite não
  aceito 60 dias; perfil gerenciado parado 180 dias; histórico de convocação
  5 anos; logs de auditoria 2 anos; conta encerrada anonimizada em 30 dias.

### Vaga pública e candidatura (ADR-0007 — Etapa 3)

- `JobPosting { companyId, title, description, categoryId, tipoDeVinculo:
  DIARIA | TEMPORARIO | PJ | CLT | ESTAGIO, modoDeLocal: PRESENCIAL | HIBRIDO |
  REMOTO, address?, radiusKm?, compensationText, positions, applicationDeadline,
  featuredUntil? }`.
- Estados `JobPosting`: `DRAFT → PUBLISHED → CLOSED | CANCELLED | FILLED`. Só vai
  a `PUBLISHED` com categoria, tipo de vínculo, modo de local e prazo futuro;
  publicação sujeita ao teto do plano (ADR-0008). `FILLED` quando `positions`
  candidaturas chegam a `ACCEPTED`.
- `Application { jobPostingId, professionalProfileId, coverMessage?,
  attachments[] }`. Estados (da modelagem de domínio):

  ```
  SUBMITTED    --empresa abre-->         UNDER_REVIEW
  UNDER_REVIEW --empresa seleciona-->    SHORTLISTED
  SHORTLISTED  --empresa oferta-->       OFFERED
  OFFERED      --profissional aceita-->  ACCEPTED
  OFFERED      --profissional recusa-->  WITHDRAWN
  (< OFFERED)  --profissional retira-->  WITHDRAWN
  qualquer     --empresa descarta-->     REJECTED
  ```

- Invariantes: uma `Application` por (`jobPostingId`, `professionalProfileId`);
  candidatar-se exige `ProfessionalProfile` em `CLAIMED`; `ACCEPTED` só enquanto
  a vaga não está `FILLED`/`CLOSED`/`CANCELLED` (constraint + checagem
  transacional contra corrida).
- `Application` `ACCEPTED` cria `WorkRelationship` `PENDING_CONSENT` — mesmo
  mecanismo do vínculo pós-claim; realimenta a base privada.
- Casos de uso novos: `publishJobPosting`, `applyToJobPosting`,
  `screenApplication`, `makeOffer`, `respondToOffer`.
- Notificação (ADR-0004) ganha categorias transacionais `application_received`
  (empresa) e `application_status` (profissional), via outbox.

### Auditoria

- `AuditLog { actorUserId, actingAs, action, targetType, targetId, before, after,
  createdAt }`, append-only. Registra claim, merge, avaliação, acesso de
  suporte, mudança de consentimento, negativa de autorização, triagem de
  candidatura, publicação/remoção de vaga.

### Monetização (ADR-0008)

- Base privada, convocação e rede local por opt-in são **sempre gratuitas**.
  Profissional nunca paga; candidatura é gratuita.
- Receita entra na Etapa 3: `CompanyPlan` (`FREE` com teto de vagas `PUBLISHED`
  simultâneas; pago mensal com teto maior) + `FeaturedListing` (destaque pago por
  período). Billing manual no início da Etapa 3.
- Trava de regressão: nenhuma função das Etapas 1–2 pode passar a exigir plano
  pago. Valor de N no free e preços são **D10**, pendente.

### Faseamento e "Definition of Done"

Entrega em fases: **F0 fundação → F1a base privada → F1b convocações → F1c
endurecimento LGPD/operação → F2 rede local por opt-in → F3 mural de vagas
nacional (Vaga/Candidatura, `CompanyPlan`, destaque, moderação de vaga)**.
F3 só abre com densidade de perfis `CLAIMED` no piloto e herda os usuários já
formados. Detalhe das fatias verticais e das arestas de bloqueio em
`.scratch/rede-freelancers/map.md` e nos tickets.

Nenhuma fase é concluída porque a interface funciona. Cada fase fecha só quando
cumpre a grelha, nas sete dimensões:

- **Negócio** — cada história com critério de aceite verificável, validada com
  ao menos um usuário-piloto (a partir de F1a); métrica de sucesso da fase
  instrumentada; caminhos de erro e vazio desenhados.
- **Segurança** — AuthN/AuthZ testados; sem identificador confiável do cliente;
  rate limiting em login/convite/OTP; tokens de uso único, expiráveis, não
  enumeráveis; dependências sem CVE crítico; revisão registrada (OWASP ASVS L1 a
  partir de F1c).
- **Privacidade** — todo tratamento novo mapeado a uma base legal; dado mínimo;
  `Consent` append-only; direitos do titular operantes (a partir de F1c);
  retenção configurada e testada em dry-run; acesso de suporte auditado.
- **Integridade de dados** — invariantes cobertas por constraint (preferência)
  ou teste; migrações reversíveis e testadas em CI; operações multi-entidade
  transacionais e idempotentes; outbox sem perda nem duplicação.
- **Testes** — ver seção Testing Decisions.
- **Desempenho** — p95 de API ≤ 400 ms na escala-alvo; consultas por raio
  indexadas; sem N+1 nas listas; convocação despachada a todos os destinatários
  em ≤ 60 s (p95); PWA FCP ≤ 2,5 s em 4G e leitura offline de convocações já
  recebidas; teste de carga do fluxo de convocação antes de F1c.
- **Documentação** — ADR novo/atualizado por decisão estrutural; `CONTEXT.md`
  atualizado a cada termo novo; README de setup do zero; runbooks (deploy,
  rollback, restore, incidente, pedido de titular a partir de F1c); checklist da
  grelha arquivado em `.scratch/rede-freelancers/`.

### Decisões abertas que travam fases

| # | Decisão | Recomendação | Trava |
| --- | --- | --- | --- |
| D1 | Bases legais LGPD e prazos de retenção (escopo agora nacional; inclui currículo/carta de candidatura) | Legítimo interesse p/ perfil gerenciado; consentimento p/ visibilidade pública e p/ anexo de candidatura; convite 60 dias; anexo 12 meses | F1c / F3 |
| D2 | Encarregado (DPO) + revisão jurídica de Termos/Política | Contratar revisão antes do go-live | F1c |
| D3 | Cidade do piloto | **Resolvido: Colatina, ES** | — |
| D4 | Provedores de e-mail, push e OTP | Transacional (Resend/Postmark) + Web Push VAPID; OTP por e-mail se SMS atrasar | F0 |
| D5 | Remuneração livre vs estruturada | Texto livre na F1, estruturada depois | F1b / F3 |
| D6 | Matching da rede local | Filtro função + raio + disponibilidade, sem score | F2 |
| D7 | Reputação pública na F2 | Agregada e anônima, só com opt-in | F2 |
| D8 | App nativo | Só se push iOS ou offline pesado virarem requisito duro | pós-F3 |
| D9 | Wedge de aquisição do mural nacional além da herança do piloto | Herança do piloto + parceria com sindicatos/associações locais na expansão cidade a cidade | F3 |
| D10 | Preços: valor de N no plano `FREE`, mensalidade, preço e duração do destaque | Definir antes de cobrar; billing manual valida antes | F3 |
| D11 | Infraestrutura de busca de vagas dedicada (PostGIS / índice de texto / worker) | Adiar até haver dado de carga real | F3 |

---

## Testing Decisions

### O que é um bom teste aqui

- Testa comportamento externo observável de um caso de uso — dado um estado do
  banco e um ator, qual o resultado, o novo estado e os efeitos (outbox,
  auditoria) —, nunca detalhe de implementação.
- Não acopla a nomes de função privada, estrutura de query ou forma de módulo
  interno. Reescrever o interior sem mudar o comportamento não quebra o teste.
- Um teste por regra, com nome que descreve a regra na linguagem do glossário.

### Seams

1. **Camada de casos de uso sobre Postgres real (seam primária).** Os testes de
   integração chamam as funções de caso de uso contra um Postgres descartável
   (schema por teste ou testcontainer). Cobrem: schema e constraints (as
   invariantes de integridade do `CONTEXT.md`), máquinas de estado, transações e
   idempotência (claim, merge, preenchimento de vaga e de candidatura), e
   autorização multi-tenant (todo caso de uso rejeita `companyId` fora do
   membership e gera `AuditLog`).
2. **Worker de outbox (seam secundária, mesmo processo).** Inserir
   `OutboxMessage`, rodar um tick (`processOutboxOnce`), verificar
   `NotificationLog`, retry de falha transitória, dedupe por `dedupeKey`, e
   mensagem venenosa indo para `DEAD` após N tentativas.
3. **Smoke Playwright.** Um caminho feliz por fatia vertical, contra o app
   rodando — só fiação ponta a ponta, sem exercitar regra de negócio.
4. **Funções puras (sub-nível do módulo de domínio, não seam de codebase).**
   Tabelas de transição das máquinas de estado e checagens de invariante testadas
   como funções sem I/O.

### Módulos testados

- Casos de uso: identidade/tenancy, perfil gerenciado, convite, claim,
  dedupe/merge, disponibilidade, vínculos, convocação (direcionada e aberta),
  resposta a convocação, presença, avaliação interna, retenção, direitos do
  titular, visibilidade pública, busca na rede, moderação.
- Casos de uso da Etapa 3: publicação de vaga (com gate de plano), candidatura
  (com exigência de perfil `CLAIMED`), triagem, oferta, resposta à oferta,
  criação de vínculo a partir de candidatura aceita, destaque, moderação de vaga.
- Worker de outbox e camada `Notifier` (com provedores mockados na fronteira
  externa).
- Módulo de domínio puro (máquinas de estado — incluindo `JobPosting` e
  `Application` —, invariantes, cálculo de elegibilidade por raio).

### Casos de borda obrigatórios

- Concorrência no preenchimento de vaga (duas aceitações simultâneas no último
  lugar).
- Claim concorrente do mesmo perfil resolve para um único dono.
- Convite expirado ou revogado não permite claim.
- Telefone duplicado entre empresas converge no claim sem registro órfão
  (contagens antes/depois conferem).
- Revogação de consentimento de visibilidade pública remove o perfil da busca na
  hora.
- `availableNow` expira sozinho.
- Empresa sem vínculo não lê disponibilidade nem nota privada nem endereço exato.
- Concorrência na aceitação de candidaturas: aceitar além de `positions` é
  bloqueado; a vaga vai a `FILLED` no momento certo.
- Perfil gerenciado (não `CLAIMED`) não consegue se candidatar.
- Publicação de vaga além do teto do plano `FREE` é bloqueada; publicar não pode
  ser destravado por nenhuma feature das Etapas 1–2.
- Pedido de exclusão do titular remove currículo e carta de candidaturas
  anteriores dentro do prazo.

### Prior art

Nenhuma — é o primeiro código do repositório. Estes padrões (casos de uso
testados contra Postgres real, worker testado por tick, smoke Playwright por
fatia) tornam-se a referência para tickets futuros.

### Portões de CI

- `lint`, `typecheck`, `test`, `migrate` (em banco limpo) verdes obrigatórios
  para merge.
- Cobertura das regras de domínio ≥ 80%.
- Migração destrutiva exige plano explícito no ticket.

---

## Out of Scope

- Processamento de pagamento entre empresa e profissional — a plataforma só
  registra o combinado (texto livre na Etapa 1), para qualquer `tipoDeVinculo`.
- Folha de pagamento, eSocial, emissão de contrato ou qualquer gestão de vínculo
  trabalhista formal, inclusive para vagas CLT/efetivo — a plataforma divulga e
  conecta, não formaliza.
- Verificação de antecedentes, validação documental e verificação de conselho de
  classe (OAB, CREA, CRM) — não priorizadas no piloto; possíveis por categoria
  quando a categoria for ativada.
- Login por OTP de SMS/WhatsApp como fator primário (na Etapa 1 o OTP serve só à
  verificação de telefone no claim).
- Integração com a WhatsApp Business API (canal plugável, decisão revisada após o
  piloto).
- Aplicativo nativo iOS/Android (D8).
- **Lançamento nacional imediato** — o modelo de dados é nacional desde já, mas o
  mural (Etapa 3) só abre depois de densidade no piloto; Etapas 1–2 ficam
  restritas a Colatina, ES.
- Ranking algorítmico / score de matching de candidatos ou de profissionais —
  busca é por filtros (D6/D11).
- Exibição de comentários individuais de avaliação na rede pública — só métrica
  agregada e anônima, com opt-in (D7).
- Internacionalização — UI só em pt-BR, com textos centralizados para i18n
  futura.
- Billing automatizado — plano e destaque podem ser liberados e cobrados
  manualmente no início da Etapa 3 (D10).
- Comissão sobre contratação, cobrança por candidatura ou plano pago para o
  profissional — rejeitados (ADR-0008).

---

## Further Notes

- **Origem das decisões:** entrevista de grilling (Rodadas 1–2), pivô de escopo
  (rodada de reencaixe, todas as recomendações aceitas) e modelagem de domínio em
  `/CONTEXT.md` e nos ADRs 0001–0008. As máquinas de estado inline vieram dessa
  modelagem.
- **O pivô:** o produto passou de "plataforma local que substitui grupos de
  WhatsApp" para "isso **mais** um mural de vagas nacional para qualquer
  categoria profissional". Tratado como **expansão faseada**, não substituição:
  base privada e convocação continuam sendo o núcleo e o motor de aquisição; o
  mural (Etapa 3) é construído por cima e herda os usuários do piloto.
- **Marcadores ⚠️ / decisões abertas:** D1, D2, D4–D11 seguem pendentes. D3
  (cidade) está resolvido — Colatina, ES. Mais urgentes para começar: D4
  (provedores, trava F0). D9–D11 só travam a F3.
- **Métricas do piloto (Etapas 1–2):** tempo entre `OPEN` e vaga preenchida;
  taxa de alcance da notificação; proporção de perfis gerenciados que viram
  `CLAIMED`; nº de convocações por empresa por semana.
- **Métricas do mural (Etapa 3):** vagas publicadas por semana; candidaturas por
  vaga; tempo até a primeira triagem; conversão de candidatura aceita em vínculo
  confirmado.
- **Sequência de tickets e arestas de bloqueio:** ver
  `.scratch/rede-freelancers/map.md` e os arquivos em
  `.scratch/rede-freelancers/issues/`. Os tickets de F3 (Vaga/Candidatura,
  `CompanyPlan`, destaque, moderação de vaga) ainda não foram detalhados.
- **Wide refactors previstos:** eventual migração de `earthdistance` para PostGIS
  e/ou adoção de índice de texto dedicado para a busca de vagas nacional
  (expand–contract). Não é fatia vertical. Só quando houver dado de carga (D11).
- **Risco central:** densidade. O piloto concentra em Colatina e usa a Etapa 1
  para gerar base antes de abrir a Etapa 2 e, só depois, a Etapa 3. Abrir o mural
  nacional sem massa de perfis `CLAIMED` recria o problema de partida a frio dos
  dois lados que o faseamento existe para evitar.
