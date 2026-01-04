import { ChatCompletion } from "openai/resources";
import {
  HtsElementWithParentReference,
  ClassificationProgression,
  HsHeading,
  HtsElement,
  TemporaryTariff,
  HtsSection,
  HtsSectionAndChapterBase,
  BestCandidatesResponse,
  BestHeadingEvaluationResponse,
  SimplifiedHtsElement,
  Eval,
  UINote,
  BestProgressionResponse,
  BestChaptersResponse,
  Navigatable,
  Classification,
  SectionAndChapterDetails,
  SelectionWithReason,
  Importer,
  ClassificationRecord,
  HTSNote,
  PreliminaryCandidate,
  QualifyCandidatesWithNotesDto,
  CandidateQualificationResponse,
} from "../interfaces/hts";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { OpenAIModel } from "./openai";
import apiClient from "@/libs/api";
import { HtsLevel } from "../enums/hts";
import { TariffColumn } from "../enums/tariff";
import { NavigatableElement } from "../components/Elements";
import { generateClassificationReport } from "./classification";
import { SecondaryText } from "../components/SecondaryText";
import { TertiaryLabel } from "../components/TertiaryLabel";
import { Color } from "../enums/style";
import { UserProfile } from "./supabase/user";
import { notes } from "../public/notes/notes";
import { inflate } from "pako";
import {
  getStringBeforeOpeningParenthesis,
  getStringBetweenParenthesis,
} from "../utilities/hts";
import { ClassificationTier } from "../contexts/ClassificationContext";
import { NoteRecord } from "../types/hts";

export const downloadClassificationReport = async (
  classification: ClassificationRecord,
  userProfile: UserProfile,
  importer?: Importer
) => {
  const doc = await generateClassificationReport(
    classification,
    userProfile,
    importer
  );

  // Generate a filename based on the current date and time
  const now = new Date();
  const formattedDate = now
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/[/:]/g, "-")
    .replace(",", "");

  // Save the PDF
  doc.save(
    `classification-advisory${importer ? `-${importer.name}` : ""}-${formattedDate}.pdf`
  );
};

// Create a function that takes a classification and iterates in reverse through the levels to find the first level with tariff data
export const getElementWithTariffDataFromClassification = (
  classification: Classification
) => {
  for (let i = classification.levels.length - 1; i >= 0; i--) {
    if (
      classification.levels[i].selection?.general ||
      classification.levels[i].selection?.special ||
      classification.levels[i].selection?.other
    ) {
      return classification.levels[i].selection;
    }
  }
};

export const getProgressionDescriptions = (
  classification: Classification,
  upToLevel?: number
) => {
  const stopAtLevel = upToLevel ? upToLevel + 1 : classification.levels.length;

  return classification.levels
    .slice(0, stopAtLevel)
    .map((level) => level.selection?.description);
};

export const getBreadCrumbsForElement = (
  element: HtsElement,
  sections: HtsSection[],
  htsElements: HtsElement[]
): { label: string; value: string }[] => {
  const { chapter, section } = getSectionAndChapterFromChapterNumber(
    sections,
    Number(element.chapter)
  );

  const parentElements = getHtsElementParents(element, htsElements);

  return [
    {
      label: `Section ${section.number}:`,
      value: section.description,
    },
    {
      label: `Chapter ${chapter.number}:`,
      value: chapter.description,
    },
    ...parentElements.map((parent) => ({
      label: parent.htsno && `${parent.htsno}:`,
      value: parent.description,
    })),
  ];
};

export const getHtsCodesFromString = (text: string): string[] => {
  const htsCodeRegex = /\b(\d{4}(?:\.?\d{2})?(?:\.?\d{2})?(?:\.?\d{2})?)\b/g;
  const matches = text.match(htsCodeRegex);
  return matches ? matches : [];
};

// Filters from the overall set of elements -- room for imporvement
export const getElementsInChapter = (elements: HtsElement[], chapter: number) =>
  elements.filter((e) => e.chapter == chapter);

export const isHTSCode = (input: string): boolean => {
  const trimmed = input.trim();

  // Acceptable formats:
  // - With optional dots (max 3 groups of 2 digits after 4-digit prefix)
  const dottedFormat = /^(\d{4})(\.(\d{2})?)?(\.(\d{2})?)?(\.(\d{2})?)?\.?$/;

  // - Or a numeric-only version with 4, 6, 8, or 10 digits (HTS codes are hierarchical)
  const numericOnlyFormat = /^\d{4}(\d{2}){0,3}$/;

  return dottedFormat.test(trimmed) || numericOnlyFormat.test(trimmed);
};

export function isFullHTSCode(code: string) {
  // Regular expression to validate HTS code with the updated format
  const htsCodeRegex = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/;
  return htsCodeRegex.test(code);
}

export const isEightOrTenDigits = (htsCode: string) => {
  const trimmedCode = htsCode.trim();
  const digits = trimmedCode.replace(/\./g, "");

  return digits.length === 8 || digits.length === 10;
};

export const isInChapters1To97 = (htsCode: string) => {
  const trimmedCode = htsCode.trim();
  const digits = trimmedCode.replace(/\./g, "");
  const firstTwoDigits = parseInt(digits.substring(0, 2), 10);

  return firstTwoDigits >= 1 && firstTwoDigits <= 97;
};

// Validate proper HTS code format with periods in correct positions
// For 8-digit codes: XXXX.XX.XX or XXXXXXXX
// For 10-digit codes: XXXX.XX.XX.XX or XXXXXXXXXX
export const isValidHtsCodeFormat = (htsCode: string) => {
  const trimmedCode = htsCode.trim();
  const digits = trimmedCode.replace(/\./g, "");

  if (digits.length === 8) {
    // Either no periods (pure numeric) or exactly in format XXXX.XX.XX
    const validFormats = [
      /^\d{8}$/, // Pure numeric: 12345678
      /^\d{4}\.\d{2}\.\d{2}$/, // With periods: 1234.56.78
    ];

    return validFormats.some((regex) => regex.test(trimmedCode));
  } else if (digits.length === 10) {
    // Either no periods (pure numeric) or exactly in format XXXX.XX.XX.XX
    const validFormats = [
      /^\d{10}$/, // Pure numeric: 1234567890
      /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/, // With periods: 1234.56.78.90
    ];

    return validFormats.some((regex) => regex.test(trimmedCode));
  }
};

const isOnlyNumbersAndPeriods = (htsCode: string) => {
  const trimmedCode = htsCode.trim();

  return /^[\d.]+$/.test(trimmedCode);
};

export interface TarrifableHtsCodeValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates if a given htsCode is a valid 8 or 10 digit HTS code.
 *
 * Requirements:
 * - Must follow proper HTS code format with periods in correct positions
 * - With periods removed, must be exactly 8 or 10 digits
 * - First two digits must be between 01 and 97
 *
 * Valid examples: "0402.00.00", "04020000", "0402.00.50.00", "0402005000"
 * Invalid examples: "6902.......2010", "0402..00.00", "0402.0.00"
 *
 * @param htsCode - The text to validate as an HTS code
 * @returns boolean - True if the text is a valid 8 or 10 digit HTS code
 */
export const validateTariffableHtsCode = (
  htsCode: string
): TarrifableHtsCodeValidationResult => {
  if (!isOnlyNumbersAndPeriods(htsCode)) {
    return {
      valid: false,
      error: "Code must only contain numbers and periods",
    };
  }

  if (!isEightOrTenDigits(htsCode)) {
    return { valid: false, error: "Code must be 8 or 10 digits" };
  }

  if (!isInChapters1To97(htsCode)) {
    return { valid: false, error: "Code must be in Chapters 1-97" };
  }

  // if (!isValidHtsCodeFormat(htsCode)) {
  //   return { valid: false, error: "Code must be formatted correctly" };
  // }

  return { valid: true };
};

export const getHtsElementDescriptions = (
  elements: HtsElement[] | HtsElementWithParentReference[]
) => {
  return elements.map((e) => e.description);
};

export const findFirstElementInProgressionWithTariff = (
  classificationProgression: ClassificationProgression[]
) => {
  const numClassifications = classificationProgression.length;

  for (let i = numClassifications - 1; i >= 0; i--) {
    if (classificationProgression[i].selection.general) {
      return classificationProgression[i].selection;
    }
  }

  throw new Error(
    `Could not find any element in progression with general tariff specified`
  );
};

export const isSimpleTariff = (tariff: TemporaryTariff): boolean => {
  // A tariff is "simple" if it has an element defined
  // since element represents a ch98/99 hts element that
  // has a tariff defined. A complex tariff would not have
  // an hts element to reference (currently)
  return Boolean(tariff.element);
};

export const getTemporaryTariffRate = (tariffString: string): string | null => {
  const isRateBasedTemporaryTariff = tariffString
    .toLowerCase()
    .includes("the duty provided in the applicable subheading + ");

  if (!isRateBasedTemporaryTariff) {
    return null;
  }

  return tariffString
    .toLowerCase()
    .split("the duty provided in the applicable subheading + ")[1];
};

// TODO: this naming and functionality could be improved...
// I don't like that it takes a single string and that it
// is always dealing with strings with the % symbols kept
export const sumPercentages = (input: string): string | null => {
  const matches = input.match(/(\d+(\.\d+)?)%/g);

  if (!matches || matches.length !== 2) {
    return null; // Ensure there are exactly two percentages in the string
  }

  // Parse the percentage values as numbers
  const percentages = matches.map((percent) =>
    parseFloat(percent.replace("%", ""))
  );
  const sum = percentages.reduce((total, current) => total + current, 0);

  return `${sum}%`;
};

export const getTemporaryTariffs = async (
  htsElement: HtsElement
): Promise<TemporaryTariff[]> => {
  // Get general footnotes
  const tariffFootnotes = getGeneralFootnotes(htsElement);

  // If none, great, found simple tariff
  if (tariffFootnotes.length === 0) {
    return [];
  }

  // otherwise, try to get as much tariff info as possible for each
  // tariff footnote spefified for the given HTS Element
  let tariffs: TemporaryTariff[] = tariffFootnotes.map((f) => ({
    description: f.value,
  }));

  const enrichedTempTariffs = await Promise.all(
    tariffs.map(async (t) => {
      const isSimpleTariff = isDirectHtsElementReference(t.description);

      if (isSimpleTariff) {
        const htsCode = extractFirst8DigitHtsCode(t.description);
        if (!htsCode) {
          throw new Error(
            `failed to extract hts code from footnote with value ${t.description}`
          );
        }

        return {
          description: t.description,
          element: await getHtsElementForCode(htsCode),
        };
      } else {
        return t;
      }
    })
  );

  return enrichedTempTariffs;
};

export const getHtsElementForCode = async (
  htsCode: string
): Promise<HtsElement> => {
  const chapter = htsCode.substring(0, 2);
  const chapterData = await getHtsChapterData(chapter);

  if (!chapterData) throw new Error(`Failed to get chapter ${chapter} json`);

  const htsElement = chapterData.find((c) => c.htsno === htsCode);

  if (!htsElement)
    throw new Error(
      `Failed to find matching element for ${htsCode} in chapter ${chapter}`
    );

  return htsElement;
};

export const getGeneralFootnotes = (htsElement: HtsElement) => {
  return htsElement.footnotes.filter((f) => f.columns.includes("general"));
};

export const isDirectHtsElementReference = (str: string) => {
  return Boolean(extractFirst8DigitHtsCode(str));
};

export const extractFirst8DigitHtsCode = (input: string): string => {
  // Use a regular expression to match the numeric code pattern
  const match = input.match(/(\d{4}\.\d{2}\.\d{2})/);

  // If a match is found, return the first capture group;
  // otherwise, return an empty string
  return match ? match[1] : "";
};

export const getProgressionDescriptionWithArrows = (
  classificationProgression: ClassificationProgression[],
  upToLevel?: number
) => {
  const stopAtLevel =
    upToLevel !== undefined ? upToLevel : classificationProgression.length;

  let fullDescription = "";
  classificationProgression
    .slice(0, stopAtLevel)
    .forEach((progression, index) => {
      if (progression.selection) {
        // if the string has a : at the end, strip it off
        const desc = progression.selection.description.endsWith(":")
          ? progression.selection.description.slice(0, -1)
          : progression.selection.description;

        fullDescription += index === 0 ? `${desc}` : ` > ${desc}`;
      }
    });

  return fullDescription;
};

/**
 * Determines the HTS classification level of a given string.
 *
 * @param htsCode - The HTS code as a string (e.g., "1234", "1234.56", etc.).
 * @returns A string representing the classification level ("Heading", "Subheading", "US Subheading", or "Stat Suffix"), or "Invalid" if it doesn't match any level.
 */
export const getHtsLevel = (htsCode: string): HtsLevel => {
  // Remove trailing periods from the input
  const sanitizedInput = htsCode.trim().replace(/\.*$/g, "");

  // Define regular expressions for each HTS level
  const chapterRegex = /^\d{2}$/; // Matches "xx"
  const headingRegex = /^\d{4}$/; // Matches "xxxx"
  const subheadingRegex = /^\d{4}\.\d{2}$/; // Matches "xxxx.xx"
  const usSubheadingRegex = /^\d{4}\.\d{2}\.\d{2}$/; // Matches "xxxx.xx.xx"
  const statSuffixRegex = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/; // Matches "xxxx.xx.xx.xx"

  // Determine the HTS classification level
  if (sanitizedInput === "") {
    return HtsLevel.PREQUALIFIER;
  } else if (chapterRegex.test(sanitizedInput)) {
    return HtsLevel.CHAPTER;
  } else if (headingRegex.test(sanitizedInput)) {
    return HtsLevel.HEADING;
  } else if (subheadingRegex.test(sanitizedInput)) {
    return HtsLevel.SUBHEADING;
  } else if (usSubheadingRegex.test(sanitizedInput)) {
    return HtsLevel.US_SUBHEADING;
  } else if (statSuffixRegex.test(sanitizedInput)) {
    return HtsLevel.STAT_SUFFIX;
  } else {
    console.error(`Unaccounted for HTS Code: ${htsCode}`);
    return HtsLevel.MISCELLANEOUS;
  }
};

export const fetchTopLevelSectionNotes = async (
  section: number
): Promise<UINote[]> => {
  return await apiClient.post("/supabase/get-section-notes", {
    section,
  });
};

export const logSearch = async (productDescription: string) => {
  const logSearchResponse: { success?: boolean; error?: string } =
    await apiClient.post("/search/log", {
      productDescription,
    });

  return logSearchResponse;
};

export const getBestClassificationProgression = async (
  elements: SimplifiedHtsElement[],
  htsDescription: string,
  productDescription: string,
  classificationLevel: number,
  classificationTier?: ClassificationTier,
  notes?: NoteRecord[]
): Promise<BestProgressionResponse> => {
  console.log("Classification Tier:");
  console.log(classificationTier);
  const bestCandidatesResponse: Array<ChatCompletion.Choice> =
    await apiClient.post("/openai/get-best-classification-progression", {
      elements,
      productDescription,
      htsDescription,
      classificationTier,
      notes,
      level: classificationLevel,
    });

  const bestCandidate = bestCandidatesResponse[0].message.content;

  if (bestCandidate === null) {
    throw new Error(`Failed to get best description matches`);
  }

  return JSON.parse(bestCandidate);
};

/**
 * Maps each HTS section to the range of chapters it contains.
 * Key: section number, Value: { start: first chapter, end: last chapter }
 */
const SECTION_TO_CHAPTERS: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 5 },
  2: { start: 6, end: 14 },
  3: { start: 15, end: 15 },
  4: { start: 16, end: 24 },
  5: { start: 25, end: 27 },
  6: { start: 28, end: 38 },
  7: { start: 39, end: 40 },
  8: { start: 41, end: 43 },
  9: { start: 44, end: 46 },
  10: { start: 47, end: 49 },
  11: { start: 50, end: 63 },
  12: { start: 64, end: 67 },
  13: { start: 68, end: 70 },
  14: { start: 71, end: 71 },
  15: { start: 72, end: 83 },
  16: { start: 84, end: 85 },
  17: { start: 86, end: 89 },
  18: { start: 90, end: 92 },
  19: { start: 93, end: 93 },
  20: { start: 94, end: 96 },
  21: { start: 97, end: 97 },
  22: { start: 98, end: 99 },
};

const getSectionForChapter = (chapter: number): number | null => {
  for (const [section, { start, end }] of Object.entries(SECTION_TO_CHAPTERS)) {
    if (chapter >= start && chapter <= end) {
      return parseInt(section, 10);
    }
  }
  return null;
};

/**
 * Extracts section and chapter numbers from an HTS code.
 * Client-side version of the function in libs/supabase/hts-notes.ts
 */
export const getSectionAndChapterFromHtsCode = (
  htsCode: string
): { section: number; chapter: number } | null => {
  const cleanCode = htsCode.replace(/\./g, "");

  if (cleanCode.length < 2) {
    return null;
  }

  const chapter = parseInt(cleanCode.slice(0, 2), 10);

  if (isNaN(chapter) || chapter < 1 || chapter > 99) {
    return null;
  }

  const section = getSectionForChapter(chapter);

  if (section === null) {
    return null;
  }

  return { section, chapter };
};

/**
 * Extracts unique sections and chapters from a list of simplified HTS elements.
 */
export const getSectionsAndChaptersFromCandidates = (
  candidates: SimplifiedHtsElement[]
): { sections: number[]; chapters: number[] } => {
  const sections = new Set<number>();
  const chapters = new Set<number>();

  for (const candidate of candidates) {
    // Don't fetch notes for elements without an htsno (description only)
    if (candidate.code) {
      const result = getSectionAndChapterFromHtsCode(candidate.code);
      if (result) {
        sections.add(result.section);
        chapters.add(result.chapter);
      }
    }
  }

  return {
    sections: Array.from(sections),
    chapters: Array.from(chapters),
  };
};

/**
 * Fetches notes for the specified sections and chapters from the API.
 */
export const fetchNotesForSectionsAndChapters = async (
  sections: number[],
  chapters: number[]
): Promise<NoteRecord[]> => {
  if (sections.length === 0 && chapters.length === 0) {
    return [];
  }

  const notes: NoteRecord[] = await apiClient.post("/hts-notes/fetch-batch", {
    sections,
    chapters,
  });

  return notes;
};

export const getBestDescriptionCandidates = async (
  elementsAtLevel: HtsElement[] | HtsElementWithParentReference[],
  productDescription: string,
  isSectionOrChapter: boolean,
  minMatches?: number,
  maxMatches?: number,
  descs?: string[]
): Promise<BestCandidatesResponse> => {
  const descriptions = descs || getHtsElementDescriptions(elementsAtLevel);
  const bestCandidatesResponse: Array<ChatCompletion.Choice> =
    await apiClient.post("/openai/get-best-description-candidates", {
      descriptions,
      productDescription,
      isSectionOrChapter,
      minMatches,
      maxMatches,
    });

  const bestCandidates = bestCandidatesResponse[0].message.content;

  if (bestCandidates === null) {
    throw new Error(`Failed to get best description matches`);
  }

  return JSON.parse(bestCandidates);
};

export const updateHtsDescription = (current: string, additional: string) => {
  // Remove any trailing ":" from the part that will get added on
  const cleanedAdditional = additional.replace(/\s*:\s*$/, "");

  // Tack additional onto current and join with " > " if current already exists
  return current ? current + " > " + cleanedAdditional : cleanedAdditional;
};

// Recursive function that implements the sliding window approach to find
// the single best HTS Codes for a product description
export const getBestIndentLevelMatch = async (
  productDescription: string,
  htsDescription: string, // used to compare against product description at each level, with each NEW descriptor
  elements: HtsElementWithParentReference[],
  indentLevel: number,
  selectionProgression: ClassificationProgression[] = []
): Promise<ClassificationProgression[]> => {
  let elementsAtIndent = elementsAtClassificationLevel(elements, indentLevel);
  const descriptionsForElements = getHtsElementDescriptions(elementsAtIndent);
  const bestMatchResponse: Array<ChatCompletion.Choice> = await apiClient.post(
    "/openai/get-best-description-match",
    {
      htsDescription,
      descriptions: descriptionsForElements,
      productDescription,
      model: OpenAIModel.FOUR,
    }
  );

  const bestMatch = bestMatchResponse[0].message.content;
  if (bestMatch === null) {
    throw new Error(`Best match is null for descriptions`);
  }

  const bestMatchJson: SelectionWithReason = JSON.parse(bestMatch); // TODO: handle errors
  const bestMatchElement = elementsAtIndent[Number(bestMatchJson.index)];

  // FIXME: MAKE SURE WE'RE CONSTRUCTING THE RIGHT HTS STRING (PIVOTAL)

  // Tack best matches description onto the current htsDescription
  htsDescription = htsDescription
    ? htsDescription + " > " + bestMatchElement.description
    : bestMatchElement.description;

  if (!bestMatchElement) {
    throw new Error(
      `Error getting best match element with description: ${bestMatchElement.description}`
    );
  } else {
    // Add Selection Layer to overall selection progression
    const htsLayerSelection: ClassificationProgression = {
      selection: bestMatchElement,
      reasoning: bestMatchJson.logic,
      candidates: elementsAtIndent,
    };

    selectionProgression.push(htsLayerSelection);

    const gotFullHtsCode = isFullHTSCode(bestMatchElement.htsno);

    if (gotFullHtsCode) {
      // Stop Searching, return progression
      return selectionProgression;
    }

    // Get END of new slice index which will be either:
    const startIndex = bestMatchElement.indexInParentArray + 1;
    let endIndex = startIndex;

    for (let i = startIndex + 1; i < elements.length; i++) {
      if (elements[i].indent === String(indentLevel)) {
        endIndex = i - 1;
        break;
      }
    }

    if (endIndex === startIndex) {
      endIndex = elements.length;
    }

    let nextChunk = elements.slice(startIndex, endIndex + 1);
    nextChunk = setIndexInArray(nextChunk);

    // Recurse with updated data
    return getBestIndentLevelMatch(
      productDescription,
      htsDescription,
      nextChunk,
      indentLevel + 1,
      selectionProgression
    );
  }
};

export const qualifyCandidatesWithNotes = async ({
  productDescription,
  candidates,
  candidateType,
}: QualifyCandidatesWithNotesDto): Promise<CandidateQualificationResponse> => {
  const qualifiedCandidatesResponse: Array<ChatCompletion.Choice> =
    await apiClient.post("/openai/qualify-candidates-with-notes", {
      productDescription,
      candidates,
      candidateType,
    });

  const qualificationResponse = qualifiedCandidatesResponse[0].message.content;

  if (qualificationResponse === null) {
    throw new Error(`Failed to get qualification analysis`);
  }

  return JSON.parse(qualificationResponse);
};

export const getCodeFromHtsPrimitive = (
  htsPrimitive: HtsElement | HtsSectionAndChapterBase
): string => {
  if ("htsno" in htsPrimitive) {
    return htsPrimitive.htsno;
  } else if ("number" in htsPrimitive) {
    return String(htsPrimitive.number);
  } else {
    console.error("Failed to extract code from selection", htsPrimitive);
    throw new Error("Failed to extract code from selection");
  }
};

export const getHtsSectionsAndChapters = (): Promise<{
  sections: HtsSection[];
}> => {
  return apiClient.get("/hts/get-sections-and-chapters", {});
};

export const getHtsData = async (
  revision: string
): Promise<{ data: HtsElement[]; revisionName: string }> => {
  const response = await fetch(`/api/hts/get-hts-data?revision=${revision}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch HTS data: ${response.statusText}`);
  }

  // Get the X-Revision-Name header
  const revisionName = response.headers.get("X-Revision-Name") || "";

  // Convert Blob to ArrayBuffer and decompress the gzipped JSON
  const htsData = await response.blob();
  const arrayBuffer = await htsData.arrayBuffer();
  const decompressedData = inflate(new Uint8Array(arrayBuffer), {
    to: "string",
  });

  return {
    data: JSON.parse(decompressedData),
    revisionName,
  };
};

export const getHtsChapterData = async (
  chapter: string
): Promise<HtsElement[]> => {
  const chapterData: HtsElement[] = await apiClient.get(
    "/hts/get-chapter-data",
    {
      params: { chapter },
    }
  );

  return chapterData.map((e) => ({
    ...e,
    uuid: crypto.randomUUID(),
    chapter: Number(chapter),
    type: Navigatable.ELEMENT,
  }));
};

export const generateBreadcrumbsForHtsElement = (
  sections: HtsSection[],
  chapter: HtsSectionAndChapterBase,
  parentElements: HtsElement[]
): NavigatableElement[] => {
  const breadcrumbs: NavigatableElement[] = [
    {
      title: "Sections",
      element: {
        type: Navigatable.SECTIONS,
        sections,
      },
    },
    {
      title: `Chapter ${chapter.number.toString()}`,
      element: {
        type: Navigatable.CHAPTER,
        ...chapter,
      },
    },
  ];

  if (parentElements.length === 0) {
    return breadcrumbs;
  }

  return [
    ...breadcrumbs,
    ...parentElements.map((e) => ({
      title: `${e.htsno || e.description.split(" ").slice(0, 2).join(" ") + "..."}`,
      element: {
        type: Navigatable.ELEMENT,
        ...e,
      },
    })),
  ];
};

export const getSectionAndChapterFromChapterNumber = (
  sections: HtsSection[],
  chapterNumber: number
): SectionAndChapterDetails | null => {
  if (isNaN(chapterNumber)) {
    throw new Error(`Invalid chapter number: ${chapterNumber}`);
  }

  for (const section of sections) {
    const chapter = section.chapters.find((ch) => ch.number === chapterNumber);
    if (chapter) {
      return {
        section: {
          number: section.number,
          description: section.description,
          filePath: section.filePath,
        },
        chapter,
      };
    }
  }
  return null; // Not found
};

export const getChapterFromHtsElement = (
  element: HtsElement,
  allElements: HtsElement[]
) => {
  if (element.htsno) {
    return element.htsno.substring(0, 2).replace(/^0+/, "");
  }

  const parents = getHtsElementParents(element, allElements);
  const parentWithHtsno = parents.find((p) => p.htsno);

  if (!parentWithHtsno) {
    console.log(`No parents with HTSNO: ${element.uuid}`);
  }

  // also should remove 0 prefix if it exists
  return parentWithHtsno.htsno.substring(0, 2).replace(/^0+/, "");
};

export const getGeneralNoteFromSpecialTariffSymbol = (
  specialTariffSymbol: string
) => {
  return notes.find((note) =>
    note.specialTariffTreatmentCodes?.includes(specialTariffSymbol)
  );
};

export const getFootnotesForTariffType = (
  element: HtsElement,
  tariffType: TariffColumn
) => {
  return element.footnotes?.filter((footnote) =>
    footnote.columns.includes(tariffType)
  );
};

export const getTemporaryTariffText = (
  element: HtsElement,
  tariffType: TariffColumn
) => {
  const footnotes = getFootnotesForTariffType(element, tariffType);
  return footnotes.map((footnote) =>
    footnote.value.trim().replace(/\.*$/g, "")
  );
};

export interface BaseTariffI {
  value: number | null;
  type: "percent" | "amount";
  unit?: string;
  details?: string;
  raw: string;
  programs?: string[];
}

export interface ParsedBaseTariff {
  tariffs: BaseTariffI[];
  parsingFailures: string[];
}

export const splitOnClosingParen = (input: string): string[] => {
  const parts = input.split(/(?<=\))/g); // Split *after* each closing parenthesis ")"
  return parts.map((part) => part.trim()).filter(Boolean); // Trim whitespace and remove empty strings
};

// TODO: consider filtering out any agreements that might not apply in this case given `country` param
//  Item for the future to clean this up properly once we have lists of countries mapped to programs
export function getBaseTariffs(input: string): ParsedBaseTariff {
  const tariffs: BaseTariffI[] = [];
  const parsingFailures: string[] = [];

  const programsString = getStringBetweenParenthesis(input);

  const programs =
    (programsString && programsString.split(",").map((p) => p.trim())) || [];
  const cleaned = getStringBeforeOpeningParenthesis(input);
  const parts = cleaned.split(/\s+\+\s+/);

  for (const part of parts) {
    const trimmed = part.trim();

    if (!trimmed) {
      return { tariffs: [], parsingFailures: [] };
    }

    // Check for "free" case-insensitively, with or without parentheses
    const freeMatch = trimmed.toLowerCase().match(/free/i);
    if (freeMatch) {
      tariffs.push({
        value: 0,
        type: "percent",
        raw: trimmed,
        programs,
      });
      continue;
    }

    // Check for "see" case-insensitively, with or without parentheses
    const seeMatch = trimmed.toLowerCase().match(/see/i);
    if (seeMatch) {
      tariffs.push({
        value: null,
        type: "percent",
        raw: trimmed,
        programs,
        details: trimmed,
      });
      continue;
    }

    // % percent
    const percentMatch = trimmed.match(/^(\d+(\.\d+)?)\s*%$/);
    if (percentMatch) {
      tariffs.push({
        value: Math.round(parseFloat(percentMatch[1]) * 10000) / 10000,
        type: "percent",
        raw: trimmed,
        programs,
      });
      continue;
    }

    // Amounts with $, ¢, unit and optional "on <stuff>"
    // Handle both patterns: "$1.035/kg" and "37.2¢/kg"
    const amountMatch = trimmed.match(
      /^([$¢])\s*(\d+(?:\.\d+)?)(?:\s*\/\s*|\s+)?([a-zA-Z]+)?(?:\s+on\s+(.+))?$/
    );
    if (amountMatch) {
      const [, symbol, valueStr, unit1, unit2] = amountMatch;
      const value = parseFloat(valueStr);
      const valueInDollars = symbol === "¢" ? value / 100 : value;

      const resultObj: BaseTariffI = {
        value: Math.round(valueInDollars * 10000) / 10000,
        type: "amount",
        unit: unit1?.trim(),
        raw: trimmed,
        programs,
      };

      if (unit2) {
        resultObj.details = `on ${unit2.trim()}`;
      }

      tariffs.push(resultObj);
      continue;
    }

    // Handle cents symbol after the number: "37.2¢/kg"
    const centsAfterMatch = trimmed.match(
      /^(\d+(?:\.\d+)?)\s*¢(?:\s*\/\s*|\s+)?([a-zA-Z]+)?(?:\s+on\s+(.+))?$/
    );
    if (centsAfterMatch) {
      const [, valueStr, unit1, unit2] = centsAfterMatch;
      const value = parseFloat(valueStr);
      const valueInDollars = value / 100; // Convert cents to dollars

      const resultObj: BaseTariffI = {
        value: Math.round(valueInDollars * 10000) / 10000,
        type: "amount",
        unit: unit1?.trim(),
        raw: trimmed,
        programs,
      };

      if (unit2) {
        resultObj.details = `on ${unit2.trim()}`;
      }

      tariffs.push(resultObj);
      continue;
    }

    console.error(`Unable to parse duty string: "${trimmed}" from "${input}"`);
    parsingFailures.push(trimmed);
  }

  return { tariffs, parsingFailures };
}

export const getTemporaryTariffTextElement = (
  element: HtsElement,
  tariffColumn: TariffColumn
): JSX.Element | null => {
  const footnotes = getFootnotesForTariffType(element, tariffColumn);

  if (!footnotes.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <TertiaryLabel value={"Temporary or Special Adjustments"} />
      <SecondaryText
        key={`${tariffColumn}-tariff-footnotes`}
        value={footnotes
          .map((footnote) => footnote.value.trim().replace(/\.*$/g, ""))
          .join(", ")}
      />
    </div>
  );
};

export const getTariffElement = (
  element: HtsElement,
  elements: HtsElement[],
  breadcrumbs?: NavigatableElement[]
) => {
  if (
    element.general ||
    element.special ||
    element.other ||
    element.additionalDuties
  ) {
    return element;
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    // Starting at the end of the breadcrumbs list, find the first element that has tariff details using a reverseing for loop
    for (let i = breadcrumbs.length - 1; i >= 0; i--) {
      const breadcrumb = breadcrumbs[i];

      if (
        breadcrumb.element.type === Navigatable.ELEMENT &&
        (breadcrumb.element.general ||
          breadcrumb.element.special ||
          breadcrumb.element.other)
      ) {
        return breadcrumb.element;
      }
    }
  }

  const parentElements = getHtsElementParents(element, elements);
  for (let i = parentElements.length - 1; i >= 0; i--) {
    const parentElement = parentElements[i];

    if (
      parentElement.type === Navigatable.ELEMENT &&
      (parentElement.general || parentElement.special || parentElement.other)
    ) {
      return parentElement;
    }
  }

  return undefined;
};

export const generateBasisForClassification = (
  classification: Classification
): string => {
  const parts: string[] = [];
  const separator = "------------------------------";

  // Add preliminary level analysis (section and chapter) if available
  if (classification.preliminaryLevels) {
    classification.preliminaryLevels.forEach((level) => {
      if (level.analysis) {
        const title =
          level.level === "section" ? "Section Analysis" : "Chapter Analysis";
        parts.push(`${title}\n${separator}\n\n${level.analysis}`);
      }
    });
  }

  // Add regular classification level analysis
  classification.levels.forEach((level, index) => {
    if (level.analysisReason) {
      const title =
        index === 0 ? "Heading Selection" : `Subheading ${index} Selection`;
      parts.push(`${title}\n${separator}\n\n${level.analysisReason}`);
    }
  });

  return parts.join("\n\n");
};

export const getHtsElementParents = (
  element: HtsElement,
  elements: HtsElement[]
): HtsElement[] => {
  // If element is at indent 0, it has no parents
  if (element.indent === "0") {
    return [];
  }
  // Get index of this element
  const elementIndex = elements.findIndex((e) => e.uuid === element.uuid);

  // Iterate through elements backwards until we find an element with an indent level that is one less than the current element
  for (let i = elementIndex - 1; i >= 0; i--) {
    if (elements[i].indent === String(Number(element.indent) - 1)) {
      // Add current element to end parents array and recurse
      return [...getHtsElementParents(elements[i], elements), elements[i]];
    }
  }

  return [];
};

// NOTE: this will get all elements in an array of Hts Elements that are at a given indent level.
// You will not just get the elements up until the next indent level match, at a level.
export const getElementsAtIndentLevel = (
  currentChunk: HtsElement[],
  indentLevel: number
) => {
  return currentChunk.filter((e) => e.indent === String(indentLevel));
};

export const getDirectChildrenElements = (
  element: HtsElement | HtsElementWithParentReference,
  htsElements: HtsElement[] | HtsElementWithParentReference[]
) => {
  const parentsIndex = htsElements.findIndex((e) => e.uuid === element.uuid);

  // console.log("parentsIndex", parentsIndex);

  // If element is not found, throw an error
  if (parentsIndex === -1) {
    throw new Error(`Element not found in array: ${element.htsno}`);
  }

  // Get index of next element at same indent level at parent
  const firstSiblingsIndex = getIndexOfLastElementBeforeIndentLevel(
    htsElements,
    parentsIndex + 1,
    Number(element.indent)
  );

  // console.log("firstSiblingsIndex", firstSiblingsIndex);
  // console.log("Total", firstSiblingsIndex - parentsIndex);

  // Get all elements between the parent and the first sibling at the same indent level
  const childrenElements = htsElements.filter(
    (childElement, index) =>
      Number(childElement.indent) == Number(element.indent) + 1 &&
      index <= firstSiblingsIndex &&
      index > parentsIndex
  );

  return childrenElements;
};

export const getElementsWithinIndentLevelFromStartPoint = (
  currentChunk: HtsElement[],
  startIndex: number,
  indentLevel: number
) => {
  const endIndex = getIndexOfLastElementBeforeIndentLevel(
    currentChunk,
    startIndex,
    indentLevel
  );

  return currentChunk.slice(startIndex, endIndex + 1);
};

export const getIndexOfLastElementBeforeIndentLevel = (
  htsElementsChunk: HtsElement[],
  startIndex: number,
  indentLevel: number
) => {
  for (let i = startIndex; i < htsElementsChunk.length; i++) {
    if (htsElementsChunk[i].indent === String(indentLevel)) {
      return i - 1;
    }
  }

  return htsElementsChunk.length;
};

export function buildNoteTree(notes: HTSNote[]) {
  const map = new Map<string, HTSNote & { nodes: any[] }>();

  for (const note of notes) {
    map.set(note.id, { ...note, nodes: [] });
  }

  const roots: (HTSNote & { nodes: any[] })[] = [];

  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.nodes.push(node);
    } else {
      roots.push(node);
    }
  });

  map.forEach((node) => {
    node.nodes.sort((a, b) => a.depth - b.depth);
  });

  return roots;
}

/**
 * Extracts the last segment of a hierarchical citation.
 * e.g., "6(A)(iii)" → "(iii)", "6(A)" → "(A)", "6" → "6."
 * Adds a "." after citations that are just numbers.
 */
function getLastCitationPart(citation: string): string {
  if (!citation) return "";

  // Match the last parenthetical group like (A), (i), (ii), etc.
  const lastParenMatch = citation.match(/\([^()]+\)$/);
  if (lastParenMatch) {
    return lastParenMatch[0];
  }

  // If no parenthetical, return the whole citation
  // Add "." after if it's just a number (e.g., "6" → "6.")
  if (/^\d+$/.test(citation)) {
    return `${citation}.`;
  }

  return citation;
}

/**
 * Converts a number to Roman numerals (for section numbers)
 */
function toRomanNumeral(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

interface NoteRenderState {
  shownSectionHeader: boolean;
  shownChapterHeader: boolean;
  currentNoteGroup: string | null;
  inChapterNotes: boolean;
}

export function renderNoteContext(
  notes: (HTSNote & { nodes: any[] })[],
  indent = 0,
  output: string[] = [],
  state: NoteRenderState = {
    shownSectionHeader: false,
    shownChapterHeader: false,
    currentNoteGroup: null,
    inChapterNotes: false,
  }
): string {
  for (const node of notes) {
    // Handle both camelCase and snake_case from DB
    const nodeGroup = node.noteGroup || (node as any).note_group || null;
    const nodeChapter = node.chapter ?? (node as any).chapter ?? null;
    const nodeSection = node.section ?? (node as any).section ?? null;
    const isNodeSectionLevel = nodeChapter === null;

    // At the top level (indent 0), manage headers
    if (indent === 0) {
      // Transitioning from section notes to chapter notes
      if (!isNodeSectionLevel && !state.inChapterNotes) {
        state.inChapterNotes = true;
        state.currentNoteGroup = null; // Reset to show new noteGroup headers

        // Add spacing before chapter header
        if (output.length > 0) {
          output.push("");
        }

        // Show "CHAPTER XX" header once
        if (nodeChapter !== null) {
          output.push(`CHAPTER ${nodeChapter}`);
          state.shownChapterHeader = true;
        }
      }

      // Show "SECTION XX" header once for section-level notes
      if (
        isNodeSectionLevel &&
        !state.shownSectionHeader &&
        nodeSection !== null
      ) {
        output.push(`SECTION ${toRomanNumeral(nodeSection)}`);
        state.shownSectionHeader = true;
      }

      // Show noteGroup header when it changes
      if (nodeGroup && nodeGroup !== state.currentNoteGroup) {
        state.currentNoteGroup = nodeGroup;

        // Add spacing before noteGroup header (but not right after section/chapter header)
        if (output.length > 0) {
          const lastLine = output[output.length - 1];
          const isAfterLevelHeader =
            lastLine.startsWith("SECTION ") || lastLine.startsWith("CHAPTER ");
          if (!isAfterLevelHeader) {
            output.push("");
          }
        }

        output.push(nodeGroup.toUpperCase());
      }
    }

    const prefix = "  ".repeat(indent);
    // Include only the last part of the citation (e.g., "(iii)" from "6(A)(iii)")
    const citationPart = node.citation
      ? `${getLastCitationPart(node.citation)} `
      : "";
    output.push(`${prefix}${citationPart}${node.text}`);

    if (node.nodes.length > 0) {
      renderNoteContext(node.nodes, indent + 1, output, state);
    }
  }
  return output.join("\n\n");
}
