import type { CrossRuling } from "../interfaces/cross-rulings";

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
