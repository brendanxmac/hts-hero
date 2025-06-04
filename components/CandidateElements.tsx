import { Classification, HtsElement } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { useEffect, useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { getProgressionDescriptionWithArrows } from "../libs/hts";
import { getBestClassificationProgression } from "../libs/hts";

interface Props {
  indentLevel: number;
  locallySelectedElement: HtsElement | undefined;
  setLocallySelectedElement: (element: HtsElement) => void;
}

export const CandidateElements = ({
  indentLevel,
  locallySelectedElement,
  setLocallySelectedElement,
}: Props) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { classification, setClassification } = useClassification();
  const { levels } = classification;
  const { candidates } = levels[indentLevel];
  const { articleDescription, articleAnalysis } = classification;

  useEffect(() => {
    if (
      candidates.length > 0 &&
      !classification.levels[indentLevel].recommendedElement
    ) {
      console.log("Getting best candidate automatically");
      getBestCandidate();
    }
  }, []);

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
      getProgressionDescriptionWithArrows(levels),
      articleDescription + "\n" + articleAnalysis
    );

    console.log("bestProgressionResponse", bestProgressionResponse);

    const bestCandidate = candidates[bestProgressionResponse.index];

    console.log("bestCandidate", bestCandidate);

    setClassification((prev: Classification) => {
      const newProgressionLevels = [...prev.levels];
      newProgressionLevels[indentLevel] = {
        ...newProgressionLevels[indentLevel],
        recommendedElement: bestCandidate,
        recommendationReason: bestProgressionResponse.logic,
      };
      return {
        ...prev,
        levels: newProgressionLevels,
      };
    });

    setLoading({
      isLoading: false,
      text: "",
    });
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {candidates.length > 0 && (
        <div className="h-full flex flex-col gap-2">
          {loading.isLoading && (
            <div className="py-3">
              <LoadingIndicator text={loading.text} />
            </div>
          )}
          <div className="h-full flex flex-col gap-4 overflow-y-scroll pb-4">
            {candidates.map((element) => (
              <CandidateElement
                key={element.uuid}
                element={element}
                indentLevel={indentLevel}
                locallySelectedElement={locallySelectedElement}
                setLocallySelectedElement={setLocallySelectedElement}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
