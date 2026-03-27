import { describe, it, expect } from "../testing/test-runner";
import { Navigatable, HtsElement, HtsSection } from "../interfaces/hts";
import {
  buildCompletedClassificationFromHtsCode,
  CLASSIFICATION_FROM_HTS_CODE_PLACEHOLDER_DESCRIPTION,
  lacksProductDescriptionForAnalysis,
} from "./classification-from-hts-code";
import { isValidTenDigitHtsInput } from "./hts-code";

function el(
  overrides: Partial<HtsElement> &
    Pick<HtsElement, "uuid" | "indent" | "htsno" | "description">
): HtsElement {
  return {
    type: Navigatable.ELEMENT,
    chapter: 84,
    superior: null,
    units: [],
    general: null,
    special: null,
    other: null,
    footnotes: [],
    quotaQuantity: null,
    additionalDuties: null,
    ...overrides,
  };
}

const mockSections: HtsSection[] = [
  {
    number: 16,
    description: "Machinery and mechanical appliances",
    type: Navigatable.CHAPTER,
    chapters: [
      {
        number: 84,
        description: "Nuclear reactors, boilers, machinery",
        type: Navigatable.CHAPTER,
      },
    ],
  },
];

/** Flat chapter-ordered slice: indent chain with intermediate rows without htsno */
const mockChapterElements: HtsElement[] = [
  el({
    uuid: "h0",
    indent: "0",
    htsno: "8458",
    description: "Lathes",
  }),
  el({
    uuid: "h1",
    indent: "1",
    htsno: "",
    description: "Heading subgroup (no code)",
  }),
  el({
    uuid: "h2",
    indent: "2",
    htsno: "8458.91",
    description: "Other lathes",
  }),
  el({
    uuid: "h3",
    indent: "3",
    htsno: "",
    description: "Subheading subgroup",
  }),
  el({
    uuid: "h4",
    indent: "4",
    htsno: "8458.91.50",
    description: "Other",
  }),
  el({
    uuid: "h5",
    indent: "5",
    htsno: "8458.91.50.70",
    description: "Statistical line",
  }),
];

describe("lacksProductDescriptionForAnalysis", () => {
  it("is true for empty, whitespace-only, or HTS-code placeholder description", () => {
    expect(lacksProductDescriptionForAnalysis("")).toBe(true);
    expect(lacksProductDescriptionForAnalysis("   ")).toBe(true);
    expect(lacksProductDescriptionForAnalysis(null)).toBe(true);
    expect(lacksProductDescriptionForAnalysis(undefined)).toBe(true);
    expect(
      lacksProductDescriptionForAnalysis(
        CLASSIFICATION_FROM_HTS_CODE_PLACEHOLDER_DESCRIPTION
      )
    ).toBe(true);
  });

  it("is false for real product text", () => {
    expect(lacksProductDescriptionForAnalysis("Cotton T-shirt")).toBe(false);
  });
});

describe("isValidTenDigitHtsInput", () => {
  it("accepts 10 digits with dots, plain, or extra spacing/punctuation", () => {
    expect(isValidTenDigitHtsInput("8458.91.50.70")).toBe(true);
    expect(isValidTenDigitHtsInput("8458915070")).toBe(true);
    expect(isValidTenDigitHtsInput("  8458 91 50 70 ")).toBe(true);
    expect(isValidTenDigitHtsInput("8458-91-50-70")).toBe(true);
  });

  it("rejects wrong digit counts", () => {
    expect(isValidTenDigitHtsInput("845891507")).toBe(false);
    expect(isValidTenDigitHtsInput("84589150701")).toBe(false);
  });
});

describe("buildCompletedClassificationFromHtsCode", () => {
  it("builds completed classification along indent chain including rows without htsno", () => {
    const result = buildCompletedClassificationFromHtsCode(
      "8458.91.50.70",
      mockChapterElements,
      mockSections
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { classification } = result;
    expect(classification.isComplete).toBe(true);
    expect(classification.articleDescription).toBe(
      CLASSIFICATION_FROM_HTS_CODE_PLACEHOLDER_DESCRIPTION
    );
    expect(classification.levels).toHaveLength(6);

    const chainIds = ["h0", "h1", "h2", "h3", "h4", "h5"];
    classification.levels.forEach((level, i) => {
      expect(level.selection?.uuid).toBe(chainIds[i]);
      expect(
        level.candidates.some((c) => c.uuid === level.selection?.uuid)
      ).toBe(true);
    });

    expect(classification.preliminaryLevels).toHaveLength(2);
    expect(classification.preliminaryLevels?.[0].level).toBe("section");
    expect(classification.preliminaryLevels?.[1].level).toBe("chapter");
    expect(classification.preliminaryLevels?.[1].candidates[0].identifier).toBe(
      84
    );
  });

  it("accepts 10-digit input without dots", () => {
    const result = buildCompletedClassificationFromHtsCode(
      "8458915070",
      mockChapterElements,
      mockSections
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(
        result.classification.levels[
          result.classification.levels.length - 1
        ].selection?.htsno
      ).toBe("8458.91.50.70");
    }
  });

  it("disambiguates when two rows share the same digit string by implied chapter", () => {
    const dup = el({
      uuid: "other-ch",
      indent: "5",
      htsno: "8458.91.50.70",
      description: "Wrong chapter duplicate",
      chapter: 85,
    });
    const withDup = [...mockChapterElements, dup];
    const result = buildCompletedClassificationFromHtsCode(
      "8458.91.50.70",
      withDup,
      mockSections
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.classification.levels.at(-1)?.selection?.uuid).toBe("h5");
    }
  });

  it("returns error when code is missing from data", () => {
    const result = buildCompletedClassificationFromHtsCode(
      "9999999999",
      mockChapterElements,
      mockSections
    );
    expect(result.ok).toBe(false);
    if (!result.ok && !result.error.includes("not found")) {
      throw new Error(
        `Expected error to mention "not found", got: ${result.error}`
      );
    }
  });
});
