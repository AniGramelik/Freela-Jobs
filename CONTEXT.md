# CONTEXT — Freela Jobs

Plataforma que dá a pequenos negócios e profissionais uma forma estruturada,
rápida, pesquisável e segura de organizar e encontrar trabalho — do reforço
pontual de equipe à vaga temporária ou efetiva.

Construída de dentro para fora, em três etapas:

1. **Base privada** — cada empresa organiza seus próprios freelancers.
2. **Rede local por opt-in** — profissionais autorizam visibilidade e viram
   pesquisáveis por outras empresas próximas.
3. **Mural de vagas nacional** — empresas publicam vagas abertas; qualquer
   profissional se candidata.

Contexto único (single-context repo). Decisões de arquitetura em `docs/adr/`.
Especificação viva e issues em `.scratch/rede-freelancers/`.

## Glossário

Use estes termos exatamente. Não derive para sinônimos.

### Atores e identidade

| Termo | Definição |
| --- | --- |
| **Empresa** (`Company`) | Negócio que organiza e contrata mão de obra. Unidade de tenancy. |
| **Membro** (`CompanyMembership`) | Vínculo entre um `User` e uma `Company`, com papel (`OWNER`, `MANAGER`). Um usuário pode ser membro de várias empresas. |
| **Profissional** (`ProfessionalProfile`) | Pessoa que presta serviço. Existe mesmo sem `User` associado (perfil gerenciado). Após o *claim*, passa a ter um `User` dono. Qualquer categoria profissional, das operacionais às reguladas. |
| **Categoria profissional** (`ProfessionalCategory`) | Classificação extensível de tipo de trabalho (ex.: garçom, segurança, advogado, contador). Cada categoria pode exigir campos e verificação próprios. O piloto ativa categorias operacionais/eventuais; reguladas entram depois. |
| **Perfil gerenciado** | `ProfessionalProfile` criado por uma empresa, ainda sem dono, estado `MANAGED`. A empresa opera 100% (convoca, registra presença, avalia). |
| **Assumir perfil / Claim** | Ato do profissional de aceitar um `Invite`, criar seu `User` e tornar-se dono do próprio perfil. Depois disso a empresa edita **apenas** campos do `WorkRelationship`. |
| **Vínculo de trabalho** (`WorkRelationship`) | Relação entre uma `Company` e um `ProfessionalProfile`: funções internas, notas privadas, histórico, avaliações internas daquela casa. |
| **Suporte** (`SUPPORT`) | Papel interno de moderação, LGPD e conta. Todo acesso a dado pessoal é auditado. |

### Fluxo 1 — Convocação (base privada / rede local)

| Termo | Definição |
| --- | --- |
| **Convite** (`Invite`) | Token enviado a um profissional para assumir o perfil. Tem validade e estado. |
| **Convocação** (`CallOut`) | Pedido de reforço a partir de gente **conhecida**. Modo `TARGETED` (destinatários escolhidos) ou `OPEN` (aberto a um grupo por função/raio **dentro da base**). Contém vagas por função, turno, local e remuneração combinada (texto livre na Etapa 1). |
| **Vaga da convocação** (`CallOutSlot`) | Item de uma convocação: função + quantidade. Preenchida por `CallOutResponse` aceitas. |
| **Resposta** (`CallOutResponse`) | Manifestação de um profissional a uma convocação: `OFFERED`, `ACCEPTED`, `DECLINED`, `WITHDRAWN`, `NO_SHOW`, `COMPLETED`. |
| **Disponibilidade** (`Availability`) | Janelas recorrentes (dia da semana + turno) e/ou status "disponível agora" declarados pelo profissional. Só o profissional edita. |
| **Avaliação interna** (`InternalRating`) | Nota + comentário de uma empresa sobre um vínculo. Privada da empresa autora na Etapa 1. O profissional não vê. |
| **Rede local** | Conjunto de profissionais que deram *opt-in* de visibilidade. Pesquisável por empresas próximas fora do próprio vínculo. Etapa 2. |
| **Visibilidade pública** (`PublicListing`) | Opt-in do profissional para a rede local: quais funções, qual raio, quais dados aparecem. Revogável. |
| **Reputação pública** | Métrica agregada e anônima (ex.: "4,7 em 12 avaliações") exibida na rede local **somente** com opt-in. Nunca expõe comentários individuais. |

### Fluxo 2 — Vaga pública e candidatura (mural nacional, Etapa 3)

| Termo | Definição |
| --- | --- |
| **Vaga** (`JobPosting`) | Publicação **aberta a estranhos**. Campos: título, descrição, `ProfessionalCategory`, `tipoDeVínculo`, `modoDeLocal`, endereço/raio quando presencial, faixa de remuneração (texto livre na Etapa 1), quantidade de posições, prazo de inscrição. Estados: `DRAFT → PUBLISHED → CLOSED | CANCELLED | FILLED`. |
| **Tipo de vínculo** (`tipoDeVínculo`) | `DIARIA`, `TEMPORARIO`, `PJ`, `CLT`, `ESTAGIO`. Declarado por vaga. A plataforma divulga e conecta; não gerencia o contrato. |
| **Modo de local** (`modoDeLocal`) | `PRESENCIAL` (com endereço + raio), `HIBRIDO`, `REMOTO`. |
| **Candidatura** (`Application`) | Manifestação de um profissional a uma `JobPosting`: mensagem, anexos (ex.: currículo). Estados: `SUBMITTED → UNDER_REVIEW → SHORTLISTED → OFFERED → ACCEPTED | REJECTED | WITHDRAWN`. |
| **Triagem** | Ato da empresa de mover candidaturas pelos estados. Uma `Application` `ACCEPTED` pode gerar um `WorkRelationship` `PENDING_CONSENT`, realimentando a base privada. |
| **Destaque / Impulsionamento** (`FeaturedListing`) | Posição paga de uma `JobPosting` acima do teto do plano. Ver monetização. |
| **Plano da empresa** (`CompanyPlan`) | `FREE` (teto de vagas ativas) ou pago (mensal). Base privada, convocação e rede local não dependem de plano. |

### Transversais

| Termo | Definição |
| --- | --- |
| **Raio** | Distância em km sobre lat/long, usada como **filtro** (não como fronteira do produto) para convocação `OPEN` e para vaga `PRESENCIAL`. Default 20 km, ajustável. |
| **Piloto** | Lançamento inicial restrito a Colatina, ES, para densidade. As Etapas 1 e 2 rodam no piloto; a Etapa 3 abre nacional. |
| **Consentimento** (`Consent`) | Registro append-only de base legal por tratamento (tipo, versão do texto, timestamp, origem, estado). Revogação é novo registro. |

## Papéis de acesso

- `OWNER` / `MANAGER`: agem em nome de uma `Company`.
- `PROFESSIONAL`: dono de um `ProfessionalProfile` após o claim.
- Um mesmo `User` pode acumular papéis (ser `OWNER` de uma empresa e
  `PROFESSIONAL`).
- `SUPPORT` (interno): acesso administrativo para suporte e moderação. Auditado.

## Invariantes de integridade

1. `CompanyMembership` único por (`userId`, `companyId`).
2. `ProfessionalProfile.ownerUserId` só é preenchido no estado `CLAIMED`.
3. Um `User` tem no máximo 1 `ProfessionalProfile` não `MERGED`.
4. Soma de `CallOutResponse` `ACCEPTED` por `CallOutSlot` ≤ `quantity`.
5. `CallOut` só vai a `OPEN` com ≥ 1 slot e turno no futuro.
6. `InternalRating` exige `WorkRelationship`; na Etapa 1 nunca é legível pelo
   profissional.
7. Telefone canônico em E.164; dedupe por telefone **verificado**.
8. Toda escrita de dado de empresa é escopada por `companyId` da sessão.
9. Todo acesso de `SUPPORT` a dado pessoal gera `AuditLog`.
10. `Consent` é append-only (revogação é novo registro, não update).
11. Uma `Application` por (`jobPostingId`, `professionalProfileId`).
12. Candidatar-se exige `ProfessionalProfile` em estado `CLAIMED`.
13. Soma de `Application` `ACCEPTED` por `JobPosting` ≤ `positions`; ao atingir,
    a vaga vai a `FILLED`.
14. `JobPosting` só vai a `PUBLISHED` com categoria, `tipoDeVínculo`,
    `modoDeLocal` e prazo futuro, e dentro do teto do `CompanyPlan`.
15. Nenhuma função das Etapas 1–2 pode exigir `CompanyPlan` pago.

## Fronteiras

- **Não** processa pagamento entre empresa e profissional (só registra o
  combinado).
- **Não** é folha de pagamento, eSocial nem gestão de contrato de trabalho, para
  nenhum `tipoDeVínculo`.
- **Não** faz verificação de antecedentes, validação de documento nem verificação
  de conselho de classe no piloto.
- **Não** faz ranking algorítmico de candidatos nem de profissionais — busca é
  por filtros.
- "Local" é filtro, não limite: o modelo de dados suporta alcance nacional desde
  o início; o **lançamento** é que é faseado.
