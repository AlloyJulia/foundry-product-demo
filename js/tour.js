/* Foundry product-v2 — spotlight coachmark tour.
   7 beats, each: navigates + performs a live UI action (so the value prop is shown,
   not just told), spotlights a data-tour target, and states what it proves + the
   source artifact. Auto-starts first visit; restartable; Esc/Skip exits cleanly. */

import { getState, setState, markTourDone } from "./state.js";
import { t } from "./i18n.js";

/* Narrative order: data in → what it does (production, then capex) → scenario planning.
   1 step per output; scenario planning is the finale (the important beat). */
const BEATS = [
  { n: 1, target: "next-data", tag: "data in — one place",
    apply: function () { setState({ screen: "next" }); } },
  { n: 2, target: "mix-signal", tag: "production planning",
    apply: function () { setState({ screen: "mix", filters: { region: "occidente", product: "rebar", horizon: 9 } }); } },
  { n: 3, target: "capex-rec", tag: "capex planning",
    apply: function () { setState({ screen: "capex", capex: { event: "baseline" } }); } },
  { n: 4, target: "capex-whatif", tag: "scenario planning",
    apply: function () { setState({ screen: "capex", capex: { event: "compExit" } }); } }
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
    const el = document.querySelector('[data-tour="' + beat.target + '"]');
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    setTimeout(reposition, 220);
  }, 40);
}

function reposition() {
  if (idx < 0 || !nodes) return;
  const beat = BEATS[idx];
  const el = document.querySelector('[data-tour="' + beat.target + '"]');
  if (!el) return;
  const r = el.getBoundingClientRect();
  const pad = 8;
  const hl = nodes.highlight;
  hl.style.left = (r.left - pad) + "px";
  hl.style.top = (r.top - pad) + "px";
  hl.style.width = (r.width + pad * 2) + "px";
  hl.style.height = (r.height + pad * 2) + "px";

  // place tooltip below if room, else above
  const tip = nodes.tip;
  const tipH = tip.offsetHeight || 200;
  const below = r.bottom + tipH + 20 < window.innerHeight;
  tip.style.left = Math.max(16, Math.min(window.innerWidth - tip.offsetWidth - 16, r.left)) + "px";
  tip.style.top = (below ? r.bottom + pad + 12 : Math.max(16, r.top - tipH - 12)) + "px";
}

function updateTooltip(beat) {
  if (!nodes) return;
  nodes.beatNum.textContent = "STEP " + beat.n + " / " + BEATS.length;
  nodes.title.textContent = t("tb" + beat.n + "_title");
  nodes.body.textContent = t("tb" + beat.n + "_body");
  nodes.dots.innerHTML = BEATS.map(function (b, i) {
    return '<span class="tour-dot' + (i === idx ? " is-on" : "") + '"></span>';
  }).join("");
  nodes.back.style.visibility = idx > 0 ? "visible" : "hidden";
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
