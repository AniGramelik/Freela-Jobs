---
version: 1
slug: "src-app-painel-convocacoes"
primary_target: "src/app/painel/convocacoes"
related_targets: ["src/app/prof/convocacoes"]
---

# Surface — Convocação (âncora do sistema visual)

Escopo: mundo visual do app + todas as ~18 rotas das duas jornadas; a
convocação é a âncora. Modo: **Operate**.

Público / trabalho: dono ou gerente (web, balcão sob luz forte, pressão de
tempo) monta e dispara uma convocação e acompanha quem topou / vagas restantes;
profissional (PWA, celular, trânsito) topa ou passa em 2 toques.

Prova: o **detalhe da convocação** — a chamada com status ao vivo e o placar de
vagas preenchendo, mais rápido e claro que o grupo de WhatsApp.

Constraints: Next 16 App Router + Tailwind v4 · pt-BR · WCAG 2.1 AA · mobile-first
em `/prof/*` · FCP ≤ 2,5 s em 4G na PWA · `next/font` · rotas, server actions,
casos de uso e textos de negócio intocados.

Decisões em aberto (o builder não inventa): matiz do acento, face de UI,
paleta do tema escuro, skeletons vs barra de progresso.

## Direction contract

THESIS: A lista é o produto. Toda superfície é uma tabela escaneável de um
objeto de domínio com anatomia de linha fixa (identidade · fatos · status ·
ações); o detalhe é um objeto em foco mais sua sub-lista. Recusa o dashboard de
grade de cards.

OWN-WORLD: Convenção de ferramenta operacional na barra de craft
Linear/Stripe/Vercel. Cinzas quase-neutros; um acento saturado não-indigo para
ação primária e status "agora"; verde/vermelho/âmbar semânticos para desfecho.
Elevação = borda hairline + sombra baixa suave, nunca cards pesados. Face de UI
workhorse; numerais tabulares em contagens e horas. Claro primeiro (empresa,
ambiente iluminado); tema escuro de primeira classe; PWA segue o SO. Formulários
são páginas inline com barra de ação fixa.

STORY: O gerente escaneia as convocações, abre uma, e vê as lâmpadas de status
virarem e o placar de vagas preencher ao vivo. O profissional recebe o detalhe
e toca TOPAR / PASSAR.

FIRST VIEWPORT (detalhe da convocação): cabeçalho (função · turno · local) com o
estado em pílula e o placar `N/M vagas` grande alinhado à direita; ação primária
no cabeçalho. Abaixo, largura total, a tabela da chamada: uma linha por
profissional — nome, telefone, pílula de status, ações da linha (presença,
avaliar). A linha em foco/ação ganha ênfase, as outras recuam. Sem casca de
hero, sem kicker.

FORM: canon / porta dos fundos (convenção da categoria feita reta); seed
ab3c9c3b; não é uma carta fundamentada sorteada. Interação-assinatura: a chamada
ao vivo — pílulas de status e o placar de vagas atualizam conforme as respostas
chegam, num único ease de 120–160 ms; `prefers-reduced-motion` posiciona sem
animar.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.

---

## Emenda — 2026-09-07 (rebrand do cliente)

O cliente enviou a logomarca oficial (navy + teal, gradiente navy→teal) e pediou
identidade **expressiva editorial**, não a "ferramenta feita reta". O mundo
visual foi re-moldado sobre a mesma arquitetura de tokens: acento = teal do
logo; `--color-ink` (navy) como neutro editorial; gradiente da marca como gesto;
serifa de display **Fraunces** nas vozes altas (≥1.25rem); Geist Sans no denso;
tema escuro passa a ser navy; grão sutil em capas; `fj-rise` na entrada de rota.
A tese "a lista é o produto" e o padrão de tabela seguem intocados.
