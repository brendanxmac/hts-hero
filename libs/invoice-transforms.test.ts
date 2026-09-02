import { describe, it, expect } from "../testing/test-runner";
import {
  applyInvoiceTransforms,
  parseNumericValue,
  toggleInvoiceTransform,
  type InvoiceTransformId,
} from "./invoice-transforms";
import type { DocumentRow } from "./trade-documents";

const row = (
  overrides: Partial<DocumentRow> = {}
): DocumentRow => ({
  _rowId: "1",
  hs_code: "8507.60.00",
  country_of_origin: "china",
  description: "  lithium   batteries  ",
  unit_price: "$12.45678",
  line_amount: "1,234.5",
  invoice_date: "15/03/2024",
  currency: "US Dollar",
  unit_of_measure: "pieces",
  quantity: "1,000",
  ...overrides,
});

const apply = (
  source: DocumentRow,
  enabled: InvoiceTransformId[]
): DocumentRow => applyInvoiceTransforms([source], enabled)[0];

describe("toggleInvoiceTransform", () => {
  it("turns a rule on and off", () => {
    const on = toggleInvoiceTransform([], "uppercase");
    expect(on).toEqual(["uppercase"]);
    expect(toggleInvoiceTransform(on, "uppercase")).toEqual([]);
  });

  it("makes 2-decimal and 4-decimal rounding exclusive", () => {
    const withTwo = toggleInvoiceTransform([], "round2");
    expect(toggleInvoiceTransform(withTwo, "round4")).toEqual(["round4"]);
    const withFour = toggleInvoiceTransform([], "round4");
    expect(toggleInvoiceTransform(withFour, "round2")).toEqual(["round2"]);
  });
});

describe("applyInvoiceTransforms", () => {
  it("does not mutate the source row", () => {
    const source = row();
    apply(source, ["htsSanitize", "uppercase"]);
    expect(source.hs_code).toBe("8507.60.00");
    expect(source.country_of_origin).toBe("china");
  });

  it("preserves row ids", () => {
    const result = apply(row(), ["uppercase"]);
    expect(result._rowId).toBe("1");
  });

  it("strips HTS punctuation", () => {
    expect(apply(row(), ["htsSanitize"]).hs_code).toBe("85076000");
  });

  it("pads 8-digit HTS codes to 10 digits", () => {
    expect(apply(row({ hs_code: "85076000" }), ["htsPad10"]).hs_code).toBe(
      "8507600000"
    );
  });

  it("sanitizes then pads HTS codes", () => {
    expect(apply(row(), ["htsSanitize", "htsPad10"]).hs_code).toBe("8507600000");
  });

  it("uppercases text", () => {
    expect(apply(row(), ["uppercase"]).country_of_origin).toBe("CHINA");
  });

  it("maps country names to ISO codes", () => {
    expect(apply(row(), ["countryIso"]).country_of_origin).toBe("CN");
    expect(
      apply(row({ country_of_origin: "United States" }), ["countryIso"])
        .country_of_origin
    ).toBe("US");
    expect(
      apply(row({ country_of_origin: "UK" }), ["countryIso"]).country_of_origin
    ).toBe("GB");
  });

  it("maps currency names to ISO codes", () => {
    expect(apply(row(), ["currencyIso"]).currency).toBe("USD");
    expect(apply(row({ currency: "eur" }), ["currencyIso"]).currency).toBe(
      "EUR"
    );
  });

  it("rounds unit values to 2 or 4 decimals", () => {
    expect(apply(row(), ["round2"]).unit_price).toBe("12.46");
    expect(apply(row(), ["round4"]).unit_price).toBe("12.4568");
  });

  it("converts day-first dates to ISO", () => {
    expect(apply(row(), ["isoDates"]).invoice_date).toBe("2024-03-15");
    expect(
      apply(row({ invoice_date: "03/15/2024" }), ["isoDates"]).invoice_date
    ).toBe("2024-03-15");
  });

  it("trims extra whitespace", () => {
    expect(apply(row(), ["trimWhitespace"]).description).toBe(
      "lithium batteries"
    );
  });

  it("strips currency symbols and thousands separators", () => {
    expect(apply(row(), ["stripCurrency"]).line_amount).toBe(1234.5);
    expect(apply(row(), ["stripCurrency"]).quantity).toBe(1000);
  });

  it("standardizes units of measure", () => {
    expect(apply(row(), ["normalizeUom"]).unit_of_measure).toBe("PCS");
  });

  it("applies country ISO before uppercase", () => {
    expect(apply(row(), ["countryIso", "uppercase"]).country_of_origin).toBe(
      "CN"
    );
  });

  it("normalizes packing list dates and bill of lading countries", () => {
    expect(
      apply(row({ packing_list_date: "15/03/2024" }), ["isoDates"])
        .packing_list_date
    ).toBe("2024-03-15");
    expect(
      apply(row({ shipper_country: "United States" }), ["countryIso"])
        .shipper_country
    ).toBe("US");
  });
});

describe("parseNumericValue", () => {
  it("parses currency and accounting negatives", () => {
    expect(parseNumericValue("$1,234.50")).toBe(1234.5);
    expect(parseNumericValue("(12.5)")).toBe(-12.5);
    expect(parseNumericValue("USD10.00")).toBe(10);
  });
});
