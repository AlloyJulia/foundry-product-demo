/* Foundry product-v2 — wiring + boot.
   Single subscriber re-renders on state change; event delegation on <body> means
   re-rendered controls keep working. Keyboard nav, chrome, toasts, notifications. */

import { BRAND, SESSION } from "./config.js";
import { getState, setState, subscribe, markTourDone } from "./state.js";
import { applyLang, setLang, t } from "./i18n.js";
import { renderOverview } from "./render/overview.js";
import { renderMix } from "./render/mix.js";
import { renderDrivers } from "./render/drivers.js";
import { renderCapex } from "./render/capex.js";
import { renderNext } from "./render/next.js";
import { startTour, isTourActive } from "./tour.js";

let lastScreen = null;

export function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function (s) {
    s.classList.toggle("active", s.id === "screen-" + id);
  });
  document.querySelectorAll(".railnav__item").forEach(function (b) {
    b.classList.toggle("is-active", b.dataset.screen === id);
  });
}

function render() {
  renderOverview(); renderMix(); renderDrivers(); renderCapex(); renderNext();
  applyLang(document);
  updateChrome();
  const scr = getState().screen;
  showScreen(scr);
  if (scr !== lastScreen) {
    lastScreen = scr;
    if (!isTourActive()) window.scrollTo({ top: 0, behavior: "smooth" });
    // Ambient realism: first visit to capex fires a committee notification.
    if (scr === "capex") maybeCommitteeNotif();
  }
}

function updateChrome() {
  document.querySelectorAll("[data-brand]").forEach(function (n) { n.textContent = BRAND; });
  const badge = document.getElementById("notif-badge");
  const notifs = getState().notifs;
  if (badge) {
    badge.textContent = notifs.length;
    badge.classList.toggle("show", notifs.length > 0);
  }
  const panel = document.getElementById("notif-list");
  if (panel) {
    panel.innerHTML = notifs.length
      ? notifs.map(function (n) { return '<li class="notif-item">' + t(n) + '</li>'; }).join("")
      : '<li class="notif-item notif-item--empty">' + t("notif_empty") + '</li>';
  }
  document.querySelectorAll(".lang-btn").forEach(function (b) {
    b.classList.toggle("active", b.dataset.lang === getState().lang);
  });
}

let committeeFired = false;
function maybeCommitteeNotif() {
  if (committeeFired) return;
  committeeFired = true;
  setTimeout(function () {
    setState({ notifs: getState().notifs.concat(["notif_committee"]) });
    toast("toast_committee");
  }, 1200);
}

/* ---- toast ---- */
export function toast(key) {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = t(key);
  root.appendChild(el);
  requestAnimationFrame(function () { el.classList.add("show"); });
  setTimeout(function () {
    el.classList.remove("show");
    setTimeout(function () { el.remove(); }, 300);
  }, 2600);
}

/* ---- filter change with shimmer ---- */
function changeFilter(name, val) {
  const card = document.getElementById("forecast-card");
  if (card) card.classList.add("is-loading");
  const patch = {};
  patch[name] = name === "horizon" ? parseInt(val, 10) : val;
  setTimeout(function () {
    setState({ filters: patch });
    toast("toast_updated");
  }, 250);
}

/* ---- event delegation ---- */
function onClick(e) {
  const goto = e.target.closest("[data-goto]");
  if (goto) { setState({ screen: goto.dataset.goto }); return; }

  const rail = e.target.closest(".railnav__item");
  if (rail) { setState({ screen: rail.dataset.screen }); return; }

  const filter = e.target.closest("[data-filter]");
  if (filter) { changeFilter(filter.dataset.filter, filter.dataset.val); return; }

  const ev = e.target.closest("[data-event]");
  if (ev) { setState({ capex: { event: ev.dataset.event } }); return; }

  const expand = e.target.closest("[data-expand]");
  if (expand) {
    const cur = getState().drivers.expanded;
    setState({ drivers: { expanded: cur === expand.dataset.expand ? null : expand.dataset.expand } });
    return;
  }

  if (e.target.closest("#lead-toggle")) {
    setState({ drivers: { leadOn: !getState().drivers.leadOn } });
    return;
  }

  if (e.target.closest("#start-tour-btn") || e.target.closest("#restart-tour-btn") || e.target.closest("#rail-tour-btn")) { startTour(); return; }

  const lang = e.target.closest(".lang-btn");
  if (lang) { setLang(lang.dataset.lang); return; }

  if (e.target.closest("#sample-pill")) { togglePop("sample-pop"); return; }
  if (e.target.closest("#notif-bell")) { togglePop("notif-pop"); return; }

  const cta = e.target.closest("#close-cta");
  if (cta) {
    const span = cta.querySelector("[data-i18n]");
    if (span) { span.setAttribute("data-i18n", "cta_clicked"); span.textContent = t("cta_clicked"); }
    cta.classList.add("is-clicked"); cta.disabled = true;
    return;
  }

  // click-away closes popovers
  if (!e.target.closest(".pop")) closeAllPops();
}

function togglePop(id) {
  const p = document.getElementById(id);
  if (!p) return;
  const open = p.classList.contains("show");
  closeAllPops();
  if (!open) p.classList.add("show");
}
function closeAllPops() {
  document.querySelectorAll(".pop.show").forEach(function (p) { p.classList.remove("show"); });
}

function onKey(e) {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  const order = ["next", "mix", "capex", "drivers", "overview"];
  const i = order.indexOf(getState().screen);
  if (e.key === "ArrowRight" && i < order.length - 1) setState({ screen: order[i + 1] });
  else if (e.key === "ArrowLeft" && i > 0) setState({ screen: order[i - 1] });
  else if (e.key === "?") startTour();
  else if (e.key === "/") { e.preventDefault(); const s = document.getElementById("search"); if (s) s.focus(); }
  else if (e.key === "Escape") closeAllPops();
}

/* ---- boot ---- */
function boot() {
  document.querySelectorAll("[data-brand]").forEach(function (n) { n.textContent = BRAND; });
  const u = document.getElementById("user-name"); if (u) u.textContent = SESSION.name;
  const ui = document.getElementById("user-initials"); if (ui) ui.textContent = SESSION.initials;

  subscribe(render);
  render();

  document.body.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);

  if (!getState().tourDone) setTimeout(startTour, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();

// expose for tour.js completion
export { markTourDone };
