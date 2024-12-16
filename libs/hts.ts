import { promises } from "fs";
import {
  HtsWithParentReference,
  HtsLayerSelection,
  MatchResponse,
} from "../interfaces/hts";
import { elementsAtIndentLevel, setIndexInArray } from "../utilities/data";
import { bestStringMatch, OpenAIModel } from "./openai";

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

export const getHTSChapterData = async <T>(
  chapterNumber: string
): Promise<T[]> => {
  const data = await promises.readFile(
    `hts-chapters/${chapterNumber}.json`,
    "utf8"
  );
  return JSON.parse(data);
};

export const getHtsElementDescriptions = (
  elementsAtIndexLevel: HtsWithParentReference[]
) => {
  // Get just the descriptions at this indent level
  return elementsAtIndexLevel.map((e) => e.description);
};

// Recursive function that implements the sliding window approach to find
// the single best HTS Codes for a product description
export const findBestHtsCode = async (
  productDescription: string,
  htsDescription: string, // used to compare against product description at each level, with each NEW descriptor
  elements: HtsWithParentReference[],
  indentLevel: number,
  selectionProgression: HtsLayerSelection[] = []
): Promise<HtsLayerSelection[]> => {
  console.log("========================");
  console.log(`INDENT LEVEL: ${indentLevel}`);
  console.log(`ELEMENTS: ${elements.length}`);
  console.log("========================");
  // Get all Elements at the indent level -- This relies on the "indent" in the hts data always being a number when converted to string
  let elementsAtIndent = elementsAtIndentLevel(elements, indentLevel);

  // Get the full descriptions for all elements at this indent level
  const descriptions = getHtsElementDescriptions(elementsAtIndent);
  //   console.log("descriptions:");
  //   console.log(descriptions);

  // Find BEST Description amongst the bunch:
  const bestMatchResponse = await bestStringMatch(
    htsDescription,
    descriptions,
    productDescription,
    OpenAIModel.FOUR
  );

  const bestMatch = bestMatchResponse.choices[0].message.content;
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
    (i) => i.description === bestMatchJson.description // TODO: this might be broken, possible for descriptions to be the same, but NOT at the same level...
  );

  if (!bestMatchElement) {
    throw new Error(
      `Error getting best match element with description: ${bestMatchJson.description}`
    );
  } else {
    // Add Selection Layer to overall selection progression
    const htsLayerSelection: HtsLayerSelection = {
      element: bestMatchElement,
      logic: bestMatchJson.logic,
    };
    // console.log(`Selection for indent ${indentLevel}`);
    // console.log(htsLayerSelection);
    selectionProgression.push(htsLayerSelection);
    //  2. See if it's a full HTS code, if so return
    const gotFullHtsCode = isFullHTSCode(bestMatchElement.htsno);
    console.log(`GOT FULL HTS CODE: ${bestMatchElement.htsno}`);

    if (gotFullHtsCode) return selectionProgression;

    // Get END of new slice index which will be either:
    const startIndex = bestMatchElement.indexInParentArray + 1;
    console.log(`Start Index: ${startIndex}`);
    let endIndex = startIndex;

    for (let i = startIndex + 1; i < elements.length; i++) {
      if (elements[i].indent === String(indentLevel)) {
        endIndex = i - 1;
        console.log(`End Index (1): ${endIndex}`);
        break;
      }
    }

    if (endIndex === startIndex) {
      endIndex = elements.length;
      console.log(`END Index (2): ${endIndex}`);
    }

    let nextChunk = elements.slice(startIndex, endIndex + 1);
    nextChunk = setIndexInArray(nextChunk);

    // Recurse with updated data
    return findBestHtsCode(
      productDescription,
      htsDescription,
      nextChunk,
      indentLevel + 1,
      selectionProgression
    );
  }
};
