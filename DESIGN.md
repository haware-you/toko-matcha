# Design

## Theme

Light, warm, high-humidity. A cream page the colour of unbleached paper, punctuated by two saturated blocks: a deep forest green and an acid lime. The whole site sits inside a single rounded panel floating on a neutral grey desk, like a printed card photographed from above.

Not dark mode. The scene is a phone held outdoors in Depok daylight, and the drink is cold and bright: the surface has to feel lit, not lit-from-within.

Colour strategy: **full palette**. Three named roles, each doing a different job. Cream is the ground, forest green is the anchor, lime is the interrupt.

## Color

OKLCH values are authoritative; hex is the shipped fallback.

| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `--cream` | `#fdf7dd` | `oklch(96.7% 0.048 100)` | Page ground, ~55% of surface |
| `--cream-deep` | `#f6efc9` | `oklch(94.3% 0.062 102)` | Rare tonal step on cream |
| `--green` | `#274a26` | `oklch(35.4% 0.078 145)` | Anchor blocks, footer, primary button |
| `--green-ink` | `#16301a` | `oklch(24.8% 0.061 150)` | Body text on cream |
| `--green-soft` | `#8fa382` | `oklch(66.1% 0.043 130)` | De-emphasised text on cream |
| `--lime` | `#ebfc55` | `oklch(95.2% 0.201 118)` | Interrupt: ribbon, badge, CTAs on green |
| `--page` | `#e9e9e9` | `oklch(93.2% 0.000 0)` | Desk behind the panel |
| `--white` | `#fff` | `oklch(100% 0 0)` | Flavour cards and note cards only |

Rules:
- Lime never carries text at body size. It is a fill behind dark green ink, or a band.
- Pure white is reserved for physical-object surfaces (cards that read as paper). Never as a page background.
- Neutrals are tinted toward the yellow-green ground; there is no true grey in the panel.

## Typography

Two families, both from Google Fonts.

- **Archivo** (400/500/600/700/800, plus italic 700/800): everything structural. Headlines, nav, labels, body.
- **Playfair Display** (italic 400/500/600): the second half of every headline lockup, and small hand-annotation labels.

The signature move is a **split headline**: a tight grotesque first line and an oversize serif italic second line, overlapping vertically. `Matcha` / *`On Perfect`*, `Glow With` / *`Matcha`*, `Pure Matcha` / *`Energy`*. This lockup is the brand's identity and overrides the usual advice against display-serif italics.

Scale is fluid, `clamp()` throughout, roughly 1.35 between steps.

| Role | Size | Notes |
|---|---|---|
| Hero line 1 | `clamp(44px, min(10.3vw, 17vh), 150px)` | Archivo 700, `-0.045em` |
| Hero line 2 | `clamp(46px, min(10.8vw, 18vh), 158px)` | Playfair italic 500, pulled up `-0.12em` |
| Section display | `clamp(34px, 5.2vw, 74px)` | Same split lockup |
| Footer nav | `clamp(26px, 4.1vw, 58px)` | Archivo 700 |
| Stack labels | `clamp(12px, 1.15vw, 17px)` | Line 1 Archivo 600, line 2 Playfair italic |
| Pill / button | `clamp(9px, 0.82vw, 12px)` | 600, uppercase, `0.11em` tracking |
| Legal | `clamp(8.5px, 0.8vw, 11.5px)` | Uppercase, `0.11em` tracking |

Body copy never exceeds 65ch. Light-on-dark blocks get extra line-height.

## Layout

- Everything lives in `.shell`: `min(1440px, 100% - 2 × clamp(8px, 1.6vw, 28px))`, radius `clamp(18px, 2vw, 30px)`, `overflow: clip`. The clip is load-bearing: the flavour rail and ribbon deliberately overflow and are cut by the panel edge.
- Section padding: `--pad` = `clamp(20px, 3.4vw, 56px)`.
- Faint grid lines overlay both grounds (`::before` on `.grid-bg`): 25% columns and 190px rows on cream, 46px cells on green. They are structure made visible, not decoration.
- Two full-bleed anchor blocks (the split panel and the footer) interrupt the cream at their own rounded radius.
- The `.split` section is a hard 50/50 grid above 860px and stacks below it.

## Components

- **Pill** — the only button. Fully round, uppercase micro-label, arrow glyph. Four variants: `--white` (on photography), `--yellow` (on green), `--green` (on cream), and `--dashed` (adds an offset dashed ring).
- **Viewfinder** — a hairline rounded rectangle over the hero photo, aspect `240/354`, holding the primary CTA. Framing device, not a card.
- **Note card** — white, radius 12px, icon tile plus two lines. Overhangs its parent on both sides.
- **Scallop badge** — 20-lobe SVG rosette in lime, counter-rotating label.
- **Flavour card** — white square, radius `clamp(10px, 1.5vw, 22px)`, each with its own rotation and vertical offset so the row reads as an arc. The row is wider than the panel on purpose.
- **Ribbon** — a single SVG arc, stroked lime at 60 units, carrying a `textPath` marquee. Crosses the hero's curved bottom edge.

Cards are used in exactly two places, both times because the object being represented is literally a card. Nothing else is boxed.

## Motion

Character: **poured and settled**. Liquid finding its level. Long, weighted, decelerating; nothing overshoots, nothing bounces, nothing repeats once it has landed.

| Token | Curve | Use |
|---|---|---|
| `--ease-settle` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals, the hero sequence |
| `--ease-pour` | `cubic-bezier(0.22, 1, 0.36, 1)` | Scroll-linked and continuous motion |
| `--ease-quick` | `cubic-bezier(0.25, 1, 0.5, 1)` | Hover, press, state feedback |

Durations: 120–180ms feedback, 320–420ms state change, 700–1100ms entrances. Exits run at ~70% of their entrance.

Rules:
- Transform and opacity only. No animated blur, filter, or layout property. The performance budget is a mid-range Android at 60fps.
- One page-load sequence, in the hero, roughly 1.6s end to end. Every other section reveals once on scroll and then stays still.
- Continuous loops (ribbon marquee, badge rotation, glass float) pause when off-screen.
- `prefers-reduced-motion: reduce` removes all of it and ships the page in its resting state.
