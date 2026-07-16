/* Screen 2 — Production-Mix Signal. The core interactivity: live filters recompute
   the forecast, band, divergence alert, and recommended mix. Cold-start + empty states. */
import { t } from "../i18n.js";
import { getState } from "../state.js";
import { REGIONS, PRODUCTS, HORIZONS } from "../config.js";
import { forecastFor, divergence, mixFor, isHold, channelsFor, linePlanFor } from "../compute.js";
import { forecastChart, forecastLegend, mixBars, channelRows, linePlanRows } from "../charts.js";

export function renderMix() {
  const el = document.getElementById("screen-mix");
  if (!el) return;
  const st = getState();
  const f = st.filters;
  const fc = forecastFor(f);
  const div = divergence(f);
  const hold = isHold(f);

  el.innerHTML =
    '<div class="panel panel--wide">' +
      '<div class="dash-head">' +
        '<div>' +
          '<div class="eyebrow" data-i18n="s2_eyebrow">' + t("s2_eyebrow") + '</div>' +
          '<h1 data-i18n="s2_title">' + t("s2_title") + '</h1>' +
        '</div>' +
        '<span class="updated-chip" data-i18n="updated_ago">' + t("updated_ago") + '</span>' +
      '</div>' +

      '<div class="filters" data-tour="mix-region">' +
        filterGroup("region", "flt_region", REGIONS, f.region, "region_") +
        filterGroup("product", "flt_product", PRODUCTS, f.product, "product_") +
        filterGroup("horizon", "flt_horizon", HORIZONS, f.horizon, "horizon_") +
      '</div>' +

      (fc.empty
        ? '<div class="empty-state" data-i18n="mix_empty">' + t("mix_empty") + '</div>'
        : (hold
            ? holdBlock()
            : signalBlock(fc, div))) +

      '<div class="screen-nav">' +
        '<button class="btn-ghost" data-goto="next">← <span data-i18n="back">' + t("back") + '</span></button>' +
        '<button class="btn-primary" data-goto="capex"><span data-i18n="s2_cta">' + t("s2_cta") + '</span> →</button>' +
      '</div>' +
    '</div>';
}

function filterGroup(name, labelKey, opts, current, prefix) {
  const btns = opts.map(function (o) {
    const val = String(o);
    const active = String(current) === val ? " is-active" : "";
    return '<button class="filter-btn' + active + '" data-filter="' + name + '" data-val="' + val + '" data-i18n="' + prefix + val + '">' + t(prefix + val) + '</button>';
  }).join("");
  return '<div class="filter-group">' +
    '<span class="filter-group__label" data-i18n="' + labelKey + '">' + t(labelKey) + '</span>' +
    '<div class="filter-btns">' + btns + '</div>' +
    '</div>';
}

function signalBlock(fc, div) {
  const alert = div.material
    ? '<div class="alert-banner" data-tour="mix-alert">' +
        '<span class="alert-banner__icon">▲</span>' +
        '<div><strong data-i18n="s2_alert_strong">' + t("s2_alert_strong") + '</strong> ' +
        '<span>' + alertText(div) + '</span></div>' +
      '</div>'
    : '<div class="alert-banner alert-banner--calm" data-tour="mix-alert">' +
        '<span class="alert-banner__icon">✓</span>' +
        '<div><span>' + alertText(div) + '</span></div>' +
      '</div>';

  const f = getState().filters;

  return alert +
    '<div class="chart-card" id="forecast-card" data-tour="mix-signal">' +
      '<div class="chart-card__title"><span data-i18n="s2_chart_title">' + t("s2_chart_title") + '</span>' +
        '<span class="chart-card__unit" data-i18n="s2_chart_unit">' + t("s2_chart_unit") + '</span></div>' +
      '<div id="forecast-mount">' + forecastChart(fc.series, getState().lang) + '</div>' +
      '<div class="chart-legend">' + forecastLegend() + '</div>' +
    '</div>' +

    // Demand is not one number — it splits into channels, each modeled separately.
    '<div class="mix-block" data-tour="mix-channels">' +
      '<div class="mix-block__head">' +
        '<div class="eyebrow" data-i18n="s2_ch_eyebrow">' + t("s2_ch_eyebrow") + '</div>' +
        '<div class="mix-block__title" data-i18n="s2_ch_title">' + t("s2_ch_title") + '</div>' +
        '<div class="mix-block__sub" data-i18n="s2_ch_sub">' + t("s2_ch_sub") + '</div>' +
      '</div>' +
      '<div class="ch-rows">' + channelRows(channelsFor(f)) + '</div>' +
    '</div>' +

    // THE OUTPUT (per Bill/Allegion): recommended mix → matched to the real lines.
    '<div class="mix-block mix-block--results" data-tour="mix-lineplan">' +
      '<div class="mix-block__head">' +
        '<div class="eyebrow" data-i18n="s2_results_eyebrow">' + t("s2_results_eyebrow") + '</div>' +
        '<div class="mix-block__title" data-i18n="s2_mix_title">' + t("s2_mix_title") + '</div>' +
        '<div class="mix-block__sub" data-i18n="s2_mix_sub">' + t("s2_mix_sub") + '</div>' +
      '</div>' +
      '<div class="mix-legend">' +
        '<span class="mix-legend__item"><span class="mix-swatch mix-swatch--plan"></span><span data-i18n="s2_mix_plan">' + t("s2_mix_plan") + '</span></span>' +
        '<span class="mix-legend__item"><span class="mix-swatch mix-swatch--rec"></span><span data-i18n="s2_mix_rec">' + t("s2_mix_rec") + '</span></span>' +
      '</div>' +
      '<div class="mix-rows">' + mixBars(mixFor(f)) + '</div>' +

      // The next step Bill asked for: turn the mix into a line-by-line plan.
      '<div class="lp-head">' +
        '<div class="lp-head__title" data-i18n="s2_lp_title">' + t("s2_lp_title") + '</div>' +
        '<div class="mix-block__sub" data-i18n="s2_lp_sub">' + t("s2_lp_sub") + '</div>' +
      '</div>' +
      '<div class="lp-rows">' + linePlanRows(linePlanFor(f)) + '</div>' +
      linePlanCallout(f) +
    '</div>';
}

// A calm "it all fits" banner, or an alert when a line is over capacity — the point
// where a production question becomes a capex question.
function linePlanCallout(f) {
  const plan = linePlanFor(f);
  const over = plan.filter(function (l) { return l.verdict === "over"; });
  if (!over.length) {
    return '<div class="alert-banner alert-banner--calm">' +
      '<span class="alert-banner__icon">✓</span><div><span data-i18n="s2_lp_ok">' + t("s2_lp_ok") + '</span></div></div>';
  }
  const lineName = t("lp_" + over[0].key);
  const txt = getState().lang === "es"
    ? "<b>" + lineName + "</b> queda por encima de su capacidad con el volumen recomendado. Mantén inventario, desplaza carga a otra línea — o este es el disparador de la decisión de capex (construir / esperar / asociarse)."
    : "<b>" + lineName + "</b> runs over capacity on the recommended volume. Hold inventory, shift load to another line — or this is the trigger for the capex build / wait / partner call.";
  return '<div class="alert-banner"><span class="alert-banner__icon">▲</span><div><span>' + txt + '</span></div></div>';
}

function holdBlock() {
  return '<div class="mix-block" data-tour="mix-coldstart">' +
    '<div class="mix-coldstart mix-coldstart--full">' +
      '<span class="mix-coldstart__badge" data-i18n="s2_cold_badge">' + t("s2_cold_badge") + '</span>' +
      '<span data-i18n="s2_cold_text">' + t("s2_cold_text") + '</span>' +
    '</div>' +
  '</div>';
}

function alertText(div) {
  const st = getState();
  const region = t("region_" + st.filters.region);
  const product = t("product_" + st.filters.product);
  if (st.lang === "es") {
    return div.above
      ? "Foundry proyecta la demanda de " + product + " en " + region + " corriendo <b>+" + div.pct + "% por encima de tu plan vigente</b>. Si el plan se mantiene, es el patrón de desabastecimiento de 2025."
      : product + " en " + region + " sigue el plan (" + div.pct + "%) — sin desviación material.";
  }
  return div.above
    ? "Foundry projects " + region + " " + product + " demand running <b>+" + div.pct + "% above your standing plan</b>. If the plan holds, this is the 2025 stockout pattern."
    : region + " " + product + " is tracking plan (" + div.pct + "%) — no material divergence.";
}
