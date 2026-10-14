import { describe, it, expect } from "./test-runner"
import { bandScale, linearScale, niceMax, niceTicks, stepIndexAt, time, timeScale } from "../components/ui/charts/kit/scales"
import { nearestIndex } from "../components/ui/charts/kit/hover"

// The shared chart kit's maths (d3 underneath): what every chart's axes and hover rest on
describe("Chart kit: scales", () => {
  it("maps values to pixels and back", () => {
    const y = linearScale([0, 50], [200, 0])
    expect(y(0)).toBe(200)
    expect(y(25)).toBe(100)
    expect(y.invert(0)).toBe(50)
  })

  it("rounds the top to a readable tick, and never to zero", () => {
    expect(niceMax(141.5)).toBe(150)
    expect(niceMax(44)).toBe(50)
    expect(niceMax(1.4)).toBe(1.5)
    expect(niceMax(0)).toBe(1)
  })

  it("ticks are round, distinct numbers even for small ranges", () => {
    expect(niceTicks(0, 50, 4).join(",")).toBe("0,10,20,30,40,50")
    const small = niceTicks(0, 1.6, 3)
    expect(new Set(small).size).toBe(small.length)
  })

  it("places calendar dates in UTC, so a date never shifts with the time zone", () => {
    const x = timeScale("2025-01-01", "2025-01-11", [0, 100])
    expect(x.at("2025-01-01")).toBe(0)
    expect(x.at("2025-01-06")).toBe(50)
    expect(x(time("2025-01-11"))).toBe(100)
  })

  it("date ticks fall on round dates", () => {
    const x = timeScale("2025-01-01", "2026-01-01", [0, 800])
    expect(x.dateTicks(4).every((d) => d.endsWith("-01"))).toBe(true)
  })

  it("bands fit the range with gaps", () => {
    const b = bandScale(["a", "b"], [0, 100], 0.2)
    expect(b.at("a") >= 0).toBe(true)
    expect(b.at("b") + b.bandwidth <= 100).toBe(true)
  })

  it("finds the step in force at a point, and the nearest point", () => {
    const starts = [0, 10, 30]
    expect(stepIndexAt(starts, -5)).toBe(0)
    expect(stepIndexAt(starts, 10)).toBe(1)
    expect(stepIndexAt(starts, 29)).toBe(1)
    expect(stepIndexAt(starts, 99)).toBe(2)
    expect(nearestIndex(starts, 21)).toBe(2)
    expect(nearestIndex([], 5)).toBe(0)
  })
})
