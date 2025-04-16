import { HtsElement, HtsLevelClassification } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { classNames } from "../utilities/style";
import { useEffect, useState } from "react";
import {
  getBestClassificationProgression,
  getBestDescriptionCandidates,
  getHtsLevel,
} from "../libs/hts";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import SquareIconButton from "./SqaureIconButton";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { HtsLevel } from "../enums/hts";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { useChapters } from "../contexts/ChaptersContext";
import { useClassification } from "../contexts/ClassificationContext";
import { TertiaryInformation } from "./TertiaryInformation";

interface Props {
  productDescription: string;
  indentLevel: number;
  classificationProgression: HtsLevelClassification[];
  setClassificationProgression: (
    classificationProgression: HtsLevelClassification[]
  ) => void;
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

export const CandidateElements = ({
  productDescription,
  indentLevel,
  classificationProgression,
  setClassificationProgression,
}: Props) => {
  const { candidates, selection, level, reasoning } =
    classificationProgression[indentLevel];
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const [showDetails, setShowDetails] = useState(true);
  const [selectedElement, setSelectedElement] = useState<HtsElement | null>(
    null
  );
  const { addBreadcrumb, clearBreadcrumbs, breadcrumbs } = useBreadcrumbs();
  const { getChapterElements, fetchChapter, chapters } = useChapters();
  const { addToClassificationProgression } = useClassification();

  // Get up to 2 Best Headings Per Chapter
  const getHeadings = async () => {
    setLoading({ isLoading: true, text: "Finding Best Headings" });
    const candidatesForHeading: HtsElement[] = [];
    await Promise.all(
      chapters.map(async (chapter) => {
        let chapterData = getChapterElements(chapter.number);
        if (!chapterData) {
          await fetchChapter(chapter.number);
          chapterData = getChapterElements(chapter.number);
        }

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
          return;
        }

        // Handle Negative Index Case (sometimes chatGPT will do this)
        if (bestCandidateHeadings.bestCandidates[0].index < 0) {
          return;
        }

        const candidates = bestCandidateHeadings.bestCandidates
          .map((candidate) => {
            return elementsAtLevel[candidate.index];
          })
          .map((candidate) => ({
            ...candidate,
          }));

        candidatesForHeading.push(...candidates);
      })
    );

    addToClassificationProgression(HtsLevel.HEADING, candidatesForHeading);
    // DO not move this down, it will break the classification as the timing is critical
    setLoading({ isLoading: false, text: "" });
  };

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
      getFullHtsDescription(classificationProgression),
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
      return e;
    });

    // Make a local copy of the classification progression
    const updatedClassificationProgression = [...classificationProgression];
    updatedClassificationProgression[indentLevel] = {
      ...updatedClassificationProgression[indentLevel],
      candidates: updatedCandidates,
    };

    setClassificationProgression(updatedClassificationProgression);

    setLoading({
      isLoading: false,
      text: "",
    });
  };

  useEffect(() => {
    setShowDetails(!Boolean(selectedElement));
  }, [selectedElement]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <TertiaryInformation label="Heading Candidates" value="" />
        <SquareIconButton
          icon={<SparklesIcon className="h-4 w-4" />}
          onClick={() => getBestCandidate()}
        />
      </div>
      <div className={classNames("w-full flex flex-col gap-2 pb-2")}>
        {candidates.length === 0 ? (
          !showDetails ? null : (
            <div className="bg-base-300 flex flex-col gap-2 rounded-md p-4 items-center justify-center">
              <div className="w-full flex items-center justify-evenly py-6">
                <div className="min-w-28 flex flex-col items-center gap-2">
                  <SquareIconButton
                    icon={<SparklesIcon className="h-4 w-4" />}
                    onClick={() => getHeadings()}
                  />
                  <p className="text-xs text-base-content/50">
                    Get Suggestions
                  </p>
                </div>
                <div className="h-full w-px bg-base-content/20"></div>
                <div className="min-w-28 flex flex-col items-center justify-center gap-2">
                  <ArrowRightIcon className="h-4 w-4" />
                  <p className="text-xs text-base-content/50 flex items-center gap-2">
                    Select your own
                  </p>
                </div>
              </div>
            </div>
          )
        ) : (
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
                  isSelectedElement={selectedElement?.uuid === element.uuid}
                  classificationProgression={classificationProgression}
                  setClassificationProgression={setClassificationProgression}
                  setSelectedElement={(element) => {
                    setSelectedElement(element);
                    const newClassificationProgression =
                      classificationProgression.slice(0, indentLevel);
                    setClassificationProgression([
                      ...newClassificationProgression,
                      {
                        level: getHtsLevel(
                          element && element.htsno ? element.htsno : ""
                        ),
                        candidates: candidates,
                        selection: element,
                        reasoning: "",
                      },
                    ]);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
