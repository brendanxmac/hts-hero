import { HtsElement, HtsLevelClassification } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { classNames } from "../utilities/style";
import { useEffect, useState } from "react";
import { getBestClassificationProgression, getHtsLevel } from "../libs/hts";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";

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

  console.log("fullDescription", fullDescription);

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

  // useEffect(() => {
  //   console.log("candidates updated", candidates);
  //   const suggestionsProvided = candidates.some((e) => e.suggested);
  //   const numCandidates = candidates.length;

  //   // TODO: If just a single element might want to select it and provide a general reasoning
  //   if (numCandidates <= 1) return;

  //   if (numCandidates > 1 && !suggestionsProvided) {
  //     console.log("Getting Best Candidate");
  //     getBestCandidate();
  //   }
  // }, [candidates]);

  useEffect(() => {
    setShowDetails(!Boolean(selectedElement));
  }, [selectedElement]);

  return (
    <div
      className={classNames(
        "w-full flex flex-col gap-2 pb-2"
        // (selectedElement || (candidates.length === 0 && showDetails)) &&
        //   "border-none"
      )}
    >
      {/* <div
        className={classNames(
          "flex justify-between items-center p-2 rounded-md hover:bg-primary/20"
        )}
        onClick={() => setShowDetails(!showDetails)}
      >
        <TertiaryInformation label={`Level ${indentLevel + 1}`} value="" />
        <ChevronUpIcon
          className={classNames(
            "w-5 h-5 text-primary transition-transform duration-200 ease-in-out",
            showDetails && "rotate-180"
          )}
        />
      </div> */}

      {/* {candidates.length === 0 ? (
        !showDetails ? null : (
          <div className="flex flex-col gap-2 rounded-md p-4 items-center justify-center">
            <div className="w-full flex items-center justify-evenly py-6">
              <div className="min-w-28 flex flex-col items-center justify-center gap-2">
                <SquareIconButton
                  icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                  onClick={() => {
                    const previousLevel =
                      classificationProgression[indentLevel - 1];
                    console.log(`previousLevel`, previousLevel);
                    if (previousLevel && previousLevel.selection) {
                      clearBreadcrumbs();
                      addBreadcrumb(previousLevel.selection);
                    }
                  }}
                  disabled={
                    breadcrumbs[breadcrumbs.length - 1].element.type ===
                      Navigatable.ELEMENT &&
                    // @ts-ignore
                    breadcrumbs[breadcrumbs.length - 1].element.uuid ===
                      classificationProgression[indentLevel - 1].selection?.uuid
                  }
                />
                <p className="text-xs text-base-content/50">Select Elements</p>
              </div>

              <div className="h-full w-px bg-base-content/20"></div>
              <div className="min-w-28 flex flex-col items-center gap-2">
                <SquareIconButton
                  icon={<SparklesIcon className="h-4 w-4" />}
                  onClick={() => getBestCandidate()}
                />
                <p className="text-xs text-base-content/50">Get Suggestions</p>
              </div>
            </div>
          </div>
        )
      ) :  */}
      {/* 
      {!showDetails && selectedElement ? (
        <div className="flex flex-col gap-2">
          <CandidateElement
            key={selectedElement.uuid}
            element={selectedElement}
            indentLevel={indentLevel}
            isSelectedElement={selectedElement?.uuid === selectedElement.uuid}
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
        </div>
      ) : !showDetails && !selectedElement ? null : ( */}
      <div className="flex flex-col gap-2">
        {loading.isLoading && (
          <div className="py-3">
            <LoadingIndicator text={loading.text} />
          </div>
        )}

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
      {/* )} */}
    </div>
  );
};
