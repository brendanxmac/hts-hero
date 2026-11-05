import type { CrossEvidence, CrossRuling, CrossRulingDetail } from "../interfaces/cross-rulings";

// CBP's CROSS rulings. We don't search CROSS ourselves: CBP put its search behind reCAPTCHA, so
// searches open on rulings.cbp.gov in the user's own browser. A ruling the user names by number we
// do fetch (CBP's own site reads rulings by number without a token), one at a time, when they ask.

/** How we credit CBP wherever we show a ruling's content (CBP's copyright notice asks for it) */
export const CROSS_SOURCE_CREDIT = "Source: U.S. Customs and Border Protection, CROSS (rulings.cbp.gov)";

/** A CROSS search for `term` on CBP's site, the same address its own Search button goes to */
export function crossSearchUrl(term: string): string {
  const params = new URLSearchParams({
    term: term.trim(),
    collection: "ALL",
    commodityGrouping: "ALL",
    sortBy: "RELEVANCE",
    pageSize: "30",
    page: "1",
  });
  return `https://rulings.cbp.gov/search?${params.toString()}`;
}

/** A ruling's page on CBP's site */
export function crossRulingUrl(rulingNumber: string): string {
  return `https://rulings.cbp.gov/ruling/${encodeURIComponent(rulingNumber)}`;
}

/** What CBP numbers rulings like: N310000, H290000, W968396, and older ones like 960001 or D80000 */
export const RULING_NUMBER_PATTERN = /^[A-Z]?\d{5,6}$/;

/**
 * The ruling number CBP looks rulings up by, from what someone pasted: "NY N310000", "hq h290000",
 * "HQ 960001", or a rulings.cbp.gov/ruling/... link. Null when it isn't a ruling number.
 */
export function normalizeRulingNumber(input: string): string | null {
  let value = input.trim();
  const fromUrl = value.match(/rulings\.cbp\.gov\/ruling\/([^/?#\s]+)/i);
  if (fromUrl) value = decodeURIComponent(fromUrl[1]);
  value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // CBP shows the collection in front ("NY N310000", "HQ 960001"); its lookup takes the number alone
  const withoutCollection = value.replace(/^(NY|HQ)/, "");
  if (withoutCollection !== value && RULING_NUMBER_PATTERN.test(withoutCollection)) return withoutCollection;
  return RULING_NUMBER_PATTERN.test(value) ? value : null;
}

export type RulingLookupResult =
  | { status: "found"; ruling: CrossRulingDetail }
  | { status: "not_found" }
  | { status: "error" };

/** One ruling by its (normalized) number, through our cached route */
export async function fetchCrossRulingByNumber(rulingNumber: string): Promise<RulingLookupResult> {
  try {
    const res = await fetch(`/api/cross-rulings/${encodeURIComponent(rulingNumber)}`);
    if (res.status === 404) return { status: "not_found" };
    if (!res.ok) return { status: "error" };
    return { status: "found", ruling: (await res.json()) as CrossRulingDetail };
  } catch {
    return { status: "error" };
  }
}

/** The ruling as saved evidence: its details as they are now, plus the user's note */
export function rulingToEvidence(ruling: CrossRulingDetail, note = ""): CrossEvidence {
  return {
    rulingNumber: ruling.rulingNumber,
    collection: ruling.collection || null,
    subject: ruling.subject,
    rulingDate: ruling.rulingDate || null,
    tariffs: parseRulingTariffs(ruling.tariffs),
    revoked: rulingIsRevoked(ruling),
    note,
    addedAt: new Date().toISOString(),
  };
}

/** "NY N310000", how CBP writes a ruling's number */
export function rulingLabel(ruling: { collection?: string | null; rulingNumber: string }): string {
  return ruling.collection ? `${ruling.collection.toUpperCase()} ${ruling.rulingNumber}` : ruling.rulingNumber;
}

/** A ruling as a line for the classification notes, with its link and the source */
export function formatRulingReference(ruling: CrossRulingDetail): string {
  const parts = [rulingLabel(ruling), `— ${ruling.subject}`];
  if (ruling.rulingDate) parts.push(`(${formatRulingDate(ruling.rulingDate)})`);
  return `${parts.join(" ")}\n${crossRulingUrl(ruling.rulingNumber)}`;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
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

/** A typed CROSS search: an HTS code alone is cut to 8 digits (how CROSS cites codes); words go as typed */
export function formatCrossSearchQuery(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const isHtsCode = /^[\d.\s]+$/.test(trimmed) && trimmed.replace(/\D/g, "").length >= 4;
  return isHtsCode ? trimHtsTo8Digits(trimmed) : trimmed;
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
