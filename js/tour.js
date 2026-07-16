/* Foundry product-v2 — spotlight coachmark tour.
   7 beats in narrative order (intro → data in → shared visibility → production forecast →
   every item → capex decision → scenario planning): each navigates + performs a live UI
   action, spotlights a data-tour target. Auto-starts first visit; restartable; Esc/Skip exits. */

import { getState, setState, markTourDone } from "./state.js";
import { t } from "./i18n.js";

/* Narrative order: intro (what is demand forecasting) → data in → what it does
   (production, then capex) → scenario planning. 1 step per output; scenario planning
   is the finale. Beat 0 is a centered intro card with no spotlight (target: null).
   `key` drives the i18n copy; `n` is just the display number. */
const BEATS = [
  { n: 1, key: "tb0", target: null, tag: "intro — welcome",
    apply: function () { setState({ screen: "next" }); } },
  { n: 2, key: "tb1", target: "next-data", tag: "data in — one place",
    apply: function () { setState({ screen: "next" }); } },
  { n: 3, key: "tb_shared", target: "next-contributors", tag: "shared visibility — one place, live",
    apply: function () { setState({ screen: "next" }); } },
  { n: 4, key: "tb2", target: "mix-forecast", tag: "production forecast — filters + chart together",
    apply: function () { setState({ screen: "mix", filters: { region: "occidente", product: "rebar", horizon: 9 } }); } },
  { n: 5, key: "tb_items", target: "mix-lineplan", tag: "every item — demand matched to real lines (supply)",
    apply: function () { setState({ screen: "mix", filters: { region: "occidente", product: "rebar", horizon: 9 } }); } },
  { n: 6, key: "tb_tradeoff", target: "mix-tradeoff", tag: "constrained trade-off — you can't make everything",
    apply: function () { setState({ screen: "mix", filters: { region: "occidente", product: "rebar", horizon: 9 } }); } },
  { n: 7, key: "tb3", target: "capex-rec", tag: "capex decision — the big bet (BUILD)",
    apply: function () { setState({ screen: "capex", capex: { event: "boom" } }); } },
  { n: 8, key: "tb4", target: "capex-whatif", tag: "scenario planning — the engine behind both (flips the call)",
    apply: function () { setState({ screen: "capex", capex: { event: "compEnter" } }); } }
];

let idx = -1;
let nodes = null;

export function isTourActive() { return idx >= 0; }

export function startTour() {
  buildDom();
  idx = 0;
  showBeat();
}

export function endTour() {
  idx = -1;
  // reset any demo state the tour changed
  setState({ drivers: { leadOn: true, expanded: null }, capex: { event: "baseline" } });
  markTourDone();
  teardownDom();
  window.removeEventListener("resize", reposition);
  window.removeEventListener("scroll", reposition, true);
}

function showBeat() {
  const beat = BEATS[idx];
  beat.apply();                       // synchronous re-render via state subscriber
  updateTooltip(beat);
  // let layout + scroll settle, then spotlight
  setTimeout(function () {
    const el = beat.target && document.querySelector('[data-tour="' + beat.target + '"]');
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    setTimeout(reposition, 220);
  }, 40);
}

function reposition() {
  if (idx < 0 || !nodes) return;
  const beat = BEATS[idx];
  const el = beat.target ? document.querySelector('[data-tour="' + beat.target + '"]') : null;
  // Intro / no-target beat: hide the spotlight and center the card.
  if (!el) {
    nodes.highlight.style.display = "none";
    const t0 = nodes.tip;
    t0.style.left = Math.max(16, (window.innerWidth - t0.offsetWidth) / 2) + "px";
    t0.style.top = Math.max(16, (window.innerHeight - t0.offsetHeight) / 2) + "px";
    return;
  }
  nodes.highlight.style.display = "";
  const r = el.getBoundingClientRect();
  const pad = 8;
  const hl = nodes.highlight;
  hl.style.left = (r.left - pad) + "px";
  hl.style.top = (r.top - pad) + "px";
  hl.style.width = (r.width + pad * 2) + "px";
  hl.style.height = (r.height + pad * 2) + "px";

  // Place the tip to the SIDE so it doesn't cover the spotlighted content:
  // right → left → below → above, always clamped into the viewport.
  const tip = nodes.tip;
  const tw = tip.offsetWidth || 360;
  const th = tip.offsetHeight || 220;
  const gap = 14;
  const vw = window.innerWidth, vh = window.innerHeight;
  const vClamp = function (top) { return Math.max(16, Math.min(vh - th - 16, top)); };
  const hClamp = function (left) { return Math.max(16, Math.min(vw - tw - 16, left)); };
  let left, top;
  if (vw - r.right >= tw + gap) {            // to the right of the spotlight
    left = r.right + gap; top = vClamp(r.top);
  } else if (r.left >= tw + gap) {           // to the left
    left = r.left - gap - tw; top = vClamp(r.top);
  } else if (r.bottom + th + gap < vh) {     // below the element
    left = hClamp(r.left); top = r.bottom + gap;
  } else if (r.top - th - gap >= 16) {       // above — only if it genuinely fits
    left = hClamp(r.left); top = r.top - th - gap;
  } else {                                    // tall element (no side/above/below room):
    // pin to the bottom-RIGHT corner — the least-important area — so the element's
    // top-left title/tabs are always visible.
    left = vw - tw - 16; top = vh - th - 16;
  }
  tip.style.left = left + "px";
  tip.style.top = top + "px";
}

function updateTooltip(beat) {
  if (!nodes) return;
  nodes.beatNum.textContent = "STEP " + beat.n + " / " + BEATS.length;
  nodes.title.textContent = t(beat.key + "_title");
  nodes.body.textContent = t(beat.key + "_body");
  nodes.dots.innerHTML = BEATS.map(function (b, i) {
    return '<span class="tour-dot' + (i === idx ? " is-on" : "") + '"></span>';
  }).join("");
  nodes.back.style.visibility = idx > 0 ? "visible" : "hidden";
  nodes.back.textContent = getState().lang === "es" ? "← Atrás" : "← Back";
  nodes.next.textContent = idx === BEATS.length - 1
    ? (getState().lang === "es" ? "Terminar" : "Finish")
    : (getState().lang === "es" ? "Siguiente" : "Next");
}

function buildDom() {
  if (nodes) return;
  const root = document.getElementById("tour-root");
  root.innerHTML =
    '<div class="tour-catch"></div>' +
    '<div class="tour-highlight"></div>' +
    '<div class="tour-tip" role="dialog" aria-label="Guided tour">' +
      '<div class="tour-tip__head"><span class="tour-tip__num"></span>' +
        '<button class="tour-tip__skip" data-tour-act="skip">Skip ✕</button></div>' +
      '<div class="tour-tip__title"></div>' +
      '<div class="tour-tip__body"></div>' +
      '<div class="tour-tip__foot"><div class="tour-dots"></div>' +
        '<div class="tour-tip__btns">' +
          '<button class="btn-ghost btn-sm" data-tour-act="back"></button>' +
          '<button class="btn-primary btn-sm" data-tour-act="next"></button>' +
        '</div></div>' +
    '</div>';
  root.classList.add("show");
  nodes = {
    root: root,
    catch: root.querySelector(".tour-catch"),
    highlight: root.querySelector(".tour-highlight"),
    tip: root.querySelector(".tour-tip"),
    beatNum: root.querySelector(".tour-tip__num"),
    title: root.querySelector(".tour-tip__title"),
    body: root.querySelector(".tour-tip__body"),
    dots: root.querySelector(".tour-dots"),
    back: root.querySelector('[data-tour-act="back"]'),
    next: root.querySelector('[data-tour-act="next"]')
  };
  root.addEventListener("click", function (e) {
    const act = e.target.closest("[data-tour-act]");
    if (!act) return;
    const a = act.dataset.tourAct;
    if (a === "skip") endTour();
    else if (a === "back") { if (idx > 0) { idx--; showBeat(); } }
    else if (a === "next") { if (idx < BEATS.length - 1) { idx++; showBeat(); } else endTour(); }
  });
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, true);
}

function teardownDom() {
  const root = document.getElementById("tour-root");
  if (root) { root.classList.remove("show"); root.innerHTML = ""; }
  nodes = null;
}
