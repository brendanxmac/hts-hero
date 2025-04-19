import { HtsLevelClassification, Classification } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { useState } from "react";
import { getBestClassificationProgression } from "../libs/hts";
import SquareIconButton from "./SqaureIconButton";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useClassification } from "../contexts/ClassificationContext";
import { TertiaryInformation } from "./TertiaryInformation";

interface Props {
  indentLevel: number;
}

const getFullHtsDescription = (
  classificationProgression: HtsLevelClassification[]
) => {
  let fullDescription = "";
  classificationProgression.forEach((progression, index) => {
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

export const CandidateElements = ({ indentLevel }: Props) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { setClassification, classification } = useClassification();
  const { productDescription, progressionLevels } = classification;
  const { candidates } = progressionLevels[indentLevel];

  console.log("candidates", candidates);

  const getBestCandidate = async () => {
    setLoading({
      isLoading: true,
      text: "Getting Best Candidate",
    });

    const simplifiedCandidates = candidates.map((e) => ({
      code: e.htsno,
      description: e.description,
    }));

    const bestProgressionResponse = await getBestClassificationProgression(
      simplifiedCandidates,
      getFullHtsDescription(progressionLevels),
      productDescription
    );

    console.log("bestProgressionResponse", bestProgressionResponse);

    const bestCandidate = candidates[bestProgressionResponse.index];

    console.log("bestCandidate", bestCandidate);

    // Update this classification progressions candidates to mark the bestCandidate element as suggested
    const updatedCandidates = candidates.map((e) => {
      if (e.uuid === bestCandidate.uuid) {
        return {
          ...e,
          suggested: true,
          suggestedReasoning: bestProgressionResponse.logic,
        };
      }
      return { ...e, suggested: false, suggestedReasoning: "" };
    });

    setClassification((prev: Classification) => {
      const newProgressionLevels = [...prev.progressionLevels];
      newProgressionLevels[indentLevel] = {
        ...newProgressionLevels[indentLevel],
        candidates: updatedCandidates,
      };
      return {
        ...prev,
        progressionLevels: newProgressionLevels,
      };
    });

    setLoading({
      isLoading: false,
      text: "",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {/* FIXME: For the label below, if this is the first level, show "Heading Candidates", otherwise show the selected parents  */}
        <TertiaryInformation label="Heading Candidates" value="" />
        <SquareIconButton
          icon={<SparklesIcon className="h-4 w-4" />}
          onClick={() => getBestCandidate()}
          disabled={loading.isLoading}
        />
      </div>
      <div className="w-full flex flex-col gap-2 pb-2">
        {candidates.length === 0 ? null : (
          <div className="flex flex-col gap-2 rounded-md">
            {loading.isLoading && (
              <div className="py-3">
                <LoadingIndicator text={loading.text} />
              </div>
            )}
            <div className="flex flex-col gap-4">
              {candidates.map((element) => (
                <CandidateElement
                  key={element.uuid}
                  element={element}
                  indentLevel={indentLevel}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// // Get up to 2 Best Headings Per Chapter
// const getHeadings = async () => {
//   setLoading({ isLoading: true, text: "Finding Best Headings" });
//   const candidatesForHeading: HtsElement[] = [];
//   await Promise.all(
//     chapters.map(async (chapter) => {
//       let chapterData = getChapterElements(chapter.number);
//       if (!chapterData) {
//         await fetchChapter(chapter.number);
//         chapterData = getChapterElements(chapter.number);
//       }

//       const chapterDataWithParentIndex = setIndexInArray(chapterData);
//       const elementsAtLevel = elementsAtClassificationLevel(
//         chapterDataWithParentIndex,
//         0
//       );
//       const bestCandidateHeadings = await getBestDescriptionCandidates(
//         elementsAtLevel,
//         productDescription,
//         false,
//         0,
//         2,
//         elementsAtLevel.map((e) => e.description)
//       );

//       // Handle Empty Case
//       if (bestCandidateHeadings.bestCandidates.length === 0) {
//         return;
//       }

//       // Handle Negative Index Case (sometimes chatGPT will do this)
//       if (bestCandidateHeadings.bestCandidates[0].index < 0) {
//         return;
//       }

//       const candidates = bestCandidateHeadings.bestCandidates
//         .map((candidate) => {
//           return elementsAtLevel[candidate.index];
//         })
//         .map((candidate) => ({
//           ...candidate,
//         }));

//       candidatesForHeading.push(...candidates);
//     })
//   );

//   setClassification((prev: Classification) => {
//     const newProgressionLevels = [...prev.progressionLevels];
//     newProgressionLevels[indentLevel] = {
//       ...newProgressionLevels[indentLevel],
//       candidates: candidatesForHeading,
//     };
//     return {
//       ...prev,
//       progressionLevels: newProgressionLevels,
//     };
//   });
//   // DO not move this down, it will break the classification as the timing is critical
//   setLoading({ isLoading: false, text: "" });
// };
