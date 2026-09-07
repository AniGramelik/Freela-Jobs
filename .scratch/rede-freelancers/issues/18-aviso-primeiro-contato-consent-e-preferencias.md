# 18: Aviso de 1º contato + Consent + preferências de notificação

**O que construir:** quando uma empresa cria um perfil com os dados de alguém,
essa pessoa é avisada do tratamento e de qual empresa foi; consentimentos ficam
registrados; cada um controla que notificação recebe.

**Bloqueado por:** 10.

**Status:** done (mecanismo) — D1/D2 pendente

Bloqueado por decisão D1/D2 (bases legais e revisão jurídica). Não liberar para
usuários reais antes da confirmação.

- [x] `Consent` append-only (tipo, versão do texto, timestamp, origem, estado);
      revogação é novo registro.
- [x] Notificação ao titular no primeiro contato (origem do perfil gerenciado).
- [x] Preferências por categoria; transacional de convocação/candidatura sem
      opt-out; `digest`/`marketing` com opt-out.
- [x] Cada tratamento novo mapeado a uma base legal documentada.
- [x] Teste: revogar consentimento tem efeito imediato no tratamento
      correspondente.
