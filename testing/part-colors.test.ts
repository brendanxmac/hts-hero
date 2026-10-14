import { describe, it, expect } from "./test-runner"
import { BASE_LABEL, FEES_LABEL, partColors, programSlot } from "../components/ui/charts/partColors"
import { CHART_COLORS, FEES_COLOR } from "../components/ui/theme"
import { AllRules } from "../tariffs/engine-v2/data"

// One color per tariff, the same on every chart (components/ui/charts/partColors)
const name = (id: string) => AllRules.programs.find((p) => p.id === id)!.name

describe("Chart colors: one per tariff", () => {
  it("base duty and fees keep their own colors", () => {
    const c = partColors([BASE_LABEL, FEES_LABEL])
    expect(c[BASE_LABEL]).toBe(CHART_COLORS[0])
    expect(c[FEES_LABEL]).toBe(FEES_COLOR)
  })

  it("a program has the same color whatever else is on the chart", () => {
    const alone = partColors([BASE_LABEL, name("301-china")])
    const withOthers = partColors([name("ieepa-reciprocal"), BASE_LABEL, name("ieepa-fentanyl-cn"), name("301-china")])
    expect(alone[name("301-china")]).toBe(withOthers[name("301-china")])
  })

  it("China's usual tariffs (301, fentanyl, reciprocal, a 232) get four different colors", () => {
    const ids = ["301-china", "ieepa-fentanyl-cn", "ieepa-reciprocal", "232-metals"]
    const c = partColors(ids.map(name))
    expect(new Set(ids.map((id) => c[name(id)])).size).toBe(4)
  })

  it("programs are slotted by their role", () => {
    expect(programSlot(name("301-china"))).toBe(1)
    expect(programSlot(name("ieepa-reciprocal"))).toBe(2)
    expect(programSlot(name("deal-eu"))).toBe(2)
    expect(programSlot(name("ieepa-fentanyl-mx"))).toBe(3)
    expect(programSlot(name("232-autos"))).toBe(4)
    expect(programSlot("Other")).toBe(4)
  })

  it("two programs of one slot on the same chart still get different colors", () => {
    const c = partColors([name("232-metals"), name("232-autos")])
    expect(c[name("232-metals")] === c[name("232-autos")]).toBe(false)
  })
})
