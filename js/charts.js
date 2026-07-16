/* Foundry product-v2 — inline-SVG + CSS-bar visual builders.
   Each function returns an HTML/SVG string; callers set innerHTML. No dependencies.
   SVG roots carry class="chart-svg" so CSS transitions animate on repaint. */

import { t } from "./i18n.js";

// Shared palette — reads the venture design tokens, with literal fallbacks.
const C = {
  accent: "var(--role-accent, #ff6b35)",
  accent2: "var(--role-accent2, #ff9868)",
  title: "var(--role-title, #ffffff)",
  muted: "var(--role-body, #a9b4c8)",
  line: "var(--role-line, #2a3548)",
  alert: "var(--role-alert, #ef4444)"
};

function linePath(pts) {
  let d = "", started = false;
  pts.forEach(function (p) {
    if (p === null) { started = false; return; }
    d += (started ? " L" : " M") + p.x.toFixed(1) + "," + p.y.toFixed(1);
    started = true;
  });
  return d.trim();
}

/* ---- Screen 2: forward demand forecast (band + plan + today divider) ---- */
export function forecastChart(series, lang) {
  const W = 1000, H = 440, padL = 46, padR = 22, padT = 24, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = series.median.length;
  const months = lang === "es" ? series.months_es : series.months_en;

  // dynamic y-range from the data present
  const vals = [].concat(series.actual, series.median, series.bandHigh, series.bandLow, series.plan)
    .filter(function (v) { return v !== null && v !== undefined; });
  let yMin = Math.floor(Math.min.apply(null, vals) - 3);
  let yMax = Math.ceil(Math.max.apply(null, vals) + 3);
  if (!isFinite(yMin)) { yMin = 0; yMax = 10; }
  const step = niceStep((yMax - yMin) / 6);

  function xs(i) { return padL + (i / (n - 1)) * plotW; }
  function ys(v) { return padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH; }
  function pts(arr) { return arr.map(function (v, i) { return v === null ? null : { x: xs(i), y: ys(v) }; }); }

  let grid = "";
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
    const y = ys(v).toFixed(1);
    grid += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="' + C.line + '" stroke-width="1"/>' +
      '<text x="' + (padL - 8) + '" y="' + y + '" fill="' + C.muted + '" font-size="12" font-family="Roboto Mono, monospace" text-anchor="end" dominant-baseline="middle">' + v + '</text>';
  }
  const xlab = months.map(function (m, i) {
    if (i >= n) return "";
    return '<text x="' + xs(i).toFixed(1) + '" y="' + (H - padB + 22) + '" fill="' + C.muted + '" font-size="11.5" text-anchor="middle">' + m + '</text>';
  }).join("");

  let band = "";
  const hi = pts(series.bandHigh).filter(Boolean);
  const lo = pts(series.bandLow).filter(Boolean);
  if (hi.length && lo.length) {
    const poly = hi.map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ") + " " +
      lo.slice().reverse().map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ");
    band = '<polygon points="' + poly + '" fill="' + C.accent + '" opacity="0.13"/>';
  }

  const tx = xs(series.todayIndex).toFixed(1);
  const todayZone = '<rect x="' + tx + '" y="' + padT + '" width="' + (W - padR - parseFloat(tx)).toFixed(1) + '" height="' + plotH + '" fill="' + C.accent + '" opacity="0.03"/>';
  const todayLine = '<line x1="' + tx + '" y1="' + padT + '" x2="' + tx + '" y2="' + (padT + plotH) + '" stroke="' + C.accent2 + '" stroke-width="1.5" stroke-dasharray="3,3"/>' +
    '<text x="' + tx + '" y="' + (padT - 8) + '" fill="' + C.accent2 + '" font-size="11" font-family="Roboto Mono, monospace" text-anchor="middle">' + t("fc_today") + '</text>';

  function dots(arr, color) {
    return arr.map(function (v, i) { return v === null ? "" : '<circle cx="' + xs(i).toFixed(1) + '" cy="' + ys(v).toFixed(1) + '" r="3" fill="' + color + '"/>'; }).join("");
  }

  return '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Forward demand forecast">' +
    grid + todayZone + band + todayLine + xlab +
    '<path d="' + linePath(pts(series.plan)) + '" fill="none" stroke="' + C.muted + '" stroke-width="2.25" stroke-dasharray="7,5"/>' +
    '<path d="' + linePath(pts(series.median)) + '" fill="none" stroke="' + C.accent + '" stroke-width="2.75"/>' +
    '<path d="' + linePath(pts(series.actual)) + '" fill="none" stroke="' + C.title + '" stroke-width="3"/>' +
    dots(series.actual, C.title) + dots(series.median, C.accent) +
    '</svg>';
}

export function forecastLegend() {
  return '<div class="legend-group">' +
    '<div class="legend-item"><span class="legend-swatch" style="background:' + C.title + '"></span>' + t("fc_actual") + '</div>' +
    '<div class="legend-item"><span class="legend-swatch" style="background:' + C.accent + '"></span>' + t("fc_forecast") + '</div>' +
    '<div class="legend-item"><span class="legend-swatch legend-swatch--band"></span>' + t("fc_band") + '</div>' +
    '<div class="legend-item"><span class="legend-swatch legend-swatch--dash"></span>' + t("fc_plan") + '</div>' +
    '</div>';
}

/* ---- Screen 3: leading-indicator mini chart. widen=0..1 shifts proxy later + fades remit. ---- */
export function leadChart(LEAD, lang, opts) {
  opts = opts || {};
  const leadOn = opts.leadOn !== false;
  const W = 1000, H = 300, padL = 40, padR = 22, padT = 22, padB = 36;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = LEAD.remit.length, yMin = 0, yMax = 70;
  const months = lang === "es" ? LEAD.months_es : LEAD.months_en;

  function xs(i) { return padL + (i / (n - 1)) * plotW; }
  function ys(v) { return padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH; }
  function pts(arr) { return arr.map(function (v, i) { return { x: xs(i), y: ys(v) }; }); }

  let grid = "";
  for (let v = 0; v <= 70; v += 20) {
    const y = ys(v).toFixed(1);
    grid += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="' + C.line + '" stroke-width="1"/>';
  }
  const xlab = months.map(function (m, i) {
    return '<text x="' + xs(i).toFixed(1) + '" y="' + (H - padB + 22) + '" fill="' + C.muted + '" font-size="11.5" text-anchor="middle">' + m + '</text>';
  }).join("");

  const gx1 = xs(4), gx2 = xs(7);
  const gap = '<rect x="' + gx1.toFixed(1) + '" y="' + padT + '" width="' + (gx2 - gx1).toFixed(1) + '" height="' + plotH + '" fill="' + C.accent + '" opacity="' + (leadOn ? 0.1 : 0.02) + '"/>' +
    (leadOn ? '<text x="' + ((gx1 + gx2) / 2).toFixed(1) + '" y="' + (padT + 16) + '" fill="' + C.accent2 + '" font-size="11.5" font-family="Roboto Mono, monospace" text-anchor="middle">' + t("lead_gap") + '</text>' : "");

  // With the lead OFF, dim the leading-indicator line to show reliance on the lagging proxy.
  const remitLine = '<path d="' + linePath(pts(LEAD.remit)) + '" fill="none" stroke="' + C.accent + '" stroke-width="3" opacity="' + (leadOn ? 1 : 0.18) + '"/>';
  const proxyLine = '<path d="' + linePath(pts(LEAD.proxy)) + '" fill="none" stroke="' + (leadOn ? C.muted : C.title) + '" stroke-width="' + (leadOn ? 2.5 : 3) + '" stroke-dasharray="7,5"/>';

  return '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Leading indicator">' +
    grid + gap + xlab + proxyLine + remitLine +
    '</svg>';
}

export function leadLegend() {
  return '<div class="legend-group">' +
    '<div class="legend-item"><span class="legend-swatch" style="background:' + C.accent + '"></span>' + t("lead_remit") + '</div>' +
    '<div class="legend-item"><span class="legend-swatch legend-swatch--dash"></span>' + t("lead_proxy") + '</div>' +
    '</div>';
}

/* ---- Screen 4: demand-scenario fan ---- */
export function scenarioFan(scen, lang) {
  const W = 1000, H = 320, padL = 44, padR = 22, padT = 24, padB = 38;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = scen.base.length, yMin = 36, yMax = 90;
  const labels = lang === "es" ? scen.labels_es : scen.labels_en;

  function xs(i) { return padL + (i / (n - 1)) * plotW; }
  function ys(v) { return padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH; }
  function pts(arr) { return arr.map(function (v, i) { return { x: xs(i), y: ys(v) }; }); }

  let grid = "";
  for (let v = 40; v <= 80; v += 10) {
    const y = ys(v).toFixed(1);
    grid += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="' + C.line + '" stroke-width="1"/>' +
      '<text x="' + (padL - 8) + '" y="' + y + '" fill="' + C.muted + '" font-size="11.5" font-family="Roboto Mono, monospace" text-anchor="end" dominant-baseline="middle">' + v + '</text>';
  }
  let xlab = "";
  labels.forEach(function (m, i) {
    if (m) xlab += '<text x="' + xs(i).toFixed(1) + '" y="' + (H - padB + 22) + '" fill="' + C.muted + '" font-size="11.5" text-anchor="middle">' + m + '</text>';
  });

  return '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Demand scenarios">' +
    grid + xlab +
    '<path d="' + linePath(pts(scen.bear)) + '" fill="none" stroke="' + C.muted + '" stroke-width="2.25"/>' +
    '<path d="' + linePath(pts(scen.base)) + '" fill="none" stroke="' + C.title + '" stroke-width="2.75"/>' +
    '<path d="' + linePath(pts(scen.bull)) + '" fill="none" stroke="' + C.accent + '" stroke-width="2.75"/>' +
    '</svg>';
}

export function scenarioLegend() {
  return '<div class="legend-group">' +
    '<div class="legend-item"><span class="legend-swatch" style="background:' + C.accent + '"></span>' + t("scen_bull") + ' <span class="legend-item-when">30% ' + t("scen_prob") + '</span></div>' +
    '<div class="legend-item"><span class="legend-swatch" style="background:' + C.title + '"></span>' + t("scen_base") + ' <span class="legend-item-when">45% ' + t("scen_prob") + '</span></div>' +
    '<div class="legend-item"><span class="legend-swatch" style="background:' + C.muted + '"></span>' + t("scen_bear") + ' <span class="legend-item-when">25% ' + t("scen_prob") + '</span></div>' +
    '</div>';
}

/* ---- CSS-bar builders (mix rows, rec probability bars, break-even) ---- */
export function mixBars(rows) {
  return rows.map(function (m) {
    const deltaTxt = (m.delta > 0 ? "+" : "") + m.delta + " pp";
    const deltaClass = m.delta > 0 ? "mix-delta--up" : (m.delta < 0 ? "mix-delta--down" : "");
    return '<div class="mix-row">' +
      '<div class="mix-row__label">' + t("mix_" + m.key) + '</div>' +
      '<div class="mix-row__bars">' +
      '<div class="mix-bar mix-bar--plan"><span class="mix-bar__fill" style="width:' + m.plan + '%"></span><span class="mix-bar__val">' + m.plan + '%</span></div>' +
      '<div class="mix-bar mix-bar--rec"><span class="mix-bar__fill" style="width:' + m.rec + '%"></span><span class="mix-bar__val">' + m.rec + '%</span></div>' +
      '</div>' +
      '<div class="mix-row__delta ' + deltaClass + '">' + deltaTxt + '</div>' +
      '</div>';
  }).join("");
}

/* ---- Screen 2: demand by distribution channel — one row per channel, each tagged
   with the distinct model it is forecast with (wholesale ≠ retail ≠ projects). ---- */
export function channelRows(rows) {
  const arrow = { up: "▲", down: "▼", flat: "→" };
  return rows.map(function (c) {
    return '<div class="ch-row">' +
      '<div class="ch-row__label">' + t("ch_" + c.key) +
        '<span class="cat-chip"><span class="cat-chip__lead">MODEL</span>' + t(c.modelKey) + '</span></div>' +
      '<div class="ch-track"><span class="ch-fill" style="width:' + c.share + '%"></span></div>' +
      '<div class="ch-row__share"><span class="ch-dir ch-dir--' + c.dir + '">' + arrow[c.dir] + '</span>' + c.share + '%</div>' +
      '</div>';
  }).join("");
}

/* ---- Screen 2: production plan matched to the real rolling lines (load vs capacity) ---- */
export function linePlanRows(rows) {
  return rows.map(function (l) {
    const makes = l.makes.map(function (m) { return '<span class="cat-chip">' + t("mix_" + m) + '</span>'; }).join("");
    return '<div class="lp-row">' +
      '<div class="lp-row__line">' + t("lp_" + l.key) + '<div class="lp-makes">' + makes + '</div></div>' +
      '<div class="lp-track">' +
        '<span class="lp-fill lp-fill--' + l.verdict + '" style="width:' + Math.min(100, l.util) + '%"></span>' +
        '<span class="lp-load">' + l.load + ' / ' + l.cap + ' kt</span>' +
      '</div>' +
      '<div class="lp-verdict lp-verdict--' + l.verdict + '">' + l.util + '% · ' + t("lp_" + l.verdict) + '</div>' +
      '</div>';
  }).join("");
}

export function probBars(rec, verdict) {
  const rows = [
    { key: "wait", val: rec.wait, cls: "rec-bar--wait" },
    { key: "build", val: rec.build, cls: "rec-bar--build" },
    { key: "partner", val: rec.partner, cls: "rec-bar--partner" }
  ];
  return rows.map(function (r) {
    let whisker = "";
    if (r.key === verdict) {
      const lo = Math.max(0, r.val - 8), hi = Math.min(100, r.val + 7);
      whisker = '<span class="rec-whisker" style="left:' + lo + '%;right:' + (100 - hi) + '%"></span>';
    }
    return '<div class="rec-bar-row">' +
      '<div class="rec-bar-label">' + t("rec_" + r.key) + '</div>' +
      '<div class="rec-bar-track"><span class="rec-bar-fill ' + r.cls + '" style="width:' + r.val + '%"></span>' + whisker + '</div>' +
      '<div class="rec-bar-val">' + r.val + '%</div>' +
      '</div>';
  }).join("");
}

export function breakevenBars(be) {
  const th = be.threshold;
  return '<div class="be-rows">' +
    be.rows.map(function (r, i) {
      const markLabel = i === 0 ? '<span class="be-mark-label" style="left:' + th + '%">' + t("s4_be_threshold") + '</span>' : "";
      return '<div class="be-row">' +
        '<div class="be-row__label">' + t("scen_" + r.key) + '<span class="be-row__prob">' + r.prob + '% ' + t("scen_prob") + '</span></div>' +
        '<div class="be-track">' + markLabel +
        '<span class="be-fill be-fill--' + r.verdict + '" style="width:' + r.util + '%"></span>' +
        '<span class="be-mark" style="left:' + th + '%"></span>' +
        '<span class="be-util">' + r.util + '%</span>' +
        '</div>' +
        '<div class="be-verdict be-verdict--' + r.verdict + '">' + t("s4_be_" + r.verdict) + '</div>' +
        '</div>';
    }).join("") +
    '</div>';
}

function niceStep(raw) {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const nice = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return Math.max(1, nice * pow);
}
