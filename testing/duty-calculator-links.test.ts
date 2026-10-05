import { describe, it, expect } from "./test-runner"
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
