import { ChatCompletion } from "openai/resources";
import {
  HtsWithParentReference,
  HtsLevelClassification,
  MatchResponse,
  HsHeading,
  HtsElement,
  Tariff,
  TemporaryTariff,
  Footnote,
} from "../interfaces/hts";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { OpenAIModel } from "./openai";
import apiClient from "@/libs/api";
import { HtsLevel } from "../enums/hts";

export const stringContainsHTSCode = (str: string) => {
  // Regular expression to match HTS codes
  const htsRegex = /\b\d{4}\.\d{2}\.\d{2}(?:\.\d{2})?\b/;

  // Test if string contain any HTS codes
  return htsRegex.test(str);
};

export function isFullHTSCode(code: string) {
  // Regular expression to validate HTS code with the updated format
  const htsCodeRegex = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/;
  return htsCodeRegex.test(code);
}

export const getHtsElementDescriptions = (
  elementsAtIndexLevel: HtsWithParentReference[]
) => {
  // Get just the descriptions at this indent level
  return elementsAtIndexLevel.map((e) => e.description);
};

export const getTarrifForProgression = (
  selectionProgression: HtsLevelClassification[]
) => {
  for (let i = selectionProgression.length - 1; i > 0; i--) {
    const selectedElement = selectionProgression[i].selection;
    if (selectedElement.general) {
      return selectedElement.general;
    }
  }

  return "Unknown";
};

export const findFirstElementInProgressionWithTariff = (
  classificationProgression: HtsLevelClassification[]
) => {
  const numClassificationElements = classificationProgression.length;

  for (let i = numClassificationElements - 1; i > 0; i--) {
    if (classificationProgression[i].selection.general) {
      return classificationProgression[i].selection;
    }
  }

  throw new Error(
    `Could not find any element in progression with general tariff specified`
  );
};

export const getBaseTariff = (
  classificationProgression: HtsLevelClassification[]
): Tariff => {
  const elementWithTariffInProgression =
    findFirstElementInProgressionWithTariff(classificationProgression);

  return {
    htsCode: elementWithTariffInProgression.htsno,
    rate: elementWithTariffInProgression.general,
  };
};

export const getTemporaryTariffs = async (
  htsElement: HtsElement
): Promise<TemporaryTariff[]> => {
  // Get general footnotes
  const tariffFootnotes = getGeneralFootnotes(htsElement);

  // If none, great, found simple tariff
  if (tariffFootnotes.length === 0) {
    console.log("No Tariff Footnotes");
    return [];
  }

  console.log(`Tariff Footnotes:`);
  console.log(tariffFootnotes);

  // otherwise, try to get as much tariff info as possible for each
  // tariff footnote spefified for the given HTS Element
  let tariffs: TemporaryTariff[] = tariffFootnotes.map((f) => ({
    description: f.value,
  }));

  console.log(`Attemping to Enrich...`);

  const enrichedTempTariffs = await Promise.all(
    tariffs.map(async (t) => {
      const isSimpleTariff = isDirectHtsElementReference(t.description);

      if (isSimpleTariff) {
        console.log(`Enriching: ${t.description}`);
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
  console.log(`Chapter: ${chapter}`);

  const chapterData = await getHtsChapterData(chapter);
  if (!chapterData) throw new Error(`Failed to get chapter ${chapter} json`);

  const htsElement = chapterData.find((c) => c.htsno === htsCode);
  if (!htsElement)
    throw new Error(
      `Failed to find matching element for ${htsCode} in chapter ${chapter}`
    );

  console.log("Got Element");
  console.log(htsElement);

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

  // If a match is found, return the first capture group; otherwise, return an empty string
  return match ? match[1] : "";
};

export const getTemporaryTariffsForClassification = async (
  classificationProgression: HtsLevelClassification[]
): Promise<TemporaryTariff[]> => {
  let temporaryTariffs: TemporaryTariff[] = [];

  for (let i = classificationProgression.length - 1; i > 0; i--) {
    const selectedElement = classificationProgression[i].selection;
    const { footnotes } = selectedElement;
    const hasFootnotes = footnotes && footnotes.length;

    if (hasFootnotes) {
      const generalTariffFootnotes = footnotes.filter((f) =>
        f.columns.includes("general")
      );
      if (generalTariffFootnotes.length) {
        const codes = generalTariffFootnotes.map((f) =>
          extractFirst8DigitHtsCode(f.value)
        );
        console.log(`codes:`);
        console.log(codes);
        const promises = codes.map((c) => getHtsElementForCode(c));
        const tariffs = await Promise.all(promises);
        console.log(`tariffs:`);
        console.log(tariffs);
      }
    }
  }

  return temporaryTariffs;
};

/**
 * Determines the HTS classification level of a given string.
 *
 * @param input - The HTS code as a string (e.g., "1234", "1234.56", etc.).
 * @returns A string representing the classification level ("Heading", "Subheading", "US Subheading", or "Stat Suffix"), or "Invalid" if it doesn't match any level.
 */
export const getHtsLevel = (input: string): HtsLevel => {
  // Remove trailing periods from the input
  const sanitizedInput = input.trim().replace(/\.*$/g, "");

  // Define regular expressions for each HTS level
  const headingRegex = /^\d{4}$/; // Matches "xxxx"
  const subheadingRegex = /^\d{4}\.\d{2}$/; // Matches "xxxx.xx"
  const usSubheadingRegex = /^\d{4}\.\d{2}\.\d{2}$/; // Matches "xxxx.xx.xx"
  const statSuffixRegex = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/; // Matches "xxxx.xx.xx.xx"

  // Determine the HTS classification level
  if (sanitizedInput === "") {
    return HtsLevel.PREQUALIFIER;
  } else if (headingRegex.test(sanitizedInput)) {
    return HtsLevel.HEADING;
  } else if (subheadingRegex.test(sanitizedInput)) {
    return HtsLevel.SUBHEADING;
  } else if (usSubheadingRegex.test(sanitizedInput)) {
    return HtsLevel.US_SUBHEADING;
  } else if (statSuffixRegex.test(sanitizedInput)) {
    return HtsLevel.STAT_SUFFIX;
  } else {
    console.error(`Unaccounted for HTS Code: ${input}`);
    return HtsLevel.MISCELLANEOUS;
  }
};

export const getBestMatchAtClassificationLevel = async (
  elementAtLevel: HtsWithParentReference[],
  indentLevel: number,
  productDescription: string,
  htsDescription: string
): Promise<MatchResponse> => {
  const descriptions = getHtsElementDescriptions(elementAtLevel);
  const bestMatchResponse: Array<ChatCompletion.Choice> = await apiClient.post(
    "/openai/get-best-description-match",
    {
      htsDescription,
      descriptions,
      productDescription,
      model: OpenAIModel.FOUR,
    }
  );

  const bestMatch = bestMatchResponse[0].message.content;

  if (bestMatch === null) {
    throw new Error(`Failed to get best match at level ${indentLevel}`);
  }

  return JSON.parse(bestMatch);
};

export const updateHtsDescription = (
  description: string,
  bestMatch: MatchResponse
) => {
  // Tack best matches description onto the htsDescription
  return description
    ? description + " > " + bestMatch.description
    : bestMatch.description;
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
  console.log(`===== INDENT LEVEL: ${indentLevel} =====`);
  // Get all Elements at the indent level -- This relies on the "indent" in the hts data always being a number when converted to string
  let elementsAtIndent = elementsAtClassificationLevel(elements, indentLevel);

  // Get the full descriptions for all elements at this indent level
  const descriptions = getHtsElementDescriptions(elementsAtIndent);

  // Find BEST Description amongst the bunch:
  const bestMatchResponse: Array<ChatCompletion.Choice> = await apiClient.post(
    "/openai/get-best-description-match",
    {
      htsDescription,
      descriptions,
      productDescription,
      model: OpenAIModel.FOUR,
    }
  );

  const bestMatch = bestMatchResponse[0].message.content;
  if (bestMatch === null) {
    throw new Error(`Best match is null for descriptions`);
  }

  const bestMatchJson: MatchResponse = JSON.parse(bestMatch); // TODO: handle errors

  // Tack best matches description onto the htsDescription
  htsDescription = htsDescription
    ? htsDescription + " > " + bestMatchJson.description
    : bestMatchJson.description;

  // Determine if this is the end...
  //  1. Grab the element that was just determined to be the best match
  const bestMatchElement = elementsAtIndent.find(
    (i) => i.description === bestMatchJson.description
  );

  if (!bestMatchElement) {
    throw new Error(
      `Error getting best match element with description: ${bestMatchJson.description}`
    );
  } else {
    // Add Selection Layer to overall selection progression
    const htsLayerSelection: HtsLevelClassification = {
      selection: bestMatchElement,
      reasoning: bestMatchJson.logic,
    };

    selectionProgression.push(htsLayerSelection);

    const gotFullHtsCode = isFullHTSCode(bestMatchElement.htsno);

    if (gotFullHtsCode) {
      console.log(`HTS CODE: ${bestMatchElement.htsno}`);
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

  if (!hsHeadings)
    throw new Error(`failed to get HS Headings for product description`);

  // TODO: Consider doing this for all headings
  // TODO: Consider jumping right to heading and not back to chapter...

  const parsed: HsHeading[] = JSON.parse(hsHeadings);
  const chapter = parsed[0].heading.substring(0, 2);
  console.log(`Chapter ${chapter}`);

  return chapter;
};

export const getHtsChapterData = (chapter: string): Promise<HtsElement[]> => {
  return apiClient.get("/hts/get-chapter-data", {
    params: { chapter },
  });
};

export const getFullClassificationDescription = (
  results: HtsLevelClassification[]
) => {
  const numElements = results.length - 1;
  let fullDescription = "";

  results.map((result, i) => {
    if (result.selection.htsno) {
      if (i < numElements) {
        fullDescription =
          fullDescription +
          `${result.selection.htsno ? `${result.selection.htsno}: ` : ""}` +
          result.selection.description +
          "\n\n";
      } else {
        fullDescription =
          fullDescription +
          `${result.selection.htsno ? `${result.selection.htsno}: ` : ""}` +
          result.selection.description;
      }
    }
  });

  return `${fullDescription}`;
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
  let endIndex = startIndex;

  for (let i = startIndex; i < htsElementsChunk.length; i++) {
    if (htsElementsChunk[i].indent === String(classificationLevel)) {
      return i - 1;
    }
  }

  if (endIndex === startIndex) {
    return htsElementsChunk.length;
  }

  throw new Error("Failed to get next chunk end index");
};

// TODO: get the total tariff for this item
//   const hsCode = htsSelectionProgression[
//     htsSelectionProgression.length - 1
//   ].element.htsno.substring(0, 7);
//   const htsUsItcResponse = await searchKeyword(hsCode);
//   console.log(
//     `Searching https://hts.usitc.gov/reststop/search?keyword=${hsCode}...`
//   );
//   const htsCodes = htsUsItcResponse.data;
// get total tariff -- assume import from china
// does final code have rate?
