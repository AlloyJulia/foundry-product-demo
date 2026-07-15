/* Screen 4 — Capex Build / Wait / Partner. What-if engine drives the recommendation,
   scenario fan, break-even, and committee closing beat. */
import { t } from "../i18n.js";
import { getState } from "../state.js";
import { COMMITTEE } from "../data.js";
import { recFor, scenariosFor, breakevenFor } from "../compute.js";
import { scenarioFan, scenarioLegend, probBars, breakevenBars } from "../charts.js";

const EVENT_KEYS = ["baseline", "compExit", "compEnter", "policy"];

export function renderCapex() {
  const el = document.getElementById("screen-capex");
  if (!el) return;
  const st = getState();
  const event = st.capex.event;
  const rec = recFor(event);
  const scen = scenariosFor(event);
  const be = breakevenFor(event);

  const chips = EVENT_KEYS.map(function (k) {
    return '<button class="whatif-chip' + (k === event ? " active" : "") + '" data-event="' + k + '" data-i18n="ev_' + k + '">' + t("ev_" + k) + '</button>';
  }).join("");

  const committee = COMMITTEE.map(function (r) {
    const name = st.lang === "es" ? r.es : r.en;
    const initials = name.split(/[\s/]+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase();
    return '<div class="crole crole--' + r.status + '">' +
      '<span class="crole__avatar">' + initials + '</span>' +
      '<span class="crole__info"><span class="crole__name">' + name + '</span>' +
      '<span class="crole__status"><span class="crole__dot"></span>' + t("comm_st_" + r.status) + '</span></span>' +
      '</div>';
  }).join("");

  const whatifReadout = event !== "baseline"
    ? '<div class="whatif__readout show"><span class="whatif-readout__tag">' + t("s4_whatif_effect") + '</span>' + t(rec.readKey) + '</div>'
    : '';

  el.innerHTML =
    '<div class="panel panel--wide">' +
      '<div class="eyebrow" data-i18n="s4_eyebrow">' + t("s4_eyebrow") + '</div>' +
      '<h1 data-i18n="s4_title">' + t("s4_title") + '</h1>' +

      '<div class="decision-context">' +
        dc("s4_dc1_k", t("s4_dc1_v")) + dc("s4_dc2_k", t("s4_dc2_v")) +
        dc("s4_dc3_k", t("s4_dc3_v")) + dc("s4_dc4_k", t("s4_dc4_v")) +
      '</div>' +

      '<div class="rec-card" data-tour="capex-rec">' +
        '<div class="rec-card__badge-col">' +
          '<div class="rec-verdict rec-verdict--' + rec.verdict + '">' + t("rec_" + rec.verdict) + '</div>' +
          '<div class="rec-confidence"><span data-i18n="s4_rec_conf">' + t("s4_rec_conf") + '</span>: <b>' + t("conf_" + rec.conf) + '</b></div>' +
        '</div>' +
        '<div class="rec-card__body">' +
          '<div class="rec-headline">' + t(rec.headKey) + '</div>' +
          '<div class="rec-sub">' + t(rec.subKey) + '</div>' +
          '<div class="rec-bars">' + probBars(rec.rec, rec.verdict) + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="whatif" data-tour="capex-whatif">' +
        '<div class="whatif__head">' +
          '<span class="whatif__label" data-i18n="s4_whatif_label">' + t("s4_whatif_label") + '</span>' +
          '<span class="whatif__intro" data-i18n="s4_whatif_intro">' + t("s4_whatif_intro") + '</span>' +
        '</div>' +
        '<div class="whatif__chips">' + chips + '</div>' +
        whatifReadout +
      '</div>' +

      '<div class="capex-grid">' +
        '<div class="capex-panel">' +
          '<div class="capex-panel__title" data-i18n="s4_scen_title">' + t("s4_scen_title") + '</div>' +
          '<div id="scenario-mount">' + scenarioFan(scen, st.lang) + '</div>' +
          '<div class="chart-legend">' + scenarioLegend() + '</div>' +
        '</div>' +
        '<div class="capex-panel">' +
          '<div class="capex-panel__title" data-i18n="s4_timing_title">' + t("s4_timing_title") + '</div>' +
          '<div class="timing-window">' +
            '<div class="timing-window__now" data-i18n="s4_timing_now">' + t("s4_timing_now") + '</div>' +
            '<div class="timing-window__bar">' +
              '<div class="timing-seg timing-seg--wait" style="flex:2"><span data-i18n="s4_timing_seg1">' + t("s4_timing_seg1") + '</span></div>' +
              '<div class="timing-seg timing-seg--review" style="flex:1"><span data-i18n="s4_timing_seg2">' + t("s4_timing_seg2") + '</span></div>' +
              '<div class="timing-seg timing-seg--build" style="flex:1"><span data-i18n="s4_timing_seg3">' + t("s4_timing_seg3") + '</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="trigger-box">' +
            '<div class="trigger-box__label" data-i18n="s4_trigger_label">' + t("s4_trigger_label") + '</div>' +
            '<div class="trigger-box__text" data-i18n="s4_trigger_text">' + t("s4_trigger_text") + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="capex-panel be-panel">' +
        '<div class="capex-panel__title" data-i18n="s4_be_title">' + t("s4_be_title") + '</div>' +
        '<p class="be-sub" data-i18n="s4_be_sub">' + t("s4_be_sub") + '</p>' +
        '<div class="be-legend"><span class="be-legend__mark"></span><span data-i18n="s4_be_threshold_note">' + t("s4_be_threshold_note") + '</span></div>' +
        '<div id="breakeven-mount">' + breakevenBars(be) + '</div>' +
        '<div class="be-readout">' +
          '<span class="be-readout__label">' + t(rec.beLabelKey) + '</span>' +
          '<span>' + t(rec.beTextKey) + '</span>' +
        '</div>' +
      '</div>' +

      '<div class="capex-panel">' +
        '<div class="capex-panel__title" data-i18n="s4_sens_title">' + t("s4_sens_title") + '</div>' +
        '<div class="sens-rows">' +
          sens("build", "→ BUILD", "s4_sens1") +
          sens("partner", "→ PARTNER", "s4_sens2") +
          sens("wait", "→ HOLD WAIT", "s4_sens3") +
        '</div>' +
      '</div>' +

      '<div class="cost-block">' +
        '<div class="cost-block__title" data-i18n="s4_cost_title">' + t("s4_cost_title") + '</div>' +
        '<div class="cost-cards">' +
          '<div class="cost-card">' +
            '<div class="cost-card__tag" data-i18n="s4_cost1_tag">' + t("s4_cost1_tag") + '</div>' +
            '<div class="cost-card__value">' + t("s4_cost1_value") + '<span class="cost-card__unit" data-i18n="s4_cost1_unit">' + t("s4_cost1_unit") + '</span></div>' +
            '<div class="cost-card__label" data-i18n="s4_cost1_label">' + t("s4_cost1_label") + '</div>' +
          '</div>' +
          '<div class="cost-card cost-card--alert">' +
            '<div class="cost-card__tag" data-i18n="s4_cost2_tag">' + t("s4_cost2_tag") + '</div>' +
            '<div class="cost-card__value" data-i18n="s4_cost2_value">' + t("s4_cost2_value") + '</div>' +
            '<div class="cost-card__label" data-i18n="s4_cost2_label">' + t("s4_cost2_label") + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="committee committee--closing">' +
        '<div class="committee__head">' +
          '<div class="eyebrow" data-i18n="s4_comm_eyebrow">' + t("s4_comm_eyebrow") + '</div>' +
          '<div class="committee__title" data-i18n="s4_comm_title">' + t("s4_comm_title") + '</div>' +
          '<div class="committee__sub" data-i18n="s4_comm_sub">' + t("s4_comm_sub") + '</div>' +
        '</div>' +
        '<div class="committee-roles">' + committee + '</div>' +
      '</div>' +

      '<div class="screen-nav">' +
        '<button class="btn-ghost" data-goto="drivers">← <span data-i18n="back">' + t("back") + '</span></button>' +
        '<button class="btn-primary" data-goto="next"><span data-i18n="s4_cta">' + t("s4_cta") + '</span> →</button>' +
      '</div>' +
    '</div>';
}

function dc(k, v) {
  return '<div class="dc-item"><span class="dc-item__k" data-i18n="' + k + '">' + t(k) + '</span><span class="dc-item__v">' + v + '</span></div>';
}
function sens(kind, arrow, key) {
  return '<div class="sens-row sens-row--' + kind + '"><span class="sens-arrow">' + arrow + '</span><span data-i18n="' + key + '">' + t(key) + '</span></div>';
}
