// The estimate in the page's URL, so a quote can be shared as a link: the page reads it on the
// server and the estimator writes it back as options change. Only the options that matter for
// the current choices are written (no pairs while Tariff Tracker is off), so links stay short.
import { Billing, ClassifyPlanId, EstimateInput, TeamOption } from "./pricing";

export const DEFAULT_BILLING: Billing = "monthly";

export const DEFAULT_INPUT: EstimateInput = {
  calculator: true,
  tracker: true,
  pairs: 100,
  classify: true,
  audience: "individual",
  individualPlan: "pro",
  seats: 6,
  teamOption: "workspace",
};

export const MAX_PAIRS = 100000;
export const MIN_SEATS = 2;
export const MAX_SEATS = 500;

export type EstimateState = { billing: Billing; input: EstimateInput };

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const flag = (value: string | undefined, fallback: boolean) =>
  value === "1" ? true : value === "0" ? false : fallback;

const whole = (value: string | undefined, min: number, max: number, fallback: number) => {
  const n = Number(value);
  return value && Number.isInteger(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const oneOf = <T extends string>(value: string | undefined, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

// Anything missing or malformed falls back to the defaults
export const parseEstimateParams = (params: SearchParams): EstimateState => {
  const get = (key: string) => first(params[key]);
  const d = DEFAULT_INPUT;
  return {
    billing: oneOf<Billing>(get("billing"), ["monthly", "annual"], DEFAULT_BILLING),
    input: {
      calculator: flag(get("calculator"), d.calculator),
      tracker: flag(get("tracker"), d.tracker),
      pairs: whole(get("pairs"), 1, MAX_PAIRS, d.pairs),
      classify: flag(get("classify"), d.classify),
      audience: get("who") === "team" ? "team" : get("who") === "me" ? "individual" : d.audience,
      individualPlan: oneOf<Exclude<ClassifyPlanId, "team">>(get("plan"), ["starter", "pro"], d.individualPlan),
      seats: whole(get("seats"), MIN_SEATS, MAX_SEATS, d.seats),
      teamOption: oneOf<TeamOption>(get("team"), ["workspace", "licenses"], d.teamOption),
    },
  };
};

export const toEstimateParams = ({ billing, input }: EstimateState) => {
  const params = new URLSearchParams({ billing });
  params.set("calculator", input.calculator ? "1" : "0");
  params.set("tracker", input.tracker ? "1" : "0");
  if (input.tracker) params.set("pairs", String(input.pairs));
  params.set("classify", input.classify ? "1" : "0");
  if (input.classify) {
    params.set("who", input.audience === "team" ? "team" : "me");
    if (input.audience === "individual") {
      params.set("plan", input.individualPlan);
    } else {
      params.set("seats", String(input.seats));
      params.set("team", input.teamOption);
    }
  }
  return params.toString();
};
