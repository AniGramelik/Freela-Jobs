# 28: Publicar Vaga

**O que construir:** a empresa cria uma vaga completa, publica dentro do teto do
plano e a vê listada; edita ou cancela avisando quem já se candidatou.

**Bloqueado por:** 26, 27, 09.

**Status:** ready-for-agent

- [ ] `JobPosting` (título, descrição, `categoryId`, `tipoDeVinculo:
      DIARIA | TEMPORARIO | PJ | CLT | ESTAGIO`, `modoDeLocal:
      PRESENCIAL | HIBRIDO | REMOTO`, `address?` + `radiusKm?` quando presencial,
      `compensationText`, `positions`, `applicationDeadline`).
- [ ] Estados `DRAFT → PUBLISHED → CLOSED | CANCELLED | FILLED`; só vai a
      `PUBLISHED` com categoria, tipo, modo e prazo futuro, e dentro do teto (27).
- [ ] Editar vaga publicada e cancelar, notificando candidatos.
- [ ] Endereço exibido de forma aproximada (bairro) na vaga pública.
- [ ] Teste E2E: rascunho → publicar → aparece na lista; cancelar notifica.
