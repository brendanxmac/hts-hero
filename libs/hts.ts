import { ChatCompletion } from "openai/resources";
import {
  HtsWithParentReference,
  HtsLevelDecision,
  MatchResponse,
  HsHeading,
  HtsElement,
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
  selectionProgression: HtsLevelDecision[]
) => {
  for (let i = selectionProgression.length - 1; i > 0; i--) {
    const selectedElement = selectionProgression[i].selection;
    if (selectedElement.general) {
      return selectedElement.general;
    }
  }

  return "Unknown";
};

export const getTariffForCode = async (htsCode: string) => {
  const chapter = htsCode.substring(0, 2);
  console.log(`chapter: ${chapter}`);

  const chapterData = await getHtsChapterData(chapter);
  if (!chapterData) throw new Error("Failed to get chapter json");

  const htsElement = chapterData.find((c) => c.htsno === htsCode);
  if (!htsElement) throw new Error("No Element");

  console.log("Got Element");
  console.log(htsElement);

  return htsElement.general;
};

export const extractCode = (input: string): string => {
  // Use a regular expression to match the numeric code pattern
  const match = input.match(/(\d{4}\.\d{2}\.\d{2})/);

  // If a match is found, return the first capture group; otherwise, return an empty string
  return match ? match[1] : "";
};

export const getFootnotes = async (
  selectionProgression: HtsLevelDecision[]
) => {
  for (let i = selectionProgression.length - 1; i > 0; i--) {
    const selectedElement = selectionProgression[i].selection;
    if (selectedElement.footnotes) {
      console.log(selectedElement.footnotes);
      const tariffFootnotes = selectedElement.footnotes.filter((f) =>
        f.columns.includes("general")
      );
      const codes = tariffFootnotes.map((f) => extractCode(f.value));
      console.log(`codes:`);
      console.log(codes);
      const promises = codes.map((c) => getTariffForCode(c));
      const tariffs = await Promise.all(promises);
      console.log(`tariffs:`);
      console.log(tariffs);

      return tariffs.join("\n");
    }
  }

  return "No footnotes";
};

function countChunks(htsCode: string): number {
  // Split the input string into an array of chunks separated by periods
  const chunks = htsCode.split(".");

  // Remove empty chunks caused by trailing periods
  const filteredChunks = chunks.filter(
    (chunk, index) => chunk !== "" || index !== chunks.length - 1
  );

  // Count valid chunks based on the rules
  const count = filteredChunks.reduce((acc, chunk, index) => {
    // Skip counting the chunk if it's "00" and not the last chunk
    if (chunk === "00" && index !== filteredChunks.length - 1) {
      return acc;
    }
    return acc + 1;
  }, 0);

  return count;
}

export const getHtsLevel = (htsCode: string) => {
  const chunks = countChunks(htsCode);

  if (chunks === 1) return HtsLevel.HEADING;
  if (chunks === 2) return HtsLevel.SUBHEADING;
  if (chunks === 3) return HtsLevel.US_SUBHEADING;
  if (chunks === 4) return HtsLevel.STAT_SUFFIX;

  console.error(`Unaccounted for HTS Code: ${htsCode}`);
  return HtsLevel.US_SUBHEADING;
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
  selectionProgression: HtsLevelDecision[] = []
): Promise<HtsLevelDecision[]> => {
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
    const htsLayerSelection: HtsLevelDecision = {
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
  results: HtsLevelDecision[]
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