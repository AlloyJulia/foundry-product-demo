# Foundry — Product v2 (production-grade interactive prototype)

**What this is:** a fully interactive, production-grade demo of Foundry — the decision-intelligence product for capital-intensive process industries. Every control works: filters recompute the forecast live, the what-if engine moves the capex call, the leading-indicator toggle visibly widens confidence, and a spotlight guided tour walks the key features and value props. Built to the **Production-Grade Interactive tier** of `methodology/product-build-standard.md`.

> **Candidate replacement for `../product/`.** This is the v2 built per the 2026-07-14 spec. The current `../product/` is intentionally left untouched. Promotion (v2 → `product/`) is a separate, builder-confirmed step — see `docs/superpowers/runbooks/2026-07-14-foundry-product-v2-promotion.md`.

## Honesty (read before showing anyone)
Every figure is **representative sample data** — not a real forecast, a real backtest, or an analysis of Grupo AG's actual data. A subtle `◈ Sample data` pill (top bar, click for the full disclosure) is on every screen, and Screen 5 carries the full honesty panel. This satisfies the studio no-fabrication standard.

## Run it
It uses ES modules, so it must be **served over HTTP** (opening `index.html` via `file://` fails — browsers block module imports from a null origin):

```bash
cd ventures/foundry/product-v2
python3 -m http.server 8817
# open http://localhost:8817/index.html
```

Deploy target = GitHub Pages (flat static files, no build step). EN default, ES via the top-bar toggle.

## Verify it
- `tests.html` — in-browser assertions for the pure `compute.js` layer (open it; expect "ALL GREEN"). Also runnable headless via Node against `js/compute.js` (17 assertions).
- Full interactive verification (zero console errors + every control + all 7 tour beats exercised, EN/ES): `scripts` in the spec's verification section; a headless `playwright-core` script drove all 18 checks green on last build.

## Module map (isolated responsibilities)
| File | Job |
|---|---|
| `index.html` | App shell + 5 screen containers + `data-tour` anchors |
| `styles.css` | Visual design, chrome, micro-interactions, tour overlay |
| `design-system/tokens.css` | Foundry brand tokens (navy + ember), from `tokens.json` |
| `js/config.js` | `BRAND` (single source), mock `SESSION`, filter option lists |
| `js/state.js` | Central store: `getState` / `setState` / `subscribe` |
| `js/data.js` | Seeded sample datasets (illustrative) |
| `js/compute.js` | Pure derivations (no DOM) — forecast/divergence/mix/rec/breakeven/drivers |
| `js/charts.js` | Inline-SVG + CSS-bar builders |
| `js/i18n.js` | EN/ES dictionary + `t` / `applyLang` / `setLang` |
| `js/render/*.js` | One renderer per screen |
| `js/tour.js` | Spotlight coachmark engine + the 7 value-prop beats |
| `js/app.js` | Wiring: delegation, keyboard nav, chrome, toasts, boot |

## The 5 screens
1. **Overview / workspace home** — the two outputs on one signal spine + the planning-horizon ladder.
2. **Production-Mix Signal** — live Region / Product / Horizon filters recompute the forecast, confidence band, divergence alert, and recommended mix; Oriente = honest cold-start hold.
3. **Signal Drivers (hero / moat)** — expandable signal categories + the remittance leading-indicator toggle (turn it off to see confidence widen).
4. **Capex Build / Wait / Partner** — what-if events (competitor exit/enter, policy) drive the probabilistic verdict, scenario fan, break-even, and the committee-in-one-model closing beat.
5. **What's Next** — recap + the full honesty panel + an illustrative CTA.

## The guided tour
7 spotlight beats; each highlights a feature, performs the live UI action that demonstrates it, and states **what it proves** + the **source artifact** (canonical.yaml, decision.md, jtbd-synthesis, moat.md, product-build-standard). Auto-starts on first visit (localStorage), restartable via the rail button or `?`.

## Keyboard
`←/→` between screens · `?` guided tour · `/` focus search · `Esc` close popovers/tour.
