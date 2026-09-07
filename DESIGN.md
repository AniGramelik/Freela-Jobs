---
name: Freela Jobs
description: Operational-tool interface for casual-labor call-outs and a national job board (pt-BR).
colors:
  canvas: "oklch(0.985 0.002 255)"
  panel: "#ffffff"
  panel-2: "oklch(0.975 0.003 255)"
  hairline: "oklch(0.922 0.004 255)"
  hairline-strong: "oklch(0.86 0.005 255)"
  fg: "oklch(0.24 0.012 260)"
  fg-muted: "oklch(0.46 0.01 260)"
  fg-subtle: "oklch(0.6 0.008 260)"
  fg-onbrand: "#ffffff"
  brand: "oklch(0.55 0.188 249)"
  brand-hover: "oklch(0.48 0.188 249)"
  brand-soft: "oklch(0.955 0.038 249)"
  ring: "oklch(0.6 0.19 249)"
  pos: "oklch(0.52 0.13 150)"
  pos-soft: "oklch(0.955 0.04 150)"
  neg: "oklch(0.53 0.2 25)"
  neg-soft: "oklch(0.96 0.03 25)"
  pend: "oklch(0.62 0.13 75)"
  pend-soft: "oklch(0.96 0.05 80)"
typography:
  display:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "1"
    letterSpacing: "-0.02em"
    fontFeature: "tabular-nums"
  headline:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "-0.015em"
  title:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "-0.006em"
    fontFeature: "'cv05' 1, 'ss01' 1"
  label:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: "1.4"
    letterSpacing: "-0.006em"
  caption:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "normal"
rounded:
  xs: "0.25rem"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  full: "9999px"
spacing:
  hair: "0.375rem"
  xs: "0.5rem"
  sm: "0.625rem"
  md: "0.875rem"
  lg: "1rem"
  xl: "1.25rem"
  gutter: "1.5rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.fg-onbrand}"
    rounded: "{rounded.md}"
    padding: "0 0.875rem"
    height: "2.25rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
    textColor: "{colors.fg-onbrand}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "0 0.875rem"
    height: "2.25rem"
  button-secondary-hover:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.fg}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fg-muted}"
    rounded: "{rounded.md}"
    padding: "0 0.625rem"
    height: "2rem"
  button-ghost-hover:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.fg}"
  button-danger:
    backgroundColor: "{colors.neg}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 0.875rem"
    height: "2.25rem"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.25rem"
    typography: "{typography.body}"
  input-focus:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.fg}"
  status-pill:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.fg-muted}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.5rem"
    typography: "{typography.caption}"
  status-pill-brand:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand}"
  status-pill-pos:
    backgroundColor: "{colors.pos-soft}"
    textColor: "{colors.pos}"
  status-pill-neg:
    backgroundColor: "{colors.neg-soft}"
    textColor: "{colors.neg}"
  status-pill-pend:
    backgroundColor: "{colors.pend-soft}"
    textColor: "{colors.pend}"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.lg}"
    padding: "1rem"
  table-row-focused:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.fg}"
  nav-item-active:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand}"
    rounded: "{rounded.md}"
    padding: "0.375rem 0.625rem"
---

# Design System: Freela Jobs

## Overview

**Creative North Star: "The Operations Console"**

Freela Jobs is a console for getting a shift covered under time pressure. Its
reference bar is Linear, Stripe Dashboard, and Vercel Dashboard, and the
convention is executed straight: no irony, no quirk, no house-style flourish.
Every surface is a scannable table of one domain object with a fixed row
anatomy — identity, facts, status, actions — and every detail page is one object
in focus above its own sub-list. The grid-of-cards dashboard is refused
outright.

The palette is near-neutral grey carrying a single saturated azure accent
(hue ~249, deliberately not indigo) plus semantic green / amber / red for
outcomes. Depth is a hairline border and a low, soft shadow — never a heavy
lifted card. The type face is a workhorse (Geist Sans); counts, times, and phone
numbers are set in tabular figures. Light theme is the anchor because the
company user works at a counter under hard light; dark theme is fully built, and
the professional PWA follows the OS. Forms are inline pages, not modals.

Density is high but not cramped: 8–14 px type does most of the work, controls
are 32–36 px tall, and the widest reading column is 6xl. The one moment the
system raises its voice is the vagas tally on the call-out detail — a 30 px
tabular numeral with a thin fill bar — and it earns that scale by being the
single number the manager is waiting on.

**Key Characteristics:**
- Table-first: every index is a hairline table; every detail is a focused object plus a sub-list table.
- One azure accent, reserved for the primary action, "now" status, active nav, and the focus ring.
- Elevation is hairline + `shadow-sm`; heavy cards are never used.
- Tabular numerals everywhere a number is compared or scanned.
- Sentence-case labels; no uppercase kickers or eyebrows.
- Light-first, real dark theme, PWA follows the OS.

## Colors

Near-neutral greys with a cool blue cast (hue 255–260) under a single saturated
azure accent; semantic hues stay muted so they read as status, not decoration.
Values below are the light theme, which is canonical; the dark theme redefines
the same semantic tokens (see the Dark Theme table and the sidecar).

### Primary
- **Saturated Azure** (`oklch(0.55 0.188 249)`): the one accent. Primary button fill, active nav item text, the `.tnum` fill bar on the tally while in progress, `caret-color`, links, and the "no ar" / "topou" status. Chroma is held high (0.188) on purpose — this is not indigo and not a desaturated corporate blue.
- **Azure Hover** (`oklch(0.48 0.188 249)`): primary button hover only; a darkening, not a hue shift.
- **Azure Soft** (`oklch(0.955 0.038 249)`): the tint behind an active nav item, a brand-tone status pill, and the focused table row (`brand-soft/60`). Never used for text.
- **Focus Ring** (`oklch(0.6 0.19 249)`): 2 px `:focus-visible` outline with 2 px offset, globally.

### Secondary
There is no secondary accent. The semantic trio below covers every non-brand colored surface.

### Tertiary (semantic outcomes)
- **Outcome Green** (`oklch(0.52 0.13 150)`) / **Green Soft** (`oklch(0.955 0.04 150)`): "compareceu" / "lotada" / a completed tally (numeral and bar both flip to green).
- **Outcome Red** (`oklch(0.53 0.2 25)`) / **Red Soft** (`oklch(0.96 0.03 25)`): "faltou" / "cancelada" / "desistiu", the danger button, and form error blocks.
- **Pending Amber** (`oklch(0.62 0.13 75)`) / **Amber Soft** (`oklch(0.96 0.05 80)`): "chamando" — a response offered but not yet answered.

### Neutral
- **Canvas** (`oklch(0.985 0.002 255)`): the page background behind all panels.
- **Panel** (`#ffffff`): cards, tables, inputs, the nav surface (at 85–90% opacity with a backdrop blur).
- **Panel-2** (`oklch(0.975 0.003 255)`): table headers, hover fills, inset note callouts, icon chips, disabled inputs.
- **Hairline** (`oklch(0.922 0.004 255)`): the default border color for everything (`* { border-color }`), table row dividers, panel edges.
- **Hairline Strong** (`oklch(0.86 0.005 255)`): input borders, secondary button border, dashed empty-state border, scrollbar thumb.
- **Foreground** (`oklch(0.24 0.012 260)`): primary text.
- **Foreground Muted** (`oklch(0.46 0.01 260)`): meta lines, field labels, inactive nav, ghost button text.
- **Foreground Subtle** (`oklch(0.6 0.008 260)`): captions, table headers, placeholders, the `/total` in the tally.

### Dark Theme
Applied via `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` and `:root[data-theme="dark"]`. Same token names, redefined:

| token | dark value |
| --- | --- |
| canvas | `oklch(0.18 0.008 260)` |
| panel | `oklch(0.215 0.009 260)` |
| panel-2 | `oklch(0.245 0.01 260)` |
| hairline | `oklch(0.31 0.011 260)` |
| hairline-strong | `oklch(0.4 0.012 260)` |
| fg | `oklch(0.94 0.006 260)` |
| fg-muted | `oklch(0.72 0.012 260)` |
| fg-subtle | `oklch(0.58 0.012 260)` |
| brand | `oklch(0.66 0.172 249)` |
| brand-hover | `oklch(0.73 0.16 249)` |
| brand-soft | `oklch(0.32 0.072 249)` |
| ring | `oklch(0.7 0.17 249)` |
| pos / neg / pend | `oklch(0.72 0.14 150)` / `oklch(0.68 0.17 25)` / `oklch(0.76 0.13 80)` |

In dark, brand lightens and drops chroma (0.188 → 0.172) and its hover *brightens* rather than darkens.

### Named Rules
**The One Accent Rule.** Azure is the only non-semantic color in the system. It marks the primary action, the "now" status, the active nav item, and the focus ring — nothing else. If a surface has more than one azure element competing for attention, one of them is wrong.

**The Color-Is-Status Rule.** Green, amber, and red never decorate. A colored pill or number always encodes a domain state (`ACCEPTED`, `NO_SHOW`, `FILLED`, ...). Neutral is the resting state; color is a signal.

**The Everything-Hairline Rule.** The default border color for every element is `hairline`. Reach for `hairline-strong` only on interactive edges (inputs, secondary buttons, empty states).

## Typography

**Display / Body / Label Font:** Geist Sans (`var(--font-geist-sans)`, then `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`).
**Mono Font:** Geist Mono is registered as `--font-mono` but is not applied to any element in the build; tabular treatment is achieved with Geist Sans + the `tnum` utility, not a family switch.

**Character:** One neutral, high-legibility grotesque doing every job from 11 px table header to 30 px tally. Personality comes from tight tracking (−0.006em on body, tightening to −0.02em on the tally) and the enabled character-variant features (`cv05`, `ss01`), not from a display face.

### Hierarchy
- **Display** (600, 1.875rem / `text-3xl`, line-height 1, −0.02em, tabular): exactly one use — the `Tally` numeral on the call-out detail. Nothing else in the system is this large.
- **Headline** (600, 1.25rem / `text-xl`, −0.015em): the auth-card page title (`/entrar`, `/assumir`).
- **Title** (600, 1.125rem / `text-lg`, −0.01em): `PageHeader` H1 and every `/prof/*` page H1. The default page heading.
- **Body** (400, 0.875rem / `text-sm`, −0.006em): default UI text, table cells, meta lines, `PageHeader` meta. Professional cards bump the object name to 1rem / `text-base` 600.
- **Label** (500, 0.8125rem / 13px): field labels, hints, nav items, breadcrumb link, inline helper text. `SectionLabel` is this size at 600 weight.
- **Caption** (500–600, 0.75rem / 12px): table headers, `StatusPill` text, the private-note disclaimer, nav-rail email. Tab-bar labels drop to 0.6875rem / 11px.

### Named Rules
**The Tabular Number Rule.** Any figure that is compared or scanned — vaga counts, shift times, phone numbers, the OTP field, ratings — carries the `tnum` utility (`font-variant-numeric: tabular-nums`). Prose numbers do not.

**The Sentence-Case Label Rule.** Labels, section headers, and nav items are sentence case at 12–13 px medium. There are no uppercase kickers, eyebrows, or all-caps headings. The only `uppercase` in the codebase is the two-letter UF (state) input, normalizing user data — not a type style.

**The One Big Number Rule.** `text-3xl` is reserved for the tally. If a new surface wants a hero number, it needs the same justification: a single value the user is actively waiting on.

## Layout

Content sits in a centered column: `max-w-4xl` by default, `max-w-6xl` (`wide`)
for table-heavy detail pages, with `px-4 sm:px-6 lg:px-8` and `py-6`. Auth uses
`max-w-sm`; the professional profile list uses `max-w-md`.

**Company shell (`/painel/*`):** `NavRail` is a fixed top bar below `lg` (h-14,
horizontal scrolling items, `bg-panel/85` + `backdrop-blur-sm`) and a fixed
`lg:w-60` (15rem) left rail above it; content is offset with `pt-14 lg:pt-0
lg:pl-60`.

**Professional shell (`/prof/*`):** deliberately does *not* route through
`PageShell` / `PageHeader`. It uses a compact mobile-first scaffold — `<main
className="px-4 py-6">` (or `grid gap-4`) with a bare `text-lg font-semibold
tracking-[-0.01em]` H1 — and a fixed bottom 4-tab bar with
`pb-[env(safe-area-inset-bottom)]`. This is an intentional, internally
consistent split, not drift.

**Spacing rhythm:** Tailwind's default step scale, used tightly. Common values:
`gap-1.5` / `gap-2` between controls, `gap-3` between cards, `gap-4`–`gap-6`
between header and body, `p-4 sm:p-5` inside panels, `px-3.5 py-3` in table
cells, `pb-5` under a page header. Vertical section breaks are `mb-4`/`mb-5`.

**Breakpoints:** Tailwind defaults; `sm` (640px) toggles secondary table
columns (phone hidden below it) and header padding, `lg` (1024px) swaps the
company nav from top bar to side rail.

## Elevation & Depth

A hybrid that leans flat. Depth is carried almost entirely by a hairline border
plus one soft, low shadow (`shadow-sm`). Panels, tables, the professional card
list, and the empty-state box all use exactly `border + shadow-sm`; the nav
surfaces use translucency + `backdrop-blur-sm` instead of a shadow. There is no
hover-lift, no `translateY`, no elevation-on-focus. Surfaces do not stack.

### Shadow Vocabulary
- **Resting Panel** (`box-shadow: 0 1px 2px oklch(0.2 0.03 260 / 0.06), 0 1px 3px oklch(0.2 0.03 260 / 0.05)` — token `--shadow-sm`): the only elevation actually used. Every card, table, and panel.
- **Primary Button Inset** (`box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.12)`): a 1 px top highlight on the primary button for a slight physicality. Not a drop shadow.
- `--shadow-md` and `--shadow-pop` are defined in `globals.css` but no shipped surface references them. Treat them as available primitives, not as documented elevation roles.

### Named Rules
**The Hairline-First Rule.** Elevation is `border-hairline` + `shadow-sm`. If that isn't enough separation, the layout is too dense — fix the spacing, don't add a bigger shadow. Heavy or colored drop shadows are outside the system.

## Shapes

Rounded-rectangle language on a five-step radius scale: `xs` 4px (focus-ring
clip only), `sm` 6px, `md` 8px (buttons, inputs, the note callout, icon chips),
`lg` 12px (panels, tables, card list items, empty states), `full` (status pills,
the tally fill bar, nav dots, the "F" logo mark is `md`). Containers are the
larger 12px radius; controls are the tighter 8px; anything that reads as a token
or badge is fully round. Borders are 1px throughout. No cut corners, no
asymmetric radii, no clipping tricks beyond `overflow-hidden` to keep child rows
inside a rounded list.

## Components

### Buttons
- **Shape:** 8px radius (`rounded-md`), `font-medium`, `whitespace-nowrap`, `gap-1.5` for icon + label, `transition-colors duration-150`. Sizes: `md` = 36px tall (`h-9`) / `px-3.5` / `text-sm`; `sm` = 32px (`h-8`) / `px-2.5` / 13px. Disabled = `opacity-45`, no pointer events.
- **Primary:** `brand` fill, `fg-onbrand` (white) text, plus the inset top-highlight shadow. Hover → `brand-hover`.
- **Secondary:** `panel` fill, `fg` text, `hairline-strong` border. Hover → `panel-2` fill.
- **Ghost:** no fill or border, `fg-muted` text. Hover → `panel-2` fill + `fg` text. Used for demoted actions ("Cancelar" on the anchor, "Salvar" on the inline rating, "Desistir" on mobile).
- **Danger:** `neg` fill, white text, hover `brightness-95`.
- **Focus:** 2px `outline` in `ring` with 2px offset (`:focus-visible`).
- **Submit:** `SubmitButton` wraps the same classes; while a server action runs it sets `disabled` + `aria-busy` and swaps in a `pendingLabel` ("Salvando…", "Cancelando…"). Defaults to `secondary` / `sm`.
- On the professional side, primary/secondary buttons are stretched to `h-11 w-full` with `text-[0.9375rem]` for thumb targets.

### Chips / Status Pills
- **Style:** fully round, 1px border, `px-2 py-0.5`, 12px `font-medium`, optional 6px leading dot (`aria-hidden`).
- **Tones:** `neutral` (`panel-2` / `fg-muted` / `hairline-strong`), `brand`, `pos`, `neg`, `pend` — each a `*-soft` fill, solid `*` text, and a `/25` border of the same hue. The dot is the solid hue.
- **Usage:** always the printed form of a domain enum (call-out status, response state). The UI never prints a raw enum — `src/lib/labels.ts` maps every value to a pt-BR label + tone.

### Cards / Containers (`Panel`)
- **Corner:** 12px (`rounded-lg`).
- **Background:** `panel` on `canvas`.
- **Shadow:** `shadow-sm` (see Elevation).
- **Border:** 1px `hairline`.
- **Padding:** `p-4 sm:p-5` (toggle-off with `padded={false}`).
- `EmptyState` is the same box with a `border-dashed border-hairline-strong` edge, centered content, an optional round `panel-2` icon chip, `px-6 py-14`.

### Inputs / Fields
- **Style:** shared `control` class — full width, 8px radius, `hairline-strong` border, `panel` background, `px-3`, `text-sm`, 36px tall (`h-9`); textarea `min-h-20`. `Select` is `appearance-none` with an inline SVG chevron.
- **Focus:** border shifts to `brand` and a 2px `ring` outline is drawn with `outline-offset: -1px` (inset), `transition-colors duration-150`. No glow.
- **Disabled:** `opacity-50` + `panel-2` background.
- **Field wrapper:** `grid gap-1.5`, label is 13px `font-medium` `fg-muted`; a single message slot renders `error` (in `neg`) or else `hint` (in `fg-subtle`).
- **Form-level:** `FormError` (`role="alert"`, `neg` soft block) and `FormStatus` (`role="status"`, `pos` soft block), both 13px with a `/30` hued border.

### Navigation
- **Company rail:** items are 13px `font-medium`, `rounded-md`, `px-2.5 py-1.5`, with a 16px Lucide icon at stroke 1.75. Default `fg-muted`; hover `panel-2` + `fg`; **active** `brand-soft` fill + `brand` text, driven by `usePathname` and marked `aria-current="page"`. Brand "F" mark is a 24px `brand` square, 11px bold white.
- **Professional tab bar:** 4 fixed bottom tabs, `grid grid-cols-4`, icon-over-label, label 11px `font-medium`. Active = `brand` text + icon stroke 2 (vs 1.75 inactive); inactive `fg-subtle`.

### Tally (signature component)
The focal element of the call-out detail and the system's one deliberate scale
jump. Right-aligned column: a `tnum` `text-3xl` `font-semibold` `-0.02em`
numeral for `filled`, a `text-lg` `fg-subtle` `/total`, then a lowercase label.
Below, a 4px-tall, 7rem-wide track (`bg-hairline`, fully round) with a fill bar
that animates `transition-[width] duration-150 ease-out
motion-reduce:transition-none`. On completion (`filled >= total`) the numeral and
the bar both switch from `fg`/`brand` to `pos`.

### Table (signature pattern)
The whole system is built on this. `Table` wraps a `<table>` in
`overflow-x-auto` + 12px border + `shadow-sm`. `THead` is `panel-2` with 12px
`font-semibold` `fg-subtle` headers (`px-3.5 py-2.5`). `TBody` rows are
`divide-y divide-hairline`; `TD` is `px-3.5 py-3 align-middle`. `TR` takes a
`focused` prop: the row in play gets `bg-brand-soft/60`; all other rows are
plain with a `hover:bg-panel-2`.

### Named Rules
**The Focused-Row Rule.** In any roll-call table, the row that is actionable
right now (`ACCEPTED` awaiting attendance, an application awaiting triage) gets
`focused` — a `brand-soft/60` wash — and every other row recedes to
hover-only. Exactly one emphasis treatment; never more than a wash.

## Do's and Don'ts

### Do:
- **Do** build every new index as a `Table` with the fixed row anatomy: identity, facts, `StatusPill`, row actions.
- **Do** make each detail page one object in a `PageHeader` (title + `StatusPill` + `tnum` meta line) above its own sub-list table.
- **Do** route colored UI through the semantic tokens (`pos`/`neg`/`pend`/`brand`) and label enums through `src/lib/labels.ts`; never print a raw enum.
- **Do** set `tnum` on counts, times, phone numbers, and codes.
- **Do** use `border-hairline` + `shadow-sm` for every elevated surface, and translucency + `backdrop-blur-sm` for fixed nav.
- **Do** give server-action buttons a `SubmitButton` with a `pendingLabel`.
- **Do** keep the primary azure to one element per surface; demote everything else to `secondary` or `ghost`.
- **Do** honor `prefers-reduced-motion`: the `.fj-land` highlight and tally/bar transitions must resolve to no animation.

### Don't:
- **Don't** build a grid-of-cards dashboard; the list is the product.
- **Don't** introduce a second accent hue or use azure for anything but the primary action, "now" status, active nav, and the focus ring.
- **Don't** use `--shadow-md` / `--shadow-pop`, hover-lifts, `translateY`, or colored drop shadows — elevation is flat + hairline.
- **Don't** add uppercase kickers, eyebrows, or all-caps headings; labels are sentence case at 12–13px.
- **Don't** exceed `text-3xl`, and reserve that size for a single value the user is actively waiting on.
- **Don't** put more than one `focused` row in a table.
- **Don't** route `/prof/*` screens through `PageShell`/`PageHeader`; use the compact mobile scaffold + bottom tab bar.
- **Don't** apply Geist Mono; tabular figures come from Geist Sans + `tnum`.

## Known gaps / deviations

Recorded honestly against the direction contract for `src/app/painel/convocacoes`; these are build-carried debts, not system rules.

1. **Live call is not pushed.** FORM names the signature interaction as status
   pills and the tally updating *as responses arrive*. There is no realtime
   transport in this build (SSE/websocket infra out of scope). Instead: every
   mutation server action calls `revalidatePath`, so the board is correct on the
   next round-trip; `SubmitButton` gives immediate pending feedback; the `Tally`
   width transition and `.fj-land` keyframe are timed to the contract's
   120–160 ms feel for when values *do* change. `@keyframes fj-pulse-in` and
   `.fj-land` ship in `globals.css` but currently have **no caller** — they are
   staged for the SSE wiring (an endpoint on the callout + a client subscription
   that refreshes the roll-call and pulses changed rows). Documented as the
   defined landing animation; not yet a live system behavior.

2. **Anchor header has no primary action.** FIRST VIEWPORT asks for a primary
   action in the header. The frozen domain has no non-destructive header-level
   action for an open callout (no "add recipients" use case; row-level
   accept/attendance is the actual work). The header carries the `Tally` as the
   focal element plus a demoted ghost "Cancelar". This is a domain limitation,
   not an omission.

3. **`/prof/*` scaffolding** does not use `PageShell`/`PageHeader`. It runs its
   own compact mobile shell (bare `<main>` + `text-lg` H1 + bottom tab bar).
   Internally consistent and intentional; documented so a future pass doesn't
   "fix" it toward the company shell.
