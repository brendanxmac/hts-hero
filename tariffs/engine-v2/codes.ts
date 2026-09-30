// HTS code matching. Codes are compared as digits only, by prefix:
// "7326" matches 7326.90.86.88, "7326.90" matches 7326.90.xx.xx but not 7326.11.

export const htsDigits = (code: string) => code.replace(/\D/g, "")

export const matchesPrefix = (htsCode: string, prefix: string) => {
  const digits = htsDigits(prefix)
  return digits.length > 0 && htsDigits(htsCode).startsWith(digits)
}

// True if any member of `prefixes` is a prefix of `htsCode`
export const matchesAnyPrefix = (htsCode: string, prefixes: Iterable<string>) => {
  const code = htsDigits(htsCode)
  for (const prefix of prefixes) {
    const digits = htsDigits(prefix)
    if (digits.length > 0 && code.startsWith(digits)) return true
  }
  return false
}
