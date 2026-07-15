/* Screen 3 — Signal Drivers (HERO / moat). Expandable categories + a leading-indicator
   toggle that visibly widens confidence when off. */
import { t } from "../i18n.js";
import { getState } from "../state.js";
import { CATEGORIES, LEAD } from "../data.js";
import { driversView } from "../compute.js";
import { leadChart, leadLegend } from "../charts.js";

export function renderDrivers() {
  const el = document.getElementById("screen-drivers");
  if (!el) return;
  const st = getState();
  const dv = driversView(st.drivers.leadOn);
  const expanded = st.drivers.expanded;
  const arrows = { up: "▲", flat: "▬", down: "▼" };

  const cards = CATEGORIES.map(function (cat) {
    const isOpen = expanded === cat.key;
    const chips = cat.inds.map(function (ind) {
      const label = st.lang === "es" ? ind.es : ind.en;
      return '<span class="cat-chip' + (ind.lead ? " cat-chip--lead" : "") + '">' +
        (ind.lead ? '<span class="cat-chip__lead">▲ ' + t("cat_lead_tag") + '</span>' : "") + label + '</span>';
    }).join("");
    return '<button class="driver-card cat-card' + (isOpen ? " is-open" : "") + '" data-expand="' + cat.key + '">' +
      '<div class="driver-card__top">' +
        '<span class="driver-dir driver-dir--' + cat.dirClass + '">' + arrows[cat.dir] + '</span>' +
        '<span class="driver-state">' + t("cat_" + cat.key + "_read") + '</span>' +
        '<span class="cat-caret" aria-hidden="true">' + (isOpen ? "−" : "+") + '</span>' +
      '</div>' +
      '<div class="driver-card__title">' + t("cat_" + cat.key + "_title") + '</div>' +
      (isOpen ? '<div class="cat-chips">' + chips + '</div>' +
        '<div class="driver-card__desc">' + t("cat_" + cat.key + "_desc") + '</div>' +
        '<div class="cat-src"><span class="cat-src__label">' + t("cat_src_label") + '</span>' + t("cat_" + cat.key + "_src") + '</div>' : "") +
      '<div class="driver-weight">' +
        '<div class="driver-weight__bar"><span style="width:' + cat.weight + '%"></span></div>' +
        '<div class="driver-weight__val">' + cat.weight + '% <span>' + t("drv_weight") + '</span></div>' +
      '</div>' +
    '</button>';
  }).join("");

  const leadOn = dv.leadOn;
  el.innerHTML =
    '<div class="panel panel--wide">' +
      '<div class="eyebrow" data-i18n="s3_eyebrow">' + t("s3_eyebrow") + '</div>' +
      '<h1 data-i18n="s3_title">' + t("s3_title") + '</h1>' +
      '<p class="lede" data-i18n="s3_lede">' + t("s3_lede") + '</p>' +
      '<p class="expand-hint" data-i18n="s3_expand_hint">' + t("s3_expand_hint") + '</p>' +
      '<div class="driver-grid">' + cards + '</div>' +

      '<div class="edge-card" data-tour="drivers-edge">' +
        '<div class="edge-card__head">' +
          '<span class="edge-badge" data-i18n="s3_edge_badge">' + t("s3_edge_badge") + '</span>' +
          '<div class="edge-card__title" data-i18n="s3_edge_title">' + t("s3_edge_title") + '</div>' +
        '</div>' +
        '<p class="edge-card__body" data-i18n="s3_edge_body">' + t("s3_edge_body") + '</p>' +
        '<div class="lead-controls">' +
          '<button class="lead-toggle' + (leadOn ? " is-on" : "") + '" id="lead-toggle" role="switch" aria-checked="' + leadOn + '">' +
            '<span class="lead-toggle__track"><span class="lead-toggle__knob"></span></span>' +
            '<span class="lead-toggle__label">' + (leadOn ? t("s3_lead_toggle_on") : t("s3_lead_toggle_off")) + '</span>' +
          '</button>' +
          '<span class="lead-toggle__hint" data-i18n="s3_lead_toggle_hint">' + t("s3_lead_toggle_hint") + '</span>' +
        '</div>' +
        '<div class="edge-example-label">' +
          '<span class="edge-example-tag" data-i18n="s3_lead_example_label">' + t("s3_lead_example_label") + '</span>' +
          '<span data-i18n="s3_lead_example_cap">' + t("s3_lead_example_cap") + '</span>' +
        '</div>' +
        '<div id="lead-mount">' + leadChart(LEAD, st.lang, { leadOn: leadOn }) + '</div>' +
        '<div class="chart-legend">' + leadLegend() + '</div>' +
        (leadOn ? "" : '<div class="lead-off-note" data-i18n="s3_lead_off_note">' + t("s3_lead_off_note") + '</div>') +
      '</div>' +

      '<div class="conflict-note">' +
        '<span class="conflict-note__label" data-i18n="s3_conflict_label">' + t("s3_conflict_label") + '</span>' +
        '<span data-i18n="s3_conflict_text">' + t("s3_conflict_text") + '</span>' +
      '</div>' +

      '<div class="screen-nav">' +
        '<button class="btn-ghost" data-goto="capex">← <span data-i18n="back">' + t("back") + '</span></button>' +
        '<button class="btn-primary" data-goto="overview"><span data-i18n="s3_cta">' + t("s3_cta") + '</span> →</button>' +
      '</div>' +
    '</div>';
}
