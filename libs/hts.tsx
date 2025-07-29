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
} from "../interfaces/hts";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { OpenAIModel } from "./openai";
import apiClient from "@/libs/api";
import { HtsLevel, TariffType } from "../enums/hts";
import { NavigatableElement } from "../components/Elements";
import { generateClassificationReport } from "./classification";
import { SecondaryText } from "../components/SecondaryText";
import { TertiaryLabel } from "../components/TertiaryLabel";
import { Color } from "../enums/style";
import { UserProfile } from "./supabase/user";
import { notes } from "../public/notes/notes";
import { inflate } from "pako";

export const downloadClassificationReport = async (
  classification: Classification,
  userProfile: UserProfile
) => {
  const doc = await generateClassificationReport(classification, userProfile);

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
  doc.save(`hts-hero-classification-${formattedDate}.pdf`);
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

export const determineExclusionarySectionNotes = async (
  notes: UINote[],
  productDescription: string
): Promise<Eval[]> => {
  // Query ChatGPT to filter to relevant notes
  const exclustionaryNotesResponse: Array<ChatCompletion.Choice> =
    await apiClient.post("/openai/get-exclusionary-notes", {
      productDescription,
      notes,
    });
  console.log("Exlcusionary notes:");
  console.log(exclustionaryNotesResponse[0].message.content);
  const relevantNotesParsed = JSON.parse(
    exclustionaryNotesResponse[0].message.content!
  ) as Eval[];

  return relevantNotesParsed;
};

export const logSearch = async (productDescription: string) => {
  const logSearchResponse: { success?: boolean; error?: string } =
    await apiClient.post("/search/log", {
      productDescription,
    });

  return logSearchResponse;
};

export const evaluateBestHeadings = async (
  headings: SimplifiedHtsElement[],
  productDescription: string
): Promise<BestHeadingEvaluationResponse> => {
  const bestHeadingResponse: Array<ChatCompletion.Choice> =
    await apiClient.post("/openai/rank-headings", {
      headings,
      productDescription,
    });

  return JSON.parse(bestHeadingResponse[0].message.content);
};

export const getBestClassificationProgression = async (
  elements: SimplifiedHtsElement[],
  htsDescription: string,
  productDescription: string
): Promise<BestProgressionResponse> => {
  const bestCandidatesResponse: Array<ChatCompletion.Choice> =
    await apiClient.post("/openai/get-best-classification-progression", {
      elements,
      productDescription,
      htsDescription,
    });

  const bestCandidate = bestCandidatesResponse[0].message.content;

  if (bestCandidate === null) {
    throw new Error(`Failed to get best description matches`);
  }

  return JSON.parse(bestCandidate);
};

export const getBestChaptersForProductDescription = async (
  productDescription: string
): Promise<BestChaptersResponse> => {
  const bestChaptersResponse: Array<ChatCompletion.Choice> =
    await apiClient.post("/openai/get-best-chapters-for-product-description", {
      productDescription,
    });

  return JSON.parse(bestChaptersResponse[0].message.content);
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

export const getHSChapter = async (productDescription: string) => {
  const hsHeadingsResponse: Array<ChatCompletion.Choice> = await apiClient.post(
    "/openai/get-hs-headings",
    {
      productDescription,
      model: OpenAIModel.FOUR,
    }
  );

  const hsHeadings = hsHeadingsResponse[0].message.content;

  console.log(hsHeadings);

  if (!hsHeadings)
    throw new Error(`failed to get HS Headings for product description`);

  // TODO: Consider doing this for all headings
  // TODO: Consider jumping right to heading and not back to chapter...
  //  especially since this take the most time -- however don't sacrifice accuracy

  // const parsed: HsHeading[] = JSON.parse(hsHeadings);
  const parsed: { candidates: HsHeading[] } = JSON.parse(hsHeadings);
  console.log(`Headings:`);
  console.log(parsed.candidates);
  const chapter = parsed.candidates[0].section.substring(0, 2);

  return chapter;
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
  tariffType: TariffType
) => {
  return element.footnotes?.filter((footnote) =>
    footnote.columns.includes(tariffType)
  );
};

export const getTemporaryTariffText = (
  element: HtsElement,
  tariffType: TariffType
) => {
  const footnotes = getFootnotesForTariffType(element, tariffType);
  return footnotes.map((footnote) =>
    footnote.value.trim().replace(/\.*$/g, "")
  );
};

export const getTemporaryTariffTextElement = (
  element: HtsElement,
  tariffType: TariffType
): JSX.Element | null => {
  const footnotes = getFootnotesForTariffType(element, tariffType);

  if (!footnotes.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <TertiaryLabel
        value={"Temporary or Special Adjustments"}
        color={Color.NEUTRAL_CONTENT}
      />
      <SecondaryText
        key={`${tariffType}-tariff-footnotes`}
        value={footnotes
          .map((footnote) => footnote.value.trim().replace(/\.*$/g, ""))
          .join(", ")}
        color={Color.WHITE}
      />
    </div>
  );
};

export const getTariffDetails = (
  element: HtsElement,
  elements: HtsElement[],
  breadcrumbs?: NavigatableElement[]
) => {
  if (element.general || element.special || element.other) {
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
