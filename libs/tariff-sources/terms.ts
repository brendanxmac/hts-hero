// Tariff words found in an item's title and summary. A quick first cut so the admin list can be
// narrowed to likely tariff items before anything is classified; not a verdict on relevance.

const TERMS: { label: string; pattern: RegExp }[] = [
  { label: "Tariff", pattern: /\btariffs?\b/i },
  { label: "Duty", pattern: /\bdut(y|ies)\b/i },
  { label: "HTS", pattern: /\bharmonized tariff schedule\b|\bHTS(US)?\b|\b9903\.\d\d/i },
  { label: "Section 232", pattern: /\bsection 232\b/i },
  { label: "Section 301", pattern: /\bsection 301\b/i },
  { label: "Section 122", pattern: /\bsection 122\b/i },
  { label: "Section 338", pattern: /\bsection 338\b/i },
  { label: "Section 201", pattern: /\bsection 201\b|\bsafeguard\b/i },
  { label: "IEEPA", pattern: /\bIEEPA\b|international emergency economic powers/i },
  { label: "Reciprocal", pattern: /\breciprocal\b/i },
  { label: "AD/CVD", pattern: /\bantidumping\b|\bcountervailing\b|\bAD\/CVD\b/i },
  { label: "Imports", pattern: /\bimports?\b|\bimportation\b|\bimported\b/i },
  { label: "Quota", pattern: /\bquotas?\b|\btariff[- ]rate quota\b/i },
  { label: "Exclusion", pattern: /\bexclusions?\b|\bexempt(ion|ions)?\b/i },
  { label: "De minimis", pattern: /\bde minimis\b/i },
  { label: "Trade deal", pattern: /\btrade agreement\b|\bframework agreement\b|\btrade deal\b|\bUSMCA\b/i },
]

export const TERM_LABELS = TERMS.map((t) => t.label)

export const matchTerms = (...texts: (string | null | undefined)[]) => {
  const text = texts.filter(Boolean).join(" \n ")
  return TERMS.filter((t) => t.pattern.test(text)).map((t) => t.label)
}
