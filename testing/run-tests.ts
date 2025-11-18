import fs from "fs";
import path from "path";
import {
  getBestClassificationProgression,
  getBestDescriptionCandidates,
  getHtsChapterData,
  getHtsSectionsAndChapters,
  getElementsWithinIndentLevelFromStartPoint,
  updateHtsDescription,
} from "../libs/hts";
import {
  CandidateSelection,
  HtsElement,
  HtsSection,
  HtsElementWithParentReference,
  ClassificationProgression,
} from "../interfaces/hts";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";

interface BestNextElementResponse {
  bestElement: HtsElementWithParentReference;
  reasoning: string;
  elementsAtLevel: HtsElementWithParentReference[];
}

interface TestCase {
  classification: string;
  description: string;
}

interface TestResult {
  description: string;
  cbpClassification: string;
  modelClassification: string;
  // TODO: need to do degree of error (section, chapter, etc..)
  match: boolean;
  classificationProgression: ClassificationProgression[];
}

interface ClassificationResult {
  htsno: string;
  classificationProgression: ClassificationProgression[];
}

const getSectionCandidates = async (productDescription: string) => {
  const { sections } = await getHtsSectionsAndChapters();
  const bestSectionCandidates = await getBestDescriptionCandidates(
    [],
    productDescription,
    true,
    0,
    2,
    sections.map((s) => s.description)
  );

  return sections.filter((section) =>
    bestSectionCandidates.bestCandidates.some(
      (candidateIndex) => candidateIndex + 1 === section.number
    )
  );
};

const getChapterCandidates = async (
  productDescription: string,
  sectionCandidates: HtsSection[]
): Promise<CandidateSelection[]> => {
  const chapterCandidates = await Promise.all(
    sectionCandidates.map(async (section) => {
      const bestChapterCandidates = await getBestDescriptionCandidates(
        [],
        productDescription,
        true,
        1,
        2,
        section.chapters.map((c) => c.description)
      );

      return bestChapterCandidates.bestCandidates.map(
        (chapterCandidateIndex) => ({
          index: section.chapters[chapterCandidateIndex].number,
          description: section.chapters[chapterCandidateIndex].description,
          // TODO: toggle this to get the logic from the best progression response
          // will also need to update the GPT response format to include the logic
          logic: "", // chapterCandidate.logic
        })
      );
    })
  );

  return chapterCandidates.flat();
};

const getHeadingCandidates = async (
  productDescription: string,
  chapterCandidates: CandidateSelection[]
): Promise<HtsElement[]> => {
  const headingCandidates = await Promise.all(
    chapterCandidates.map(async (chapter) => {
      const chapterData = await getHtsChapterData(String(chapter.index));
      const chapterDataWithParentIndex = setIndexInArray(chapterData);
      const elementsAtLevel = elementsAtClassificationLevel(
        chapterDataWithParentIndex,
        0
      );
      const bestCandidateHeadings = await getBestDescriptionCandidates(
        elementsAtLevel,
        productDescription,
        false,
        0,
        2,
        elementsAtLevel.map((e) => e.description)
      );

      // Handle Empty Case
      if (bestCandidateHeadings.bestCandidates.length === 0) {
        console.log("No Candidates");
        return [];
      }

      // Handle Negative Index Case (sometimes chatGPT will do this)
      if (bestCandidateHeadings.bestCandidates[0] < 0) {
        console.log("Negative Index");
        return [];
      }

      return bestCandidateHeadings.bestCandidates.map((candidateIndex) => {
        return elementsAtLevel[candidateIndex];
      });
    })
  );

  return headingCandidates.flat();
};

const getNextElementsChunk = (
  bestMatchElement: HtsElementWithParentReference,
  currentChunk: HtsElementWithParentReference[],
  currentIndentLevel: number
) => {
  const nextChunkStartIndex = bestMatchElement.indexInParentArray + 1;

  return setIndexInArray(
    getElementsWithinIndentLevelFromStartPoint(
      currentChunk,
      nextChunkStartIndex,
      currentIndentLevel
    )
  );
};

const getBestElementAtLevel = async (
  productDescription: string,
  htsDescription: string,
  htsElementsChunk: HtsElementWithParentReference[],
  classificationLevel: number
): Promise<BestNextElementResponse> => {
  const elementsAtLevel = elementsAtClassificationLevel(
    htsElementsChunk,
    classificationLevel
  );

  const simplifiedElementsAtLevel = elementsAtLevel.map((e) => ({
    code: e.htsno,
    description: e.description,
  }));

  const bestProgressionResponse = await getBestClassificationProgression(
    simplifiedElementsAtLevel,
    htsDescription,
    productDescription
  );

  const bestElement = elementsAtLevel[bestProgressionResponse.index];

  return {
    bestElement,
    // TODO: toggle this to get the reasoning from the best progression response
    // will also need to update the GPT response format to include the logic
    reasoning: "", // bestProgressionResponse.logic
    elementsAtLevel,
  };
};

// Function to call backend APIs in the same sequence as the frontend
async function classifyProduct(
  productDescription: string
): Promise<ClassificationResult> {
  try {
    let htsDescription: string = "";
    let htsElementsChunk: HtsElementWithParentReference[] = [];
    let classificationProgression: ClassificationProgression[] = [];
    let classificationLevel = 0;
    let selectedChapterElements: HtsElementWithParentReference[] = [];

    const sectionCadidates = await getSectionCandidates(productDescription);
    const chapterCandidates = await getChapterCandidates(
      productDescription,
      sectionCadidates
    );
    const headingCandidates = await getHeadingCandidates(
      productDescription,
      chapterCandidates
    );
    const { bestElement, reasoning } = await getBestHeading(
      productDescription,
      headingCandidates
    );
    const chapterData = await getHtsChapterData(
      bestElement.htsno.substring(0, 2)
    );

    selectedChapterElements = setIndexInArray(chapterData);
    htsElementsChunk = getNextElementsChunk(
      bestElement,
      selectedChapterElements,
      classificationLevel
    );
    classificationLevel++;
    htsDescription = updateHtsDescription(
      htsDescription,
      bestElement.description
    );
    classificationProgression = [
      ...classificationProgression,
      {
        candidates: headingCandidates,
        selection: bestElement,
        reasoning,
      },
    ];

    // Finish Classification
    while (htsElementsChunk.length > 0) {
      console.log(
        `=========== Classifying Level ${classificationLevel} ===========`
      );
      const { bestElement, reasoning } = await getBestElementAtLevel(
        productDescription,
        htsDescription,
        htsElementsChunk,
        classificationLevel
      );

      htsElementsChunk = getNextElementsChunk(
        bestElement,
        htsElementsChunk,
        classificationLevel
      );
      classificationLevel++;

      htsDescription = updateHtsDescription(
        htsDescription,
        bestElement.description
      );
      classificationProgression = [
        ...classificationProgression,
        {
          candidates: headingCandidates,
          selection: bestElement,
          reasoning,
        },
      ];
    }

    const numLevels = classificationProgression.length;
    console.log(
      "classificationProgression:",
      classificationProgression[numLevels - 1].selection
    );
    const htsno = classificationProgression[numLevels - 1].selection.htsno;

    return { htsno, classificationProgression };
  } catch (error) {
    console.error("Error classifying:", error.response?.data || error.message);
    return { htsno: null, classificationProgression: [] };
  }
}

// Run all test cases
(async () => {
  // Load test cases
  const testCasesPath = path.join(__dirname, "test-cases.json");
  const testCases: TestCase[] = JSON.parse(
    fs.readFileSync(testCasesPath, "utf-8")
  );

  // Keep Track of results
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    console.log(`Classifying: ${testCase.description}`);
    const { htsno, classificationProgression } = await classifyProduct(
      testCase.description
    );
    results.push({
      description: testCase.description,
      cbpClassification: testCase.classification,
      modelClassification: htsno || "Failed",
      classificationProgression,
      match: htsno === testCase.classification,
    });

    if (results.length > 5) break;
  }

  // TODO: consider generating a test results summary...
  const now = new Date();
  const formattedDate = now.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Replace invalid filename characters ("/" and ":" with "-")
  const safeDate = formattedDate
    .replace(/\//g, "-")
    .replace(/:/g, "-")
    .replace(",", "");

  // Save results for analysis
  fs.writeFileSync(
    `test_results-${safeDate}.json`,
    JSON.stringify(results, null, 2)
  );
  console.log(
    `Testing complete. Results saved to test_results-${safeDate}.json`
  );
})();
