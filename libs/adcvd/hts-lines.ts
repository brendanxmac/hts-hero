import type { HtsElement } from "../../interfaces/hts"

// Every statistical line of an HTS revision with its full description ("Furniture > Other metal
// furniture > … > Steel racks"), the way an import's description reads. An 8-digit line with no
// statistical lines is written as its 10 digits ending in 00, the way Census writes it.
export const htsLines = (elements: HtsElement[]) => {
  const lines: Record<string, string> = {}
  const eights = new Map<string, string>()
  const path: string[] = []
  for (const e of elements) {
    const indent = Number(e.indent) || 0
    path.length = indent
    path[indent] = e.description.trim().replace(/:$/, "")
    const digits = e.htsno.replace(/\D/g, "")
    if (digits.length === 10) lines[digits] = path.join(" > ")
    else if (digits.length === 8) eights.set(digits, path.join(" > "))
  }
  const withLines = new Set(Object.keys(lines).map((line) => line.slice(0, 8)))
  for (const [code, description] of eights) if (!withLines.has(code)) lines[`${code}00`] = description
  return lines
}
