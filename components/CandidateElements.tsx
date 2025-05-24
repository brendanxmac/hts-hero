import { HtsElement } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";

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
  const [loading, _] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { classification } = useClassification();
  const { levels } = classification;
  const { candidates } = levels[indentLevel];
  // const [_, setRecommended] = useState<HtsElement | undefined>(undefined);

  // FIXME: recommended gets lost every time we navigate away from this component to another tab
  // which means that this flow control will not only ever do the best candidate once, but every time we come to this component
  // useEffect(() => {
  //   console.log("INITIAL RENDER HERE");
  //   console.log("recommended", recommended);
  //   if (candidates.length > 0 && !recommended) {
  //     console.log("Getting best candidate automatically");
  //     getBestCandidate();
  //   }
  // }, []);

  // const getBestCandidate = async () => {
  //   setLoading({
  //     isLoading: true,
  //     text: "Getting Best Candidate",
  //   });

  //   const simplifiedCandidates = candidates.map((e) => ({
  //     code: e.htsno,
  //     description: e.description,
  //   }));

  //   const bestProgressionResponse = await getBestClassificationProgression(
  //     simplifiedCandidates,
  //     getProgressionDescription(levels),
  //     articleDescription
  //   );

  //   console.log("bestProgressionResponse", bestProgressionResponse);

  //   const bestCandidate = candidates[bestProgressionResponse.index];

  //   console.log("bestCandidate", bestCandidate);

  //   // Update this classification progressions candidates to mark the bestCandidate element as suggested
  //   const updatedCandidates = candidates.map((e) => {
  //     if (e.uuid === bestCandidate.uuid) {
  //       return {
  //         ...e,
  //         recommended: true,
  //         recommendedReason: bestProgressionResponse.logic,
  //       };
  //     }
  //     return { ...e, recommended: false, recommendedReason: "" };
  //   });

  //   setClassification((prev: Classification) => {
  //     const newProgressionLevels = [...prev.levels];
  //     newProgressionLevels[indentLevel] = {
  //       ...newProgressionLevels[indentLevel],
  //       candidates: updatedCandidates,
  //     };
  //     return {
  //       ...prev,
  //       levels: newProgressionLevels,
  //     };
  //   });

  //   setLoading({
  //     isLoading: false,
  //     text: "",
  //   });

  //   setRecommended(bestCandidate);
  // };

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
