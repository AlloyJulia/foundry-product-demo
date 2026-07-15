/* Screen 1 — Home. A real product dashboard: greeting, KPIs, alert inbox,
   workspace entry points, recent activity. No pitch framing. */
import { t } from "../i18n.js";
import { SESSION } from "../config.js";
import { HOME_KPIS, HOME_ALERTS, HOME_ACTIVITY } from "../data.js";

export function renderOverview() {
  const el = document.getElementById("screen-overview");
  if (!el) return;

  const kpis = HOME_KPIS.map(function (k) {
    const val = k.i18nValue ? t(k.value) : k.value;
    return '<div class="kpi kpi--' + (k.tone || "base") + '">' +
      '<div class="kpi__label">' + t("home_kpi_" + k.key) + '</div>' +
      '<div class="kpi__value">' + val + '</div>' +
    '</div>';
  }).join("");

  const alerts = HOME_ALERTS.map(function (a) {
    return '<button class="alert-row alert-row--' + a.sev + '" data-goto="' + a.goto + '">' +
      '<span class="alert-row__sev">' + t("sev_" + a.sev) + '</span>' +
      '<span class="alert-row__main">' +
        '<span class="alert-row__title">' + t("al_" + a.key + "_title") + '</span>' +
        '<span class="alert-row__text">' + t("al_" + a.key + "_text") + '</span>' +
      '</span>' +
      '<span class="alert-row__ago">' + a.ago + '</span>' +
      '<span class="alert-row__arrow" aria-hidden="true">→</span>' +
    '</button>';
  }).join("");

  const activity = HOME_ACTIVITY.map(function (a) {
    const line = a.who === "system"
      ? t("act_" + a.key)
      : '<b>' + a.who + '</b> ' + t("act_" + a.key);
    return '<li class="act-item"><span class="act-dot act-dot--' + (a.who === "system" ? "sys" : "user") + '"></span>' +
      '<span class="act-line">' + line + '</span><span class="act-ago">' + a.ago + '</span></li>';
  }).join("");

  el.innerHTML =
    '<div class="panel panel--wide">' +
      '<div class="home-head">' +
        '<div>' +
          '<h1 class="home-greet" data-i18n="greeting">' + t("greeting") + '</h1>' +
          '<p class="home-date" data-i18n="home_date">' + t("home_date") + '</p>' +
        '</div>' +
        '<span class="updated-chip" data-i18n="updated_ago">' + t("updated_ago") + '</span>' +
      '</div>' +

      '<div class="kpi-row">' + kpis + '</div>' +

      '<div class="home-cols">' +
        '<section class="home-block">' +
          '<div class="home-block__head"><h2 class="home-block__title" data-i18n="home_alerts_title">' + t("home_alerts_title") + '</h2></div>' +
          '<div class="alert-list">' + alerts + '</div>' +
        '</section>' +
        '<section class="home-block">' +
          '<div class="home-block__head"><h2 class="home-block__title" data-i18n="home_activity_title">' + t("home_activity_title") + '</h2></div>' +
          '<ul class="act-list">' + activity + '</ul>' +
        '</section>' +
      '</div>' +

      '<section class="home-block" data-tour="overview-outputs">' +
        '<div class="home-block__head"><h2 class="home-block__title" data-i18n="home_ws_title">' + t("home_ws_title") + '</h2></div>' +
        '<div class="ws-cards">' +
          wsCard("A", "mix") + wsCard("B", "capex") +
        '</div>' +
      '</section>' +
    '</div>';
}

function wsCard(which, goto) {
  return '<button class="ws-card" data-goto="' + goto + '">' +
    '<div class="ws-card__title" data-i18n="home_ws' + which + '_title">' + t("home_ws" + which + "_title") + '</div>' +
    '<div class="ws-card__desc" data-i18n="home_ws' + which + '_desc">' + t("home_ws" + which + "_desc") + '</div>' +
    '<div class="ws-card__foot"><span class="ws-card__meta" data-i18n="home_ws' + which + '_meta">' + t("home_ws" + which + "_meta") + '</span>' +
      '<span class="ws-card__open" data-i18n="home_open">' + t("home_open") + '</span> →</div>' +
  '</button>';
}
