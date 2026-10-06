import { describe, it, expect } from "./test-runner"
import { AllRules } from "../tariffs/engine-v2/data"
import { HtsElement } from "../interfaces/hts"
import { childLines, cleanAnswers, DutyCalculation, DutyInputError, findOrigin } from "../libs/mcp/duty"
import { analysisUrl, fullBreakdownUrl } from "../libs/mcp/links"
import { WIDGET_MIME_TYPE, widgetHtml } from "../libs/mcp/widget"

const line = (htsno: string, indent: number) => ({ uuid: `${htsno}-${indent}`, htsno, indent: String(indent) }) as HtsElement

describe("MCP server: inputs", () => {
  it("keeps answers to known questions in the type each expects", () => {
    const yesNo = AllRules.inputs.find((i) => i.type === "boolean")!
    const number = AllRules.inputs.find((i) => i.type === "percent" || i.type === "number")!
    const { answers, unknown } = cleanAnswers({ [yesNo.id]: "yes", [number.id]: "40", notAQuestion: true })
    expect(answers[yesNo.id]).toBe(true)
    expect(answers[number.id]).toBe(40)
    expect(unknown).toEqual(["notAQuestion"])
  })

  it("keeps an explicit no", () => {
    const yesNo = AllRules.inputs.find((i) => i.type === "boolean")!
    expect(cleanAnswers({ [yesNo.id]: false }).answers[yesNo.id]).toBe(false)
  })

  it("finds origins by code or name, and explains unknown ones", () => {
    expect(findOrigin("vn").code).toBe("VN")
    expect(findOrigin("China").code).toBe("CN")
    let error: unknown
    try {
      findOrigin("Narnia")
    } catch (e) {
      error = e
    }
    expect(error instanceof DutyInputError).toBe(true)
  })

  it("lists the statistical lines under an 8-digit line", () => {
    const elements = [line("6110.20.20", 2), line("", 3), line("6110.20.20.10", 4), line("6110.20.20.20", 4), line("6110.30", 1)]
    expect(childLines(elements[0], elements).map((e) => e.htsno)).toEqual(["6110.20.20.10", "6110.20.20.20"])
    expect(childLines(elements[2], elements).length).toBe(0)
  })
})

describe("MCP server: links back to HTS Hero", () => {
  const calc = {
    line: { element: line("7318.15.20.95", 3) },
    country: { code: "CN", name: "China", flag: "" },
    customsValue: 50000,
    quantity: 1000,
    asOf: "2026-10-06",
    transportMode: "ocean",
    answers: { steelContentPct: 40 },
    result: { claimedPreference: undefined },
  } as unknown as DutyCalculation
  const ctx = { client: "claude", tool: "calculate_import_duty" }

  it("opens the calculator with every input and UTM tags", () => {
    const url = new URL(fullBreakdownUrl(calc, ctx))
    expect(url.pathname).toBe("/duty-calculator")
    expect(url.searchParams.get("code")).toBe("7318.15.20.95")
    expect(url.searchParams.get("value")).toBe("50000")
    expect(url.searchParams.get("answers")).toBe("steelContentPct=40")
    expect(url.searchParams.get("utm_source")).toBe("claude")
    expect(url.searchParams.get("utm_medium")).toBe("mcp")
  })

  it("opens the Tariff Tracker's calculator on its Analysis", () => {
    const url = new URL(analysisUrl(calc, ctx))
    expect(url.pathname).toBe("/tariff-tracker")
    expect(url.searchParams.get("tab")).toBe("calculator")
    expect(url.searchParams.get("view")).toBe("analysis")
  })
})

describe("MCP server: duty card", () => {
  it("is an MCP App that initializes and reads tool results", () => {
    expect(WIDGET_MIME_TYPE).toBe("text/html;profile=mcp-app")
    expect(widgetHtml.includes('"ui/initialize"')).toBe(true)
    expect(widgetHtml.includes('"ui/notifications/tool-result"')).toBe(true)
    expect(widgetHtml.includes('"ui/open-link"')).toBe(true)
  })
})
