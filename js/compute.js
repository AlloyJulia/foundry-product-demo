/* Foundry product-v2 — pure derivations (NO DOM).
   Everything here is a pure function of (filters | event | leadOn) over data.js.
   Unit-checkable in tests.html. All outputs are illustrative sample data. */

import {
  FORECAST_BY_REGION, PRODUCT_FACTOR, MIX_BY_REGION, CHANNELS_BY_REGION, LINES_BY_REGION,
  SCENARIO_BASE, BREAKEVEN_BASE, EVENTS, CATEGORIES
} from "./data.js";

/* Forward demand forecast for a region+product+horizon.
   Returns { coldStart, empty, series } where series carries scaled arrays. */
export function forecastFor(filters) {
  const base = FORECAST_BY_REGION[filters.region];
  if (!base) return { coldStart: false, empty: true, series: null };

  const f = PRODUCT_FACTOR[filters.product] || PRODUCT_FACTOR.rebar;
  const chShare = channelShareFor(filters);   // 1 for "all", else that channel's slice
  const today = base.todayIndex;
  // Forecast points available beyond "today":
  const maxIdx = base.actual.length - 1;
  const endIdx = Math.min(maxIdx, today + (filters.horizon || 9));

  function scale(arr, aroundPlan) {
    return arr.map(function (v, i) {
      if (v === null || i > endIdx) return null;
      const planV = base.plan[i];
      if (aroundPlan && planV !== null && v !== null) {
        // scale the divergence-from-plan by the product's div factor, level by level.
        return round1((planV * f.level + (v - planV) * f.level * f.div) * chShare);
      }
      return round1(v * f.level * chShare);
    });
  }

  const series = {
    months_en: base.months_en,
    months_es: base.months_es,
    todayIndex: today,
    endIndex: endIdx,
    actual: scale(base.actual, false),
    plan: scale(base.plan, false),
    median: scale(base.median, true),
    bandLow: scale(base.bandLow, true),
    bandHigh: scale(base.bandHigh, true)
  };

  return { coldStart: !!base.coldStart, empty: false, series: series };
}

/* Divergence of forecast median vs plan at the end of the horizon. */
export function divergence(filters) {
  const r = forecastFor(filters);
  if (r.coldStart || r.empty || !r.series) return { pct: 0, above: false, material: false };
  const s = r.series;
  const i = s.endIndex;
  const m = s.median[i], p = s.plan[i];
  if (m === null || p === null || p === 0) return { pct: 0, above: false, material: false };
  const pct = Math.round(((m - p) / p) * 100);
  return { pct: pct, above: pct > 0, material: Math.abs(pct) >= 8 };
}

/* Recommended mill mix for a region. */
export function mixFor(filters) {
  return (MIX_BY_REGION[filters.region] || MIX_BY_REGION.occidente).map(function (m) {
    return { key: m.key, plan: m.plan, rec: m.rec, delta: m.rec - m.plan };
  });
}

/* Demand split by distribution channel for a region (each channel = its own model). */
export function channelsFor(filters) {
  return CHANNELS_BY_REGION[filters.region] || CHANNELS_BY_REGION.occidente;
}

/* Channel as a slice dimension: fraction of the region's demand this channel represents.
   "all" (or unset) = 1 (every channel). Used to flex the forecast to one channel. */
export function channelShareFor(filters) {
  if (!filters.channel || filters.channel === "all") return 1;
  const chs = CHANNELS_BY_REGION[filters.region] || CHANNELS_BY_REGION.occidente;
  const c = chs.find(function (x) { return x.key === filters.channel; });
  return c ? c.share / 100 : 1;
}

/* Recommended production plan matched to the real lines: load vs. capacity + verdict.
   verdict: over (load > capacity) | tight (>=90% util) | fit. */
export function linePlanFor(filters) {
  const lines = LINES_BY_REGION[filters.region] || LINES_BY_REGION.occidente;
  return lines.map(function (l) {
    const util = Math.round((l.load / l.cap) * 100);
    const verdict = util > 100 ? "over" : (util >= 90 ? "tight" : "fit");
    return { key: l.key, makes: l.makes, cap: l.cap, load: l.load, util: util, verdict: verdict };
  });
}

/* Whether a region holds to plan (cold start). */
export function isHold(filters) {
  const base = FORECAST_BY_REGION[filters.region];
  return !!(base && base.coldStart);
}

/* ---- Screen 4 event-driven derivations ---- */
function eventOf(event) { return EVENTS[event] || EVENTS.baseline; }

export function recFor(event) {
  const ev = eventOf(event);
  return {
    verdict: ev.verdict, conf: ev.conf, rec: ev.rec,
    headKey: ev.headKey, subKey: ev.subKey, readKey: ev.readKey,
    beLabelKey: ev.beLabelKey, beTextKey: ev.beTextKey
  };
}

export function scenariosFor(event) {
  const ev = eventOf(event);
  const n = SCENARIO_BASE.base.length;
  function ramp(arr) {
    return arr.map(function (v, i) { return Math.max(38, round1(v + ev.shift * (i / (n - 1)))); });
  }
  return {
    labels_en: SCENARIO_BASE.labels_en, labels_es: SCENARIO_BASE.labels_es,
    bull: ramp(SCENARIO_BASE.bull), base: ramp(SCENARIO_BASE.base), bear: ramp(SCENARIO_BASE.bear)
  };
}

export function breakevenFor(event) {
  const ev = eventOf(event);
  return {
    threshold: BREAKEVEN_BASE.threshold,
    rows: BREAKEVEN_BASE.rows.map(function (r) {
      const util = Math.max(0, Math.min(100, r.util + ev.be));
      const verdict = util >= 72 ? "yes" : (util >= 62 ? "marginal" : "no");
      return { key: r.key, prob: r.prob, util: util, verdict: verdict };
    })
  };
}

/* ---- Screen 3: driver categories, with confidence effect when the lead is off ---- */
export function driversView(leadOn) {
  // When the leading indicator is off, weights of lead-heavy categories fall and
  // overall confidence widens (represented by confidencePenalty consumed by render).
  return {
    categories: CATEGORIES,
    leadOn: !!leadOn,
    confidencePenalty: leadOn ? 0 : 0.6   // 0..1, widens the band on the lead chart
  };
}

function round1(v) { return Math.round(v * 10) / 10; }
