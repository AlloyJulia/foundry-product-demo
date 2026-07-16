/* Foundry product-v2 — app config.
   Brand string lives HERE only (Palantir-Foundry rename risk, memo §5) — never
   hard-code "Foundry" across modules; import BRAND. */

export const BRAND = "Foundry";

// Mock signed-in session (no real auth — this is a demo workspace).
export const SESSION = {
  name: "Julia R.",
  role: "Planning",
  site: "Steelco",
  initials: "JR",
  lastLogin: "2 min ago"
};

export const SCREENS = ["next", "mix", "capex", "drivers", "overview"];

// Filter option keys (labels resolved via i18n).
export const REGIONS = ["occidente", "oriente", "central"];
export const PRODUCTS = ["rebar", "wirerod", "profile", "mesh"];
export const HORIZONS = [6, 9, 12];
// Distribution channel is a slice dimension (like product): flex the forecast to one
// channel, e.g. ferreterías · North · rebar. "all" = every channel combined.
export const CHANNELS = ["all", "construction", "distributor", "retail"];
