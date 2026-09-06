# ADR-0007 — Mural de vagas nacional: faseamento e modelo Vaga/Candidatura

- Status: aceito
- Data: 2026-09-06
- Emenda: ADR-0006 (raio vira filtro, não fronteira)

## Contexto

O produto passou a ter, além da base privada de freelancers e da rede local, um
**mural de vagas nacional**: empresa e profissional criam contas, a empresa
divulga vagas e trabalhos (diária, temporário, PJ, CLT, estágio) e qualquer
profissional — do garçom ao advogado — se candidata. Alcance: todo o Brasil.

Um mural horizontal nacional tem partida a frio dos dois lados e concorre com
agregadores estabelecidos (Catho, Indeed, GupY, Vagas.com). O diferencial do
produto — base privada e convocação a partir de gente conhecida — só se constrói
localmente.

## Decisão

### Faseamento (não é pivô; é expansão faseada)

- **Etapa 1 — base privada** e **Etapa 2 — rede local por opt-in** rodam no
  piloto (Colatina, ES). Sem mudança em relação aos ADRs 0002–0006.
- **Etapa 3 — mural de vagas nacional** só abre depois de haver densidade de
  perfis `CLAIMED` no piloto. O mural **herda** os usuários já formados (empresas
  onboardadas, profissionais que assumiram o perfil) como oferta e demanda
  iniciais — é assim que se evita o cold start, não com uma campanha de captação
  em massa.
- O modelo de dados já contempla alcance nacional desde a Etapa 1: nada de
  migração de "cidade única" para "nacional".

### Dois fluxos coexistindo

| | Convocação (`CallOut`) | Vaga pública (`JobPosting`) |
| --- | --- | --- |
| Destinatário | gente da base privada da empresa | qualquer profissional |
| Iniciativa da conexão | empresa chama, profissional aceita | profissional se candidata, empresa tria |
| Preenchimento | por aceite, limitado por `CallOutSlot.quantity` | por decisão da empresa na triagem |
| Etapa | 1–2 | 3 |
| Objeto de resposta | `CallOutResponse` | `Application` |

Convocação **não** é substituída. `JobPosting` + `Application` entram como
objetos de primeira classe ao lado dela.

### `JobPosting`

- Campos: `title`, `description`, `categoryId` (`ProfessionalCategory`),
  `tipoDeVinculo` (`DIARIA | TEMPORARIO | PJ | CLT | ESTAGIO`),
  `modoDeLocal` (`PRESENCIAL | HIBRIDO | REMOTO`), `address?` + `radiusKm?`
  quando presencial, `compensationText` (texto livre na Etapa 1, ver D5),
  `positions` (quantidade), `applicationDeadline`, `featuredUntil?`.
- Estados: `DRAFT → PUBLISHED → CLOSED | CANCELLED | FILLED`.
  Só vai a `PUBLISHED` com categoria, tipo de vínculo, modo de local e prazo
  futuro. `FILLED` quando `positions` candidaturas chegam a `ACCEPTED`.
- Publicação sujeita ao plano da empresa (ADR-0008): teto de vagas `PUBLISHED`
  simultâneas no plano `FREE`.

### `Application`

- Campos: `jobPostingId`, `professionalProfileId`, `coverMessage?`,
  `attachments[]` (ex.: currículo), estado, timestamps de transição.
- Estados (proveniente da modelagem de domínio):

  ```
  SUBMITTED    --empresa abre-->        UNDER_REVIEW
  UNDER_REVIEW --empresa seleciona-->   SHORTLISTED
  SHORTLISTED  --empresa oferta-->      OFFERED
  OFFERED      --profissional aceita--> ACCEPTED
  OFFERED      --profissional recusa--> WITHDRAWN
  qualquer     --empresa descarta-->    REJECTED
  qualquer(<OFFERED) --profissional --> WITHDRAWN
  ```

- Invariantes: uma `Application` por (`jobPostingId`, `professionalProfileId`);
  candidatar-se exige `ProfessionalProfile` em estado `CLAIMED` (perfil
  gerenciado não se candidata sozinho); `ACCEPTED` só enquanto a vaga não está
  `FILLED`/`CLOSED`/`CANCELLED`.
- Uma `Application` `ACCEPTED` cria um `WorkRelationship` `PENDING_CONSENT` entre
  a empresa e o profissional (mesmo mecanismo do vínculo pós-claim), realimentando
  a base privada.

### Emenda ao ADR-0006

- `latitude`/`longitude` continuam em `Address` (empresa) e `ProfessionalProfile`.
- Raio deixa de ser a fronteira do produto e passa a ser **um filtro** entre
  cidade, estado, raio (só para `PRESENCIAL`) e remoto.
- Busca de vagas na Etapa 3: filtros por categoria, tipo de vínculo, modo de
  local, UF/cidade e raio. Sem score. Se o volume nacional exigir, migrar a
  consulta para PostGIS e/ou índice de texto dedicado (D11) — decisão adiada até
  haver dado de carga real.

## Consequências

- Novo agregado `JobPosting`/`Application` com sua própria máquina de estados e
  telas de triagem; camada de casos de uso ganha `publishJobPosting`,
  `applyToJobPosting`, `screenApplication`, `acceptApplication`.
- Notificação (ADR-0004) ganha categorias: `application_received` (empresa),
  `application_status` (profissional). Continuam via outbox.
- LGPD (ADR-0005) passa a ter escopo **nacional** e um novo tratamento
  (candidatura, currículo, carta) — atualizar o mapa de bases legais e a
  retenção de anexos. Ver emenda no ADR-0005.
- Escala: alcance nacional pode exigir worker dedicado para busca/indexação e
  revisão de índices; monitorar antes de otimizar.
- Decisões adiadas: **D9** wedge de aquisição do mural além da herança do piloto;
  **D10** preços (plano mensal e destaque) — ADR-0008; **D11** infraestrutura de
  busca de vagas dedicada.
