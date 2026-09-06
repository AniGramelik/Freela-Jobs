# 18: Aviso de 1º contato + Consent + preferências de notificação

**O que construir:** quando uma empresa cria um perfil com os dados de alguém,
essa pessoa é avisada do tratamento e de qual empresa foi; consentimentos ficam
registrados; cada um controla que notificação recebe.

**Bloqueado por:** 10.

**Status:** needs-info

Bloqueado por decisão D1/D2 (bases legais e revisão jurídica). Não liberar para
usuários reais antes da confirmação.

- [ ] `Consent` append-only (tipo, versão do texto, timestamp, origem, estado);
      revogação é novo registro.
- [ ] Notificação ao titular no primeiro contato (origem do perfil gerenciado).
- [ ] Preferências por categoria; transacional de convocação/candidatura sem
      opt-out; `digest`/`marketing` com opt-out.
- [ ] Cada tratamento novo mapeado a uma base legal documentada.
- [ ] Teste: revogar consentimento tem efeito imediato no tratamento
      correspondente.
