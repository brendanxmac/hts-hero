import { Classification } from "../interfaces/hts";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { useEffect, useRef } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { getProgressionDescriptionWithArrows } from "../libs/hts";
import { getBestClassificationProgression } from "../libs/hts";
import { WorkflowStep } from "../enums/hts";

interface Props {
  classificationLevel: number;
  setClassificationLevel: (level: number | undefined) => void;
  setWorkflowStep: (step: WorkflowStep) => void;
  setLoading: (loading: Loader) => void;
}

export const CandidateElements = ({
  classificationLevel,
  setClassificationLevel,
  setWorkflowStep,
  setLoading,
}: Props) => {
  const { classification, setClassification } = useClassification();
  const { levels } = classification;
  const { candidates } = levels[classificationLevel];
  const { articleDescription, articleAnalysis } = classification;
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set mounted to true when component mounts
    isMountedRef.current = true;

    if (
      candidates.length > 0 &&
      !classification.levels[classificationLevel].analysisElement
    ) {
      getBestCandidate();
    }

    // Cleanup function to mark as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getBestCandidate = async () => {
    setLoading({
      isLoading: true,
      text: "Analyzing Candidates",
    });

    const simplifiedCandidates = candidates.map((e) => ({
      code: e.htsno,
      description: e.description,
    }));

    const {
      index: suggestedCandidateIndex,
      logic: suggestionReason,
      questions: suggestionQuestions,
    } = await getBestClassificationProgression(
      simplifiedCandidates,
      getProgressionDescriptionWithArrows(levels),
      articleDescription + "\n" + articleAnalysis
    );

    // Check if component is still mounted before updating state
    if (!isMountedRef.current) {
      console.log("Component unmounted, skipping state update");
      return;
    }

    const bestCandidate = candidates[suggestedCandidateIndex - 1];

    const newProgressionLevels = [...classification.levels];
    newProgressionLevels[classificationLevel] = {
      ...newProgressionLevels[classificationLevel],
      analysisElement: bestCandidate,
      analysisReason: suggestionReason,
      analysisQuestions: suggestionQuestions,
    };

    setClassification({
      ...classification,
      levels: newProgressionLevels,
    });

    setLoading({
      isLoading: false,
      text: "",
    });
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {candidates.length > 0 && (
        <div className="h-full flex flex-col gap-4 pb-4">
          {candidates.map((element) => (
            <CandidateElement
              key={element.uuid}
              element={element}
              classificationLevel={classificationLevel}
              setClassificationLevel={setClassificationLevel}
              setWorkflowStep={setWorkflowStep}
            />
          ))}
        </div>
      )}
    </div>
  );
};
