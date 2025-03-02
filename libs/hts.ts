import { ChatCompletion } from "openai/resources";
import {
  HtsWithParentReference,
  HtsLevelClassification,
  CandidateSelection,
  HsHeading,
  HtsElement,
  TemporaryTariff,
  HtsSection,
  HtsSectionAndChapterBase,
  BestCandidatesResponse,
  RankedDescriptionsResponse,
  BestHeadingEvaluationResponse,
  SimplifiedHtsElement,
  Eval,
  Note,
  BestProgressionResponse,
} from "../interfaces/hts";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { OpenAIModel } from "./openai";
import apiClient from "@/libs/api";
import { HtsLevel } from "../enums/hts";

export function isFullHTSCode(code: string) {
  // Regular expression to validate HTS code with the updated format
  const htsCodeRegex = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/;
  return htsCodeRegex.test(code);
}

export const getHtsElementDescriptions = (
  elements: HtsWithParentReference[]
) => {
  return elements.map((e) => e.description);
};

export const findFirstElementInProgressionWithTariff = (
  classificationProgression: HtsLevelClassification[]
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
): Promise<Note[]> => {
  return await apiClient.post("/supabase/get-section-notes", {
    section,
  });
};

export const determineExclusionarySectionNotes = async (
  notes: Note[],
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

  console.log("Best Candidate:", bestCandidate);

  if (bestCandidate === null) {
    throw new Error(`Failed to get best description matches`);
  }

  return JSON.parse(bestCandidate);
};

export const getBestDescriptionCandidates = async (
  elementsAtLevel: HtsWithParentReference[],
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
  elements: HtsWithParentReference[],
  indentLevel: number,
  selectionProgression: HtsLevelClassification[] = []
): Promise<HtsLevelClassification[]> => {
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

  const bestMatchJson: CandidateSelection = JSON.parse(bestMatch); // TODO: handle errors
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
    const htsLayerSelection: HtsLevelClassification = {
      selection: bestMatchElement,
      reasoning: bestMatchJson.logic,
      level: getHtsLevel(bestMatchElement.htsno),
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

export const getHtsChapterData = (chapter: string): Promise<HtsElement[]> => {
  return apiClient.get("/hts/get-chapter-data", {
    params: { chapter },
  });
};

export const getNextChunk = (
  currentChunk: HtsWithParentReference[],
  startIndex: number,
  classificationLevel: number
) => {
  const endIndex = getNextChunkEndIndex(
    currentChunk,
    startIndex,
    classificationLevel
  );

  return currentChunk.slice(startIndex, endIndex + 1);
};

export const getNextChunkEndIndex = (
  htsElementsChunk: HtsWithParentReference[],
  startIndex: number,
  classificationLevel: number
) => {
  for (let i = startIndex; i < htsElementsChunk.length; i++) {
    if (htsElementsChunk[i].indent === String(classificationLevel)) {
      return i - 1;
    }
  }

  return htsElementsChunk.length;
};
