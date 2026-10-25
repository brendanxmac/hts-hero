import { describe, it, expect } from "./test-runner"
import { FEATURES } from "../libs/compare/features"
import { COMPETITORS } from "../libs/compare/pages"

// Every claim the comparison pages make about another tool links the vendor page that shows it,
// with the date it was read; a "Not found" lists the pages searched instead. A claim about a
// competitor without dated, linked evidence doesn't ship.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const isUrl = (url: string) => /^https:\/\/[^\s]+$/.test(url)

describe("Comparison pages: evidence for every competitor value", () => {
  for (const tool of COMPETITORS) {
    it(`${tool.name}: every value is linked and dated`, () => {
      const missing: string[] = []
      for (const { key } of FEATURES) {
        const value = tool.features[key]
        if (value.support === "unknown") {
          const ok = !!value.searched && value.searched.urls.length > 0 && value.searched.urls.every(isUrl) && ISO_DATE.test(value.searched.checkedAt)
          if (!ok) missing.push(`${key} (unknown: no pages searched)`)
        } else {
          const e = value.evidence
          const ok = !!e && isUrl(e.url) && ISO_DATE.test(e.checkedAt) && (!e.quote || e.quote.split(/\s+/).length <= 25)
          if (!ok) missing.push(`${key} (${value.support}: no evidence)`)
        }
      }
      expect(missing).toEqual([])
    })
  }
})
