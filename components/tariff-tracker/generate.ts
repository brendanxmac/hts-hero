import { Countries } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { htsCodeDigitsOnly } from "../../libs/hts-code";

// For development: random catalogs of real products (HTS codes that exist today, with real
// countries of origin), to try the tracker at any size

// The largest US import partners, for catalogs that look like real ones
const COMMON_ORIGINS = [
  "CN", "MX", "CA", "VN", "DE", "JP", "KR", "TW", "IN", "IT", "TH", "IE", "CH", "GB", "MY", "FR", "ID", "BR", "SG", "NL",
];

export type OriginPool = "common" | "all";

export const generateProducts = (
  htsElements: HtsElement[],
  count: number,
  origins: OriginPool,
  random: () => number = Math.random
): string => {
  const codes = htsElements.filter((el) => htsCodeDigitsOnly(el.htsno).length === 10).map((el) => el.htsno);
  const countries =
    origins === "common"
      ? COMMON_ORIGINS.filter((code) => Countries.some((c) => c.code === code))
      : Countries.filter((c) => c.code !== "US").map((c) => c.code);
  if (!codes.length || !countries.length) return "";

  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];
  const seen = new Set<string>();
  const lines: string[] = [];
  // Distinct pairs; gives up rather than loop forever if asked for more than exist
  for (let tries = 0; lines.length < count && tries < count * 20; tries++) {
    const line = `${pick(codes)},${pick(countries)}`;
    if (seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }
  return lines.join("\n");
};
