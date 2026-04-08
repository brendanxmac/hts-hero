/**
 * Shared HTS code normalization and validation (US HTS: 8- or 10-digit forms).
 */

/** Strip to digits only for comparison. */
export function htsCodeDigitsOnly(str: string): string {
  return str.replace(/\D/g, "");
}

/** True if the code has more than six digits (digits only). Used for BCP prompt branching and UI recommendation styling. */
export function isAboveSixDigits(code: string): boolean {
  return htsCodeDigitsOnly(code).length > 6;
}

/**
 * Normalize user input to dotted US HTS form when 8 or 10 digits are present.
 * Otherwise returns trimmed input unchanged.
 */
export function normalizeHtsCode(str: string): string {
  const digitsOnly = htsCodeDigitsOnly(str.trim());
  if (digitsOnly.length === 8) {
    return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}`;
  }
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}.${digitsOnly.slice(8, 10)}`;
  }
  return str.trim();
}

/** Compare two HTS strings as digit sequences (ignores dots and non-digits). */
export function htsCodesEqual(a: string, b: string): boolean {
  return htsCodeDigitsOnly(a) === htsCodeDigitsOnly(b);
}

/**
 * True if the input contains exactly 10 decimal digits (any non-digits ignored).
 * Accepts dotted, plain, or loosely spaced pastes so real schedule codes are not rejected.
 */
export function isValidTenDigitHtsInput(raw: string): boolean {
  const digits = htsCodeDigitsOnly(raw.trim());
  return digits.length === 10 && /^\d{10}$/.test(digits);
}

/** True if stripped input is exactly 8 or 10 digits (for search / selector flows). */
export function isValidEightOrTenDigitDigits(raw: string): boolean {
  const digits = htsCodeDigitsOnly(raw.trim());
  return /^\d{8}$|^\d{10}$/.test(digits);
}
