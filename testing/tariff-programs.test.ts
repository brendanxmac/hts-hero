import { describe, it, expect } from "./test-runner"
import { AllRules } from "../tariffs/engine-v2/data"
import { headingAnswer, headingProfile, sinceLabel } from "../libs/tariff-programs/heading"
import { hubForProgram, PROGRAM_HUBS } from "../libs/tariff-programs/hubs"
import { hubLead, programPage } from "../libs/tariff-programs/program"
import { hubFaqs } from "../libs/tariff-programs/faqs"

// The Chapter 99 heading pages and the /tariffs program pages, built from the engine's records.
// AI answers quote these sentences word for word, so they're checked against facts we know.

const ASOF = "2026-10-26"

describe("Chapter 99 heading profiles", () => {
  it("describes an ended IEEPA heading in the past tense, with its end date and refund status", () => {
    const p = headingProfile("9903.01.25", ASOF)!
    expect(p.status).toBe("ended")
    expect(p.endsOn).toBe("2026-02-24")
    expect(p.rate).toBe("+10%")
    expect(p.hub?.slug).toBe("ieepa")
    expect(p.refund !== null).toBe(true)
    const answer = headingAnswer(p)
    expect(answer.includes("It added 10%")).toBe(true)
    expect(answer.includes("February 24, 2026")).toBe(true)
  })

  it("describes an in-force list heading with its country and code count", () => {
    const p = headingProfile("9903.88.03", ASOF)!
    expect(p.status).toBe("in-force")
    expect(p.rate).toBe("+25%")
    expect(p.countries.names).toEqual(["China"])
    expect(p.coverage.codes.length > 5000).toBe(true)
    expect(headingAnswer(p).includes("adds 25% to the regular duty on goods from China")).toBe(true)
    expect(sinceLabel(p)).toBe("Before 2025")
  })

  it("never writes 'undefined' or 'NaN' into a heading's answer", () => {
    const codes = Array.from(new Set(AllRules.tariffs.map((t) => t.code)))
    const bad = codes.filter((code) => {
      const p = headingProfile(code, ASOF)
      return p && /undefined|NaN|null/.test(headingAnswer(p))
    })
    expect(bad).toEqual([])
  })

  it("gives every program but the exemption-only ones a page", () => {
    const missing = AllRules.programs
      .filter((program) => !hubForProgram(program.id))
      .map((program) => program.id)
      .filter((id) => AllRules.tariffs.some((t) => t.program === id && (t.rate.kind === "adValorem" ? Number(t.rate.pct) > 0 : t.rate.kind === "topUpTo")))
    // Trade-deal and aircraft programs set lower rates for other programs' goods, quotas are reporting
    // lines, and Section 301 Nicaragua is 0% until its later phases (a page once it charges)
    expect(missing.filter((id) => !/^deal-|aircraft|quotas|301-nicaragua/.test(id))).toEqual([])
  })
})

describe("Tariff program pages", () => {
  it("has a heading in force or ended on every page, and a lead with no gaps", () => {
    for (const hub of PROGRAM_HUBS) {
      const page = programPage(hub, ASOF)
      expect(page.inForce.length + page.ended.length > 0).toBe(true)
      const lead = hubLead(page)
      expect(/undefined|NaN|null|Infinity/.test(lead)).toBe(false)
      hubFaqs(page, lead).forEach(([q, a]) => expect(/undefined|NaN|Infinity/.test(q + a)).toBe(false))
    }
  })

  it("lists Section 301 China's codes under Lists 1, 2, 3 and 4A", () => {
    const page = programPage(PROGRAM_HUBS.find((h) => h.slug === "section-301-china")!, ASOF)
    const headings = page.inForce.map((p) => p.code)
    ;["9903.88.01", "9903.88.02", "9903.88.03", "9903.88.15"].forEach((code) => expect(headings.includes(code)).toBe(true))
    expect(page.codes.length > 10000).toBe(true)
  })

  it("shows the IEEPA and Section 122 programs as ended", () => {
    for (const slug of ["ieepa", "section-122"]) {
      const page = programPage(PROGRAM_HUBS.find((h) => h.slug === slug)!, ASOF)
      expect(page.inForce.length).toBe(0)
      expect(hubLead(page).includes("no longer collected")).toBe(true)
    }
  })
})
