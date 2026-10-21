import { readFileSync } from "fs"
import { describe, it, expect } from "./test-runner"
import { countryFromName, countryOfCase } from "../libs/adcvd/countries"
import {
  caseNumbers,
  circumventionCountries,
  eventOf,
  frText,
  headerLine,
  htsCodes,
  itcCodes,
  itcNumbers,
  listGap,
  listRows,
  revokedCountries,
  scopeOf,
  titleParts,
} from "../libs/adcvd/parse"

// Reading AD/CVD notices (libs/adcvd/parse.ts), on real Federal Register texts saved under
// testing/fixtures/adcvd
const notice = (name: string) => frText(readFileSync(`testing/fixtures/adcvd/${name}.txt`, "utf8"))

describe("AD/CVD notices: case numbers and countries", () => {
  it("reads a notice's own cases from its header, not its footnotes", () => {
    expect(headerLine(notice("paprika-order"))).toBe("A-533-938, C-533-939")
    expect(caseNumbers(headerLine(notice("nails-orders-2021"))!)).toEqual(["A-580-874", "A-557-816", "A-523-808", "A-583-854", "A-552-818", "C-552-819"])
  })

  it("the middle of a case number is the country", () => {
    expect(countryOfCase("A-533-938")).toBe("IN")
    expect(countryOfCase("C-570-175")).toBe("CN")
    expect(countryOfCase("A-893-001")).toBe("BA")
    expect(countryOfCase("A-999-001")).toBe(null)
  })

  it("reads countries the way notices write them", () => {
    expect(countryFromName("the Sultanate of Oman")).toBe("OM")
    expect(countryFromName("People's Republic of China")).toBe("CN")
    expect(countryFromName("Republic of T[uuml]rkiye")).toBe("TR")
    expect(countryFromName("Socialist Republic of Vietnam")).toBe("VN")
    expect(countryFromName("Bosnia and Herzegovina")).toBe("BA")
    expect(countryFromName("Antidumping Duty Proceedings")).toBe(null)
  })

  it("expands ITC investigation numbers, one per country", () => {
    expect(itcNumbers("Investigation Nos. 701-TA-806 and 731-TA-1805-1807 (Preliminary)")).toEqual([
      "701-TA-806",
      "731-TA-1805",
      "731-TA-1806",
      "731-TA-1807",
    ])
    expect(itcNumbers("Inv. Nos. 701-\nTA-521 and 731-TA-1252-1255 and 1257 (Review)")).toEqual([
      "701-TA-521",
      "731-TA-1252",
      "731-TA-1253",
      "731-TA-1254",
      "731-TA-1255",
      "731-TA-1257",
    ])
    expect(itcNumbers("731-TA-1070-B")).toEqual(["731-TA-1070-B"])
  })
})

describe("AD/CVD notices: titles", () => {
  it("knows what kind of notice it is", () => {
    expect(eventOf("Oleoresin Paprika From India: Antidumping Duty Order and Countervailing Duty Order", "commerce")).toBe("order")
    expect(eventOf("Certain Steel Nails From the Sultanate of Oman: Preliminary Results and Intent To Rescind, in Part, Antidumping Duty Administrative Review; 2024-2025", "commerce")).toBe("review_prelim")
    expect(eventOf("Certain Walk-Behind Lawn Mowers and Parts Thereof From the People's Republic of China and the Socialist Republic of Vietnam: Final Results of Sunset Review and Revocation of Orders", "commerce")).toBe("revocation")
    expect(eventOf("Silicon Metal From Bosnia and Herzegovina, Iceland, Malaysia, and the Republic of Kazakhstan: Continuation of Antidumping Duty Orders and Countervailing Duty Order", "commerce")).toBe("continuation")
    expect(eventOf("Certain Brake Drums From the People's Republic of China: Preliminary Affirmative Determination of Circumvention of the Antidumping Duty and Countervailing Duty Orders", "commerce")).toBe("circumvention")
    expect(eventOf("Certain Freight Rail Couplers and Parts Thereof From India: Final Affirmative Countervailing Duty Determination", "commerce")).toBe("final")
    // A deadline moved is not a decision
    expect(eventOf("Large Diameter Graphite Electrodes From China: Postponement of Final Determination of Sales at Less Than Fair Value", "commerce")).toBe("other")
    expect(eventOf("Initiation of Antidumping and Countervailing Duty Administrative Reviews", "commerce")).toBe("list_review_init")
    expect(eventOf("Antidumping or Countervailing Duty Order, Finding, or Suspended Investigation; Opportunity To Request Administrative Review and Join Annual Inquiry Service List", "commerce")).toBe("list_opportunity")
    expect(eventOf("Initiation of Five-Year (Sunset) Reviews", "commerce")).toBe("list_sunset_init")
    expect(eventOf("Corrugated Pizza Boxes From China, Malaysia, and Turkey; Institution of Antidumping and Countervailing Duty Investigations and Scheduling of Preliminary Phase Investigations", "itc")).toBe("itc_institution")
    expect(eventOf("Fatty Acids From Indonesia and Malaysia; Scheduling of the Final Phase of Countervailing Duty and Antidumping Duty Investigations", "itc")).toBe("itc_schedule")
  })

  it("strips 'Antidumping and Countervailing Duty Orders on' from a product", () => {
    expect(titleParts("Antidumping and Countervailing Duty Orders on Crystalline Silicon Photovoltaic Cells From China: Notice of Court Decision").product).toBe("Crystalline Silicon Photovoltaic Cells")
  })

  it("an order in a combined title wins over the determination", () => {
    expect(eventOf("Corrosion-Resistant Steel Products From Brazil and Mexico: Amended Final Antidumping Duty Determination; Corrosion-Resistant Steel Products From Australia, Brazil, Canada: Antidumping Duty Orders", "commerce")).toBe("order")
  })

  it("names only the countries a mixed sunset notice revokes", () => {
    const title =
      "Certain Hot-Rolled Steel Flat Products From Australia, Brazil, Japan, the Republic of Korea, the Netherlands, the Republic of Turkey, and the United Kingdom: Continuation of Antidumping Duty Orders and Revocation of the Antidumping Duty Order on Certain Hot-Rolled Steel Flat Products From the United Kingdom"
    expect(revokedCountries(title)).toEqual(["United Kingdom"])
  })

  it("reads the product and countries", () => {
    expect(titleParts("Oleoresin Paprika From India: Antidumping Duty Order")).toEqual({ product: "Oleoresin Paprika", countries: ["India"] })
    expect(titleParts("Silicon Metal From Bosnia and Herzegovina, Iceland, Malaysia, and the Republic of Kazakhstan: Continuation").countries).toEqual([
      "Bosnia and Herzegovina",
      "Iceland",
      "Malaysia",
      "Republic of Kazakhstan",
    ])
    expect(titleParts("Corrugated Pizza Boxes From China, Malaysia, and Turkey; Institution of …").countries).toEqual(["China", "Malaysia", "Turkey"])
    expect(titleParts("Notice of Extension of the Deadline for Determining the Adequacy of the Antidumping and Countervailing Duty Petitions: Certain Corrugated Die-Cut Cardboard Boxes From China").product).toBe("Certain Corrugated Die-Cut Cardboard Boxes")
  })

  it("reads the countries a circumvention ruling reaches", () => {
    expect(circumventionCountries("Certain Corrosion-Resistant Steel Products From China: Affirmative Final Determination of Circumvention With Respect to Malaysia")).toEqual(["Malaysia"])
    expect(circumventionCountries("Aluminum Foil From China: Affirmative Determination of Circumvention; Foil Completed in the Republic of Korea and Thailand")).toEqual(["Republic of Korea", "Thailand"])
  })
})

describe("AD/CVD notices: scope and HTS codes", () => {
  it("reads HTS codes in every way notices write them", () => {
    expect(htsCodes("3203.00.8000, 7317.00.55.02, 4418.10 and 9903.88.01")).toEqual(["3203008000", "7317005502", "441810"])
  })

  it("sorts an order's codes into main and 'may also enter'", () => {
    const scope = scopeOf(notice("paprika-order"))!
    expect(scope.main).toEqual(["3203008000", "3301901010"])
    expect(scope.also).toEqual(["1301909190", "1302199140", "3205000500"])
    expect(scope.excluded).toEqual([])
  })

  it("codes that only describe excluded products are excluded, not covered", () => {
    // The nails scope names furniture headings (nails packed with unassembled furniture are
    // excluded) and powder-actuated tool nails: none of them is what the order covers
    const scope = scopeOf(notice("nails-orders-2021"))!
    expect(scope.main.includes("7317005502")).toBe(true)
    expect(scope.main.includes("441810")).toBe(false)
    expect(scope.excluded.includes("441810")).toBe(true)
    expect(scope.excluded.includes("7317002000")).toBe(true)
    expect(scope.also).toEqual(["8206000000"])
  })

  it("a code excluded in its own sentence stays out of the main list", () => {
    const scope = scopeOf(notice("silicon-metal-continuation"))!
    expect(scope.main).toEqual(["2804691000", "2804695000"])
    expect(scope.excluded).toEqual(["2804610000"])
  })

  it("annual review notices usually have no scope with codes", () => {
    expect(scopeOf(notice("nails-oman-prelim"))).toBe(null)
  })

  it("reads the codes an ITC notice names", () => {
    expect(itcCodes(notice("itc-pizza-boxes-institution"))).toEqual(["48191000"])
  })
})

describe("AD/CVD notices: list notices", () => {
  it("reads each case an annual review opportunity list names, with product and country", () => {
    const rows = listRows(notice("opportunity-to-request-review"))
    const flanges = rows.find((r) => r.case_number === "A-533-877")!
    expect(flanges.product).toBe("Stainless Steel Flanges")
    expect(flanges.country_name).toBe("India")
    // A row whose case number wraps onto the next line
    expect(rows.some((r) => r.case_number === "A-351-832")).toBe(true)
  })

  it("reads rows under a country heading, with names that wrap onto the next line", () => {
    const rows = listRows(notice("opportunity-list-september"))
    expect(rows.length).toBe(63)
    const wire = rows.find((r) => r.case_number === "A-588-843")!
    expect(wire.product).toBe("Stainless Steel Wire Rod")
    expect(wire.country_name).toBe("JAPAN")
    expect(rows.find((r) => r.case_number === "A-580-880")!.product).toBe("Heavy Walled Rectangular Welded Carbon Steel Pipes and Tubes")
    expect(rows.every((r) => r.country_name)).toBe(true)
  })

  it("finds no unread case numbers in a list read completely", () => {
    expect(listGap(notice("opportunity-list-september"))).toBe(0)
    expect(listGap("Welded ASTM A-312 Stainless Steel Pipe, A-580-810 ..... A-525- Thomas Martin")).toBe(1)
  })

  it("marks the cases under a list's Suspension Agreements heading", () => {
    const rows = listRows(notice("opportunity-to-request-review"))
    expect(rows.filter((r) => r.suspended).map((r) => r.case_number)).toEqual(["A-357-818", "A-821-802"])
  })

  it("links Commerce cases to ITC investigations from a sunset initiation table", () => {
    const rows = listRows(notice("sunset-initiation"))
    expect(rows.find((r) => r.case_number === "A-831-804")?.itc_number).toBe("731-TA-1538")
  })
})
