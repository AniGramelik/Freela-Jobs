# 28: Publicar Vaga

**O que construir:** a empresa cria uma vaga completa, publica dentro do teto do
plano e a vê listada; edita ou cancela avisando quem já se candidatou.

**Bloqueado por:** 26, 27, 09.

**Status:** done

- [x] `JobPosting` (título, descrição, `categoryId`, `tipoDeVinculo:
      DIARIA | TEMPORARIO | PJ | CLT | ESTAGIO`, `modoDeLocal:
      PRESENCIAL | HIBRIDO | REMOTO`, `address?` + `radiusKm?` quando presencial,
      `compensationText`, `positions`, `applicationDeadline`).
- [x] Estados `DRAFT → PUBLISHED → CLOSED | CANCELLED | FILLED`; só vai a
      `PUBLISHED` com categoria, tipo, modo e prazo futuro, e dentro do teto (27).
- [x] Editar vaga publicada e cancelar, notificando candidatos.
- [x] Endereço exibido de forma aproximada (bairro) na vaga pública.
- [x] Teste E2E: rascunho → publicar → aparece na lista; cancelar notifica.

## Resultado (lote A)

`JobPosting` + enums (`JobVinculo`, `JobLocationMode`, `JobPostingStatus`).
`src/domain/job-posting.ts` (`canPublish`, `acceptsApplications`, `statusAfterFill`).
`createJobDraft`, `publishJob` (gate de plano + `canPublish` + geocodifica
presencial), `cancelJob`, `listCompanyJobs` — escopados por empresa. Páginas
`/painel/vagas` e `/painel/vagas/nova`. Verde: 5 testes de integração + 6 unitários.

Nota: notificação a candidatos no cancelamento entra com o ticket 31/34.
