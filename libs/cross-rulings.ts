import type { CrossRuling, CrossRulingDetail } from "../interfaces/cross-rulings";

export async function fetchCrossRulingsBySearchTerm(
  term: string
): Promise<CrossRuling[]> {
  const res = await fetch(
    `/api/cross-rulings?term=${encodeURIComponent(term)}`
  );
  if (!res.ok) throw new Error("Failed to fetch rulings");
  return res.json();
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function pickStringList(primary: unknown, fallback: unknown): string[] {
  const fromPrimary = asStringList(primary);
  if (fromPrimary.length > 0) return fromPrimary;
  return asStringList(fallback);
}

/** Merge CBP detail (text/url, often-null lists) with search metadata so list fields are preserved. */
export function mergeRulingDetail(
  listRuling: CrossRuling,
  detail: CrossRulingDetail
): CrossRulingDetail {
  return {
    ...listRuling,
    ...detail,
    categories: detail.categories ?? listRuling.categories,
    relatedRulings: pickStringList(detail.relatedRulings, listRuling.relatedRulings),
    modifiedBy: pickStringList(detail.modifiedBy, listRuling.modifiedBy),
    modifies: pickStringList(detail.modifies, listRuling.modifies),
    revokedBy: pickStringList(detail.revokedBy, listRuling.revokedBy),
    revokes: pickStringList(detail.revokes, listRuling.revokes),
    tariffs: detail.tariffs ?? listRuling.tariffs,
  };
}

export async function fetchCrossRulingDetail(
  listRuling: CrossRuling
): Promise<CrossRulingDetail> {
  const res = await fetch(
    `/api/cross-rulings/${encodeURIComponent(listRuling.rulingNumber)}`
  );
  if (!res.ok) throw new Error("Failed to fetch ruling detail");
  const detail = (await res.json()) as CrossRulingDetail;
  return mergeRulingDetail(listRuling, detail);
}

/** CBP returns `tariffs` as a comma-separated string, not an array. */
export function parseRulingTariffs(tariffs: unknown): string[] {
  if (Array.isArray(tariffs)) {
    return tariffs
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof tariffs === "string") {
    return tariffs
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export function rulingIsRevoked(ruling: CrossRuling): boolean {
  return (
    Boolean(ruling.operationallyRevoked) ||
    Boolean(ruling.isRevokedByOperationalLaw) ||
    asStringList(ruling.revokedBy).length > 0
  );
}

export function trimHtsTo8Digits(code: string): string {
  const digits = code.replace(/\D/g, "");
  const trimmed = digits.slice(0, 8);
  if (trimmed.length <= 4) return trimmed;
  if (trimmed.length <= 6) return `${trimmed.slice(0, 4)}.${trimmed.slice(4)}`;
  return `${trimmed.slice(0, 4)}.${trimmed.slice(4, 6)}.${trimmed.slice(6)}`;
}

/** Manual CROSS search: normalize HTS-like input; otherwise send the trimmed string as-is. */
export function formatCrossSearchQuery(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 4) {
    return trimHtsTo8Digits(trimmed);
  }
  return trimmed;
}

export function normalizeRulingText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function formatRulingDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
