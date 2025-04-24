import {
  HtsLevelClassification,
  Classification,
  HtsElement,
} from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { useEffect, useState } from "react";
import { getBestClassificationProgression } from "../libs/hts";
import { useClassification } from "../contexts/ClassificationContext";
import { SecondaryLabel } from "./SecondaryLabel";
import { Color } from "../enums/style";

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
  const [recommended, setRecommended] = useState<HtsElement | undefined>(
    undefined
  );

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

    setRecommended(bestCandidate);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SecondaryLabel value="Candidates:" color={Color.WHITE} />
      </div>

      {candidates.length > 0 && (
        <div className="w-full flex flex-col gap-2 pb-2">
          <div className="flex flex-col gap-2 rounded-md">
            {loading.isLoading && (
              <div className="py-3">
                <LoadingIndicator text={loading.text} />
              </div>
            )}
            <div className="flex flex-col gap-4 overflow-y-auto">
              {candidates.map((element) => (
                <CandidateElement
                  key={element.uuid}
                  element={element}
                  indentLevel={indentLevel}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
