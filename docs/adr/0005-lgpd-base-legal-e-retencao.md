# ADR-0005 — LGPD: base legal, consentimento e retenção

- Status: **proposto** (decisões marcadas ⚠️ precisam de confirmação antes da Fase 1)
- Data: 2026-09-05
- Emenda 2026-09-06 (ADR-0007): escopo agora é **nacional**, não uma cidade. Novo
  tratamento a mapear — **candidatura a vaga** (mensagem, currículo e anexos):
  base legal proposta = execução de diligências pré-contratuais + consentimento
  ao anexar; retenção proposta do anexo = 12 meses após o encerramento da vaga ou
  a pedido do titular. A seção "Monetização" foi movida para o ADR-0008.

## Contexto

A empresa cria dado pessoal de terceiro (nome, telefone) antes de qualquer
relação do titular com a plataforma. A Fase 2 expõe profissionais numa rede
pública pesquisável. LGPD (Lei 13.709/2018) se aplica.

## Decisão

### Papéis

- A **plataforma** é **operadora** quanto aos dados que a empresa insere para
  gerir sua própria base, e **controladora** quanto a conta, autenticação,
  telemetria e (na Fase 2) rede pública.
- A **empresa** é **controladora** da sua base privada de profissionais.
- Documento de **Termos** (empresa) e **Política de Privacidade** (todos)
  publicados antes do primeiro usuário real. ⚠️ revisão jurídica.

### Base legal por tratamento

| Tratamento | Base legal proposta |
| --- | --- |
| Empresa cadastra profissional (perfil gerenciado) | ⚠️ **Legítimo interesse** da empresa (organização de equipe que já presta serviço a ela), com registro de origem e notificação ao titular no primeiro contato |
| Envio do convite (e-mail/SMS) | Execução de diligências pré-relação + legítimo interesse |
| Convocação e histórico de trabalho | Legítimo interesse / execução de contrato entre empresa e profissional |
| Disponibilidade declarada pelo profissional | Consentimento + fornecido pelo titular |
| **Visibilidade pública (Fase 2)** | **Consentimento específico e destacado**, revogável, com granularidade (funções, raio, campos exibidos) |
| Reputação pública agregada | Consentimento (mesmo opt-in da visibilidade) |
| Telemetria de produto | Legítimo interesse, com anonimização quando possível |

### Direitos do titular

- Tela de **"meus dados"**: exportar (portabilidade), corrigir, revogar
  consentimentos, solicitar exclusão.
- Exclusão a pedido → estado `ANONYMIZED`: remove nome, telefone, e-mail, foto;
  mantém registros de trabalho de forma pseudonimizada (necessidade da empresa +
  eventual obrigação legal/trabalhista). ⚠️ confirmar o que é retido e por quanto.

### Retenção

| Dado | Prazo proposto |
| --- | --- |
| Convite não aceito | ⚠️ **60 dias** → perfil `MANAGED` sem atividade é anonimizado; empresa é avisada antes |
| Perfil gerenciado sem convocação nem convite | ⚠️ 180 dias → anonimização |
| Histórico de convocação | ⚠️ 5 anos (alinha com prazo prescricional trabalhista) |
| Logs de auditoria | ⚠️ 2 anos |
| Conta encerrada | Anonimização em 30 dias, salvo obrigação legal |

### Encarregado (DPO)

- Nomear encarregado e publicar canal de contato antes do go-live. ⚠️ pendente.

## Consequências

- O schema precisa de: `ProfessionalProfile.createdByCompanyId`,
  `.sourceNote`, `.firstContactedAt`; tabela `Consent` (tipo, versão do texto,
  timestamp, IP/origem, estado); tabela `DataSubjectRequest`.
- Job de retenção rodando diariamente (worker), com dry-run e relatório.
- "Pronto" de qualquer fase exige: base legal mapeada para cada novo tratamento,
  textos publicados, direitos do titular funcionando.
