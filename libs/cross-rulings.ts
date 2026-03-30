import type { CrossRuling } from "../interfaces/cross-rulings";

export async function fetchCrossRulingsBySearchTerm(
  term: string
): Promise<CrossRuling[]> {
  const res = await fetch(
    `/api/cross-rulings?term=${encodeURIComponent(term)}`
  );
  if (!res.ok) throw new Error("Failed to fetch rulings");
  return res.json();
}

export function rulingIsRevoked(ruling: CrossRuling): boolean {
  return (
    ruling.operationallyRevoked ||
    ruling.isRevokedByOperationalLaw ||
    ruling.revokedBy.length > 0
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
