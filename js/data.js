/* Foundry product-v2 — seeded sample datasets.

   HONESTY: every number here is REPRESENTATIVE SAMPLE DATA used to show what the
   product interface looks like in use. It is NOT a real forecast, NOT a backtest,
   and NOT an analysis of any real company's data. The "Sample data" pill and the
   Screen-5 honesty panel repeat this. Do not treat these numbers as real evidence. */

/* ---- Screen 2: forward demand forecast, per region (kt/month) ----
   Indices 0-2 = last 3 actual months; index 2 = "today" (Jun); 3-11 = forecast.
   compute.forecastFor() scales these by product and slices to the horizon. */
export const FORECAST_BY_REGION = {
  occidente: {
    months_en: ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"],
    months_es: ["Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic","Ene","Feb","Mar"],
    todayIndex: 2,
    actual:   [38, 40, 41, null, null, null, null, null, null, null, null, null],
    median:   [null, null, 41, 43, 45, 47, 49, 50, 51, 52, 52.5, 53],
    bandLow:  [null, null, 41, 42, 43, 44, 45, 45, 45, 46, 46, 46],
    bandHigh: [null, null, 41, 44, 47, 50, 53, 55, 57, 58, 59, 60],
    plan:     [null, null, 41, 42, 42, 43, 43, 43, 43, 44, 44, 44]
  },
  // Central: a milder, near-plan region — the signal barely diverges, so the
  // alert should NOT fire strongly here (shows the filter genuinely recomputes).
  central: {
    months_en: ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"],
    months_es: ["Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic","Ene","Feb","Mar"],
    todayIndex: 2,
    actual:   [30, 31, 31, null, null, null, null, null, null, null, null, null],
    median:   [null, null, 31, 31.5, 32, 32.5, 33, 33, 33.5, 34, 34, 34.5],
    bandLow:  [null, null, 31, 30.5, 30.5, 31, 31, 31, 31, 31.5, 31.5, 32],
    bandHigh: [null, null, 31, 32.5, 33.5, 34.5, 35, 35.5, 36, 36.5, 37, 37.5],
    plan:     [null, null, 31, 31.5, 32, 32, 32.5, 32.5, 33, 33, 33.5, 34]
  },
  // Oriente: COLD START — under 6 months of clean data. No forecast is issued;
  // the product honestly holds to plan (an honest branch state).
  oriente: {
    coldStart: true,
    months_en: ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"],
    months_es: ["Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic","Ene","Feb","Mar"],
    todayIndex: 2,
    actual:   [12, 13, 13, null, null, null, null, null, null, null, null, null],
    median:   [null, null, null, null, null, null, null, null, null, null, null, null],
    bandLow:  [null, null, null, null, null, null, null, null, null, null, null, null],
    bandHigh: [null, null, null, null, null, null, null, null, null, null, null, null],
    plan:     [null, null, 13, 13, 13, 13.5, 13.5, 13.5, 14, 14, 14, 14]
  }
};

/* Per-product scaling of a region's rebar series (illustrative). Level scales the
   whole series; div scales how far the forecast pulls above plan (rebar diverges
   most — it is the surging line in the 2025-pattern story). */
export const PRODUCT_FACTOR = {
  rebar:   { level: 1.0,  div: 1.0 },
  wirerod: { level: 0.62, div: 0.55 },
  profile: { level: 0.48, div: 0.4 },
  mesh:    { level: 0.34, div: 0.3 }
};

/* ---- Screen 2: recommended mill mix, per region (share of rolling capacity) ---- */
export const MIX_BY_REGION = {
  occidente: [
    { key: "rebar",   plan: 44, rec: 51 },
    { key: "wirerod", plan: 24, rec: 21 },
    { key: "profile", plan: 19, rec: 17 },
    { key: "mesh",    plan: 13, rec: 11 }
  ],
  central: [
    { key: "rebar",   plan: 40, rec: 42 },
    { key: "wirerod", plan: 27, rec: 26 },
    { key: "profile", plan: 20, rec: 20 },
    { key: "mesh",    plan: 13, rec: 12 }
  ],
  // Cold start: hold to plan, no shift advised.
  oriente: [
    { key: "rebar",   plan: 46, rec: 46 },
    { key: "wirerod", plan: 22, rec: 22 },
    { key: "profile", plan: 20, rec: 20 },
    { key: "mesh",    plan: 12, rec: 12 }
  ]
};

/* ---- Screen 2: distribution channels — a separate demand model per channel ----
   Bill Ossen (Allegion, VP-level, interview 2026-07-15): wholesale and retail are
   different demand problems — "so if you can separate that, that is really valuable"
   — and each may need its own predictive model. Grupo AG steel sells through three
   channels; Foundry forecasts each with its own model, then rolls them up.
   share = % of the region's demand; dir = trend; modelKey = the model each uses. */
export const CHANNELS_BY_REGION = {
  occidente: [
    { key: "construction", share: 52, dir: "up",   modelKey: "chmodel_construction" },
    { key: "distributor",  share: 33, dir: "up",   modelKey: "chmodel_distributor" },
    { key: "retail",       share: 15, dir: "flat", modelKey: "chmodel_retail" }
  ],
  central: [
    { key: "construction", share: 44, dir: "flat", modelKey: "chmodel_construction" },
    { key: "distributor",  share: 39, dir: "up",   modelKey: "chmodel_distributor" },
    { key: "retail",       share: 17, dir: "flat", modelKey: "chmodel_retail" }
  ],
  oriente: [
    { key: "construction", share: 41, dir: "flat", modelKey: "chmodel_construction" },
    { key: "distributor",  share: 40, dir: "flat", modelKey: "chmodel_distributor" },
    { key: "retail",       share: 19, dir: "flat", modelKey: "chmodel_retail" }
  ]
};

/* ---- Screen 2: the OUTPUT — recommended production plan matched to the real lines ----
   Bill (Allegion, 2026-07-15) on the single most-needed next step: "do you take the
   output of this and say, okay, break this down into a production plan… what should I
   actually plan for?… It needs to match the actual lines available." So Foundry turns
   the recommended mix into a line-by-line load and flags where recommended demand
   exceeds available capacity (the trigger for the capex build/wait call).
   cap = line capacity (kt/mo); load = recommended load to meet the forecast mix;
   makes = the products each line can physically roll. */
export const LINES_BY_REGION = {
  occidente: [
    { key: "roll1", makes: ["rebar", "profile"], cap: 30, load: 31 },
    { key: "roll2", makes: ["rebar", "wirerod"], cap: 24, load: 22 },
    { key: "wire",  makes: ["wirerod", "mesh"],  cap: 12, load: 9 },
    { key: "mesh",  makes: ["mesh"],             cap: 7,  load: 5 }
  ],
  central: [
    { key: "roll1", makes: ["rebar", "profile"], cap: 26, load: 22 },
    { key: "roll2", makes: ["rebar", "wirerod"], cap: 20, load: 17 },
    { key: "wire",  makes: ["wirerod", "mesh"],  cap: 11, load: 8 },
    { key: "mesh",  makes: ["mesh"],             cap: 6,  load: 4 }
  ],
  oriente: [
    { key: "roll1", makes: ["rebar", "profile"], cap: 14, load: 9 },
    { key: "wire",  makes: ["wirerod", "mesh"],  cap: 6,  load: 4 }
  ]
};

/* ---- Screen 3: three aggregated signal CATEGORIES ----
   dir + weight are data; category meta text lives in i18n (cat_*). Indicator chips
   are inline-bilingual; lead:true marks the non-obvious LEADING indicators (the edge). */
export const CATEGORIES = [
  { key: "economic", dir: "up", dirClass: "up", weight: 46,
    inds: [
      { en: "GDP growth", es: "Crecimiento PIB" },
      { en: "Inflation", es: "Inflación" },
      { en: "Interest rate", es: "Tasa de interés" },
      { en: "Construction GDP", es: "PIB construcción" },
      { en: "Mining GDP", es: "PIB minería" },
      { en: "Subsidized imports (customs)", es: "Importaciones subsidiadas (aduanas)" },
      { en: "Global capacity vs. demand", es: "Capacidad mundial vs. demanda", lead: true },
      { en: "China / EM export flows", es: "Flujos de exportación China / EM", lead: true },
      { en: "Private construction investment", es: "Inversión privada en construcción", lead: true }
    ] },
  { key: "climate", dir: "up", dirClass: "up", weight: 22,
    inds: [
      { en: "CBAM / carbon price", es: "CBAM / precio al carbono" },
      { en: "Green-steel demand", es: "Demanda de acero verde", lead: true },
      { en: "Antidumping / countervailing", es: "Antidumping / compensatorios" },
      { en: "Trade protection", es: "Protección comercial" }
    ] },
  { key: "political", dir: "flat", dirClass: "flat", weight: 32,
    inds: [
      { en: "Elections", es: "Elecciones" },
      { en: "Pro-market vs. pro-social", es: "Pro-mercado vs. pro-social", lead: true },
      { en: "Institutional stability", es: "Estabilidad institucional" },
      { en: "Public-investment signals", es: "Señales de inversión pública", lead: true }
    ] }
];

/* ---- Screen 4 (closing beat): planning committee on one shared live model ---- */
export const COMMITTEE = [
  { key: "marketing", en: "Marketing", es: "Marketing", status: "submitted" },
  { key: "sales", en: "Sales", es: "Ventas", status: "submitted" },
  { key: "planning", en: "Forecast / Planning", es: "Pronóstico / Planeación", status: "editing" },
  { key: "finance", en: "Finance", es: "Finanzas", status: "submitted" },
  { key: "ops", en: "Operations", es: "Operaciones", status: "reviewing" },
  { key: "ceo", en: "CEO", es: "CEO", status: "notified" }
];

/* ---- Screen 3: leading-indicator mini chart (index, 0-70) ---- */
export const LEAD = {
  months_en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"],
  months_es: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct"],
  remit: [8, 14, 22, 31, 40, 48, 55, 60, 63, 65],   // Foundry edge — leads
  proxy: [5, 6, 8, 11, 16, 23, 32, 41, 49, 55]       // conventional — lags
};

/* ---- Screen 4: demand scenario fan (North rebar aggregate, kt/mo) ---- */
export const SCENARIO_BASE = {
  labels_en: ["2026", "", "", "", "2027", "", "", "", "2028"],
  labels_es: ["2026", "", "", "", "2027", "", "", "", "2028"],
  bull: [44, 47, 50, 54, 58, 62, 66, 70, 73],
  base: [44, 46, 47, 49, 50, 52, 53, 54, 55],
  bear: [44, 44, 45, 45, 46, 46, 47, 47, 48]
};

/* ---- Screen 4: break-even stress test ----
   The +150 kt/yr line must clear ~65% utilization to cover its cost structure and
   service ~$85M of capital (ILLUSTRATIVE threshold). */
export const BREAKEVEN_BASE = {
  threshold: 65,
  rows: [
    { key: "bull", prob: 30, util: 88 },
    { key: "base", prob: 45, util: 68 },
    { key: "bear", prob: 25, util: 46 }
  ]
};

/* ---- Screen 1 (Home): KPI tiles + alert inbox + activity feed (sample data) ---- */
export const HOME_KPIS = [
  { key: "alerts", value: "1", tone: "warn" },
  { key: "regions", value: "3", tone: "" },
  { key: "capex", value: "Q2 2027", tone: "" },
  { key: "confidence", value: "conf_moderate", tone: "", i18nValue: true }
];

// Alert inbox items. sev: warn | info | resolved.
export const HOME_ALERTS = [
  { key: "diverge", sev: "warn", goto: "mix", ago: "2h" },
  { key: "coldstart", sev: "info", goto: "mix", ago: "1d" },
  { key: "capexhold", sev: "resolved", goto: "capex", ago: "3d" }
];

// Recent activity feed.
export const HOME_ACTIVITY = [
  { key: "refresh", ago: "2h", who: "system" },
  { key: "committee", ago: "4h", who: "Marcelo A." },
  { key: "oriente", ago: "1d", who: "system" },
  { key: "capexopen", ago: "3d", who: "Julia R." }
];

/* ---- Screen 5 (Data & Model): data sources + model card (sample data) ---- */
// status: connected | sample | syncing. Labels resolved via i18n (dm_status_*).
export const DATA_SOURCES = [
  { en: "Competitor capacity tracker", es: "Rastreador de capacidad de competidores", type_en: "NEW · competitor capacity additions", type_es: "NUEVO · ampliaciones de capacidad de competidores", status: "sample", sync: "Jul 13" },
  { en: "OECD Steel Committee", es: "Comité del Acero OCDE", type_en: "NEW · global capacity vs. demand", type_es: "NUEVO · capacidad global vs. demanda", status: "sample", sync: "Jul 10" },
  { en: "National customs", es: "Aduanas nacionales", type_en: "NEW · import / dumping flows", type_es: "NUEVO · flujos de importación / dumping", status: "sample", sync: "Jul 11" },
  { en: "World Steel Association", es: "World Steel Association", type_en: "Demand outlook", type_es: "Panorama de demanda", status: "sample", sync: "Jul 12" },
  { en: "National central bank", es: "Banco central nacional", type_en: "Macro & construction indicators", type_es: "Indicadores macro y de construcción", status: "sample", sync: "Jul 13" },
  { en: "Weekly sales & orders", es: "Ventas y pedidos semanales", type_en: "Internal · your own weekly numbers", type_es: "Interno · tus propios números semanales", status: "syncing", sync: "auto" },
  { en: "Mill ERP", es: "ERP de la planta", type_en: "Internal · production & demand history", type_es: "Interno · producción e historial de demanda", status: "syncing", sync: "auto" }
];

/* ---- Screen 4: EVENT-DRIVEN scenario planning (ILLUSTRATIVE, client-side only) ---- */
export const EVENTS = {
  baseline: { shift: 0,  rec: { wait: 56, build: 29, partner: 15 }, be: 0,
    verdict: "wait", conf: "moderate",
    headKey: "s4_rec_headline", subKey: "s4_rec_sub", readKey: "ev_baseline_read",
    beLabelKey: "be_why_wait", beTextKey: "s4_be_readout" },
  boom: { shift: 12, rec: { wait: 22, build: 63, partner: 15 }, be: 15,
    verdict: "build", conf: "moderate",
    headKey: "ev_boom_head", subKey: "ev_boom_sub", readKey: "ev_boom_read",
    beLabelKey: "be_why_build", beTextKey: "ev_boom_be" },
  compEnter: { shift: -7, rec: { wait: 34, build: 11, partner: 55 }, be: -12,
    verdict: "partner", conf: "moderate",
    headKey: "ev_compEnter_head", subKey: "ev_compEnter_sub", readKey: "ev_compEnter_read",
    beLabelKey: "be_why_partner", beTextKey: "ev_compEnter_be" },
  climate: { shift: -4, rec: { wait: 60, build: 14, partner: 26 }, be: -8,
    verdict: "wait", conf: "low",
    headKey: "ev_climate_head", subKey: "ev_climate_sub", readKey: "ev_climate_read",
    beLabelKey: "be_why_wait", beTextKey: "ev_climate_be" },
  remit: { shift: -6, rec: { wait: 62, build: 13, partner: 25 }, be: -10,
    verdict: "wait", conf: "low",
    headKey: "ev_remit_head", subKey: "ev_remit_sub", readKey: "ev_remit_read",
    beLabelKey: "be_why_wait", beTextKey: "ev_remit_be" }
};
