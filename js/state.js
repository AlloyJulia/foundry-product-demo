/* Foundry product-v2 — central state store.
   Unidirectional cycle: action -> setState(patch) -> subscribers re-render.
   Deliberately tiny; no framework. */

const TOUR_KEY = "foundry_v2_tour_done";

const state = {
  lang: "en",
  screen: "overview",
  filters: { region: "occidente", product: "rebar", horizon: 9 },
  drivers: { leadOn: true, expanded: null },
  capex: { event: "baseline" },
  notifs: [],
  loading: false,
  tourDone: (typeof localStorage !== "undefined" && localStorage.getItem(TOUR_KEY) === "1")
};

const subscribers = [];

export function getState() {
  return state;
}

/* Shallow-merge a patch (one level deep for nested objects we own), then notify. */
export function setState(patch) {
  Object.keys(patch).forEach(function (k) {
    const v = patch[k];
    if (v && typeof v === "object" && !Array.isArray(v) && typeof state[k] === "object") {
      state[k] = Object.assign({}, state[k], v);
    } else {
      state[k] = v;
    }
  });
  subscribers.forEach(function (fn) { fn(state); });
}

export function subscribe(fn) {
  subscribers.push(fn);
  return function () {
    const i = subscribers.indexOf(fn);
    if (i >= 0) subscribers.splice(i, 1);
  };
}

export function markTourDone() {
  state.tourDone = true;
  if (typeof localStorage !== "undefined") localStorage.setItem(TOUR_KEY, "1");
}
