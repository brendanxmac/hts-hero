import { ChatCompletion } from "openai/resources";
import {
  HtsWithParentReference,
  HtsLayerSelection,
  MatchResponse,
  HsHeading,
  HtsRaw,
} from "../interfaces/hts";
import { elementsAtIndentLevel, setIndexInArray } from "../utilities/data";
import { OpenAIModel } from "./openai";
import apiClient from "@/libs/api";

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

// Recursive function that implements the sliding window approach to find
// the single best HTS Codes for a product description
export const getBestIndentLevelMatch = async (
  productDescription: string,
  htsDescription: string, // used to compare against product description at each level, with each NEW descriptor
  elements: HtsWithParentReference[],
  indentLevel: number,
  selectionProgression: HtsLayerSelection[] = []
): Promise<HtsLayerSelection[]> => {
  console.log(`===== INDENT LEVEL: ${indentLevel} =====`);
  // Get all Elements at the indent level -- This relies on the "indent" in the hts data always being a number when converted to string
  let elementsAtIndent = elementsAtIndentLevel(elements, indentLevel);

  // Get the full descriptions for all elements at this indent level
  const descriptions = getHtsElementDescriptions(elementsAtIndent);
  //   console.log("descriptions:");
  //   console.log(descriptions);

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

export const getHtsCode = async (productDescription: string) => {
  console.log("Finding best HTS Code...");
  const hsHeadingsResponse: Array<ChatCompletion.Choice> = await apiClient.post(
    "/openai/get-hs-headings",
    {
      productDescription,
      model: OpenAIModel.FOUR,
    }
  );
  console.log("GPT Headings:");
  console.log(hsHeadingsResponse[0].message.content);

  const hsHeadings = hsHeadingsResponse[0].message.content;

  if (hsHeadings) {
    // TODO: Consider doing this for all headings...
    const parsed: HsHeading[] = JSON.parse(hsHeadings);
    const heading = parsed[0].heading;
    const chapter = heading.substring(0, 2);
    console.log(`First Heading: ${heading}`);
    // TODO: Consider jumping right to heading level and not doing chapter...

    const htsChapterJson: HtsRaw[] = await apiClient.get(
      "/hts/get-chapter-data",
      {
        params: { chapter },
      }
    );

    const htsChapterJsonWithIndex: HtsWithParentReference[] =
      setIndexInArray(htsChapterJson);

    const htsSelectionProgression = await getBestIndentLevelMatch(
      productDescription,
      "",
      htsChapterJsonWithIndex,
      0
    );

    console.log(
      htsSelectionProgression.map((s) => ({
        code: s.element.htsno,
        tariff: s.element.general,
        footnotes: s.element.footnotes,
        logic: s.logic,
      }))
    );

    for (let i = htsSelectionProgression.length - 1; i > 0; i--) {
      if (htsSelectionProgression[i].element.general) {
        // todo: see if this accounts for all cases / edge cases
        console.log(
          `Got Tarrif at ${htsSelectionProgression[i].element.htsno}`
        );
        console.log(htsSelectionProgression[i].element.general);
        if (htsSelectionProgression[i].element.footnotes.length) {
          console.log(`Element has footnotes:`);
          console.log(htsSelectionProgression[i].element.footnotes);
        }
      }
    }

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
  }
};
