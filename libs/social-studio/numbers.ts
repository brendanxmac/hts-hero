// Claude only words posts; it never supplies a figure. These check that every number it
// wrote is one the data states.

// Every number in a text, as written without thousands separators: "$1,250M" → ["1250"]
const numbersIn = (text: string) => (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, ""))

// True if every number in `text` is one the facts state (or a year, or a small count)
export const numbersCheck = (text: string, facts: string) => {
  const known = new Set<string>()
  numbersIn(facts).forEach((n) => {
    known.add(n)
    const v = Number(n)
    known.add(String(Math.round(v)))
    known.add(String(Math.round(v * 10) / 10))
  })
  return numbersIn(text).every((n) => known.has(n) || (Number(n) >= 2000 && Number(n) <= 2100) || Number(n) <= 12)
}
