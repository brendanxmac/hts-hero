import { describe, it, expect } from "./test-runner"
import { canonicalHtsCode } from "../libs/hts-code"
import { encodeAnswers, parseAnswers } from "../components/duty-calculator/lib/estimate"

describe("duty calculator links: answers", () => {
  it("writes a yes as the question's id and other answers as id=value", () => {
    expect(
      encodeAnswers({ "confirm:9903.82.18": true, loadingDate: "2026-02-20", isDonation: undefined }),
    ).toBe("confirm:9903.82.18,loadingDate=2026-02-20")
  })

  it("reads back what it writes", () => {
    const answers = { "confirm:9903.82.18": true, isDonation: true, loadingDate: "2026-02-20" }
    expect(parseAnswers(encodeAnswers(answers))).toEqual(answers)
  })

  it("ignores unknown questions and values of the wrong type", () => {
    expect(parseAnswers("confirm:9999.99.99,loadingDate=soon,isDonation=maybe,,")).toEqual({})
    expect(parseAnswers(null)).toEqual({})
  })
})

describe("HTS code page addresses", () => {
  it("puts codes in the HTS's dotted form", () => {
    expect(canonicalHtsCode("7318.15.2095")).toBe("7318.15.20.95")
    expect(canonicalHtsCode("7318152095")).toBe("7318.15.20.95")
    expect(canonicalHtsCode("7318 15 20 95")).toBe("7318.15.20.95")
    expect(canonicalHtsCode("73181520")).toBe("7318.15.20")
    expect(canonicalHtsCode("731815")).toBe("7318.15")
    expect(canonicalHtsCode("7318")).toBe("7318")
    expect(canonicalHtsCode("7318.15.20.95")).toBe("7318.15.20.95")
  })

  it("leaves anything that isn't a 4-, 6-, 8- or 10-digit code", () => {
    expect(canonicalHtsCode("abc")).toBe(null)
    expect(canonicalHtsCode("73181")).toBe(null)
    expect(canonicalHtsCode("")).toBe(null)
  })
})
