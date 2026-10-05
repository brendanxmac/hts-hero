import { formatPct } from "../duty-calculator/lib/format";

// A duty rate rounded to two decimals, e.g. "27.5%"
export const formatRate = (value: number) => formatPct(Math.round(value * 100) / 100);
