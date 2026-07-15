/* Screen 5 — Data & Model. A real product settings/data screen: sources +
   connection status, model card, refresh cadence, and the honest environment note
   (where the "sample data" disclosure lives, without a pitch). */
import { t } from "../i18n.js";
import { getState } from "../state.js";
import { DATA_SOURCES } from "../data.js";

export function renderNext() {
  const el = document.getElementById("screen-next");
  if (!el) return;
  const lang = getState().lang;

  const rows = DATA_SOURCES.map(function (s) {
    const name = lang === "es" ? s.es : s.en;
    const type = lang === "es" ? s.type_es : s.type_en;
    return '<tr>' +
      '<td class="dm-src">' + name + '</td>' +
      '<td class="dm-type">' + type + '</td>' +
      '<td><span class="dm-status dm-status--' + s.status + '">' + t("dm_status_" + s.status) + '</span></td>' +
      '<td class="dm-sync">' + s.sync + '</td>' +
    '</tr>';
  }).join("");

  el.innerHTML =
    '<div class="panel panel--wide">' +
      '<div class="eyebrow" data-i18n="dm_eyebrow">' + t("dm_eyebrow") + '</div>' +
      '<h1 data-i18n="dm_title">' + t("dm_title") + '</h1>' +
      '<p class="lede" data-i18n="dm_sub">' + t("dm_sub") + '</p>' +

      '<section class="dm-card" data-tour="next-data">' +
        '<div class="dm-card__title" data-i18n="dm_sources_title">' + t("dm_sources_title") + '</div>' +
        '<div class="dm-table-wrap"><table class="dm-table">' +
          '<thead><tr>' +
            '<th data-i18n="dm_col_source">' + t("dm_col_source") + '</th>' +
            '<th data-i18n="dm_col_type">' + t("dm_col_type") + '</th>' +
            '<th data-i18n="dm_col_status">' + t("dm_col_status") + '</th>' +
            '<th data-i18n="dm_col_sync">' + t("dm_col_sync") + '</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table></div>' +
      '</section>' +

      '<div class="dm-grid">' +
        '<section class="dm-card">' +
          '<div class="dm-card__title" data-i18n="dm_model_title">' + t("dm_model_title") + '</div>' +
          '<dl class="dm-defs">' +
            dmDef("dm_model_version_k", "dm_model_version_v") +
            dmDef("dm_model_method_k", "dm_model_method_v") +
            dmDef("dm_model_trained_k", "dm_model_trained_v") +
            dmDef("dm_model_conf_k", "dm_model_conf_v") +
          '</dl>' +
        '</section>' +
        '<section class="dm-card">' +
          '<div class="dm-card__title" data-i18n="dm_refresh_title">' + t("dm_refresh_title") + '</div>' +
          '<p class="dm-p" data-i18n="dm_refresh_text">' + t("dm_refresh_text") + '</p>' +
        '</section>' +
      '</div>' +

      '<div class="dm-env">' +
        '<span class="dm-env__glyph">◈</span>' +
        '<div><div class="dm-env__title" data-i18n="dm_env_title">' + t("dm_env_title") + '</div>' +
          '<p class="dm-env__text" data-i18n="dm_env_text">' + t("dm_env_text") + '</p></div>' +
      '</div>' +

      '<div class="screen-nav">' +
        '<button class="btn-ghost" data-goto="capex">← <span data-i18n="back">' + t("back") + '</span></button>' +
        '<button class="btn-ghost" data-goto="overview"><span data-i18n="nav1">' + t("nav1") + '</span></button>' +
      '</div>' +
    '</div>';
}

function dmDef(k, v) {
  return '<div class="dm-def"><dt data-i18n="' + k + '">' + t(k) + '</dt><dd data-i18n="' + v + '">' + t(v) + '</dd></div>';
}
