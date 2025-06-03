import {
  BestProgressionResponse,
  Classification,
  HtsElement,
} from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { useEffect, useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import {
  getProgressionDescription,
  seeIfAnyInformationIsMissing,
} from "../libs/hts";
import { getBestClassificationProgression } from "../libs/hts";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import { PrimaryLabel } from "./PrimaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";
import { SecondaryLabel } from "./SecondaryLabel";
import { Color } from "../enums/style";
import { TertiaryText } from "./TertiaryText";

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
  const { classification, setClassification, addChatMessage } =
    useClassification();
  const { setActiveTab } = useClassifyTab();
  const { levels } = classification;
  const { candidates } = levels[indentLevel];
  const { articleDescription, progressionDescription, chatMessages } =
    classification;
  const [confirmationQuestion, setConfirmationQuestion] = useState<{
    question: string;
    reason: string;
  } | null>(null);

  useEffect(() => {
    // TODO: improve the logic here so that we only try to get the best once
    console.log("HERERERE");
    if (candidates.length === 0) {
      console.log("No candidates found");
      console.log("Getting best candidate automatically");
      getBestCandidate();
    }
  }, []);

  const findMissingInformation = async (candidates: HtsElement[]) => {
    const simplifiedCandidates = candidates.map((e) => ({
      code: e.htsno,
      description: e.description,
    }));

    const missingInformation = await seeIfAnyInformationIsMissing(
      simplifiedCandidates,
      articleDescription,
      progressionDescription
    );

    if (missingInformation.followUpQuestion || missingInformation.reason) {
      addChatMessage({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        role: "assistant",
        content: missingInformation.followUpQuestion,
      });
      setConfirmationQuestion({
        question: missingInformation.followUpQuestion,
        reason: missingInformation.reason,
      });
    }

    console.log("missingInformation", missingInformation.followUpQuestion);
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
      getProgressionDescription(levels),
      articleDescription,
      chatMessages
    );

    console.log("bestProgressionResponse", bestProgressionResponse);

    if (
      "followUpQuestion" in bestProgressionResponse &&
      bestProgressionResponse.followUpQuestion
    ) {
      console.log(
        "is followUpQuestion:",
        bestProgressionResponse.followUpQuestion
      );
      // do the things...
      addChatMessage({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        role: "assistant",
        content: bestProgressionResponse.followUpQuestion,
      });
      setActiveTab(ClassifyTab.CHAT);
    } else {
      // if the response is a best progression response type, we can continue the happy path classification flow
      const bestProgression =
        bestProgressionResponse as BestProgressionResponse;
      const bestCandidate = candidates[bestProgression.index];

      console.log("bestCandidate", bestCandidate);

      setClassification((prev: Classification) => {
        const newProgressionLevels = [...prev.levels];
        newProgressionLevels[indentLevel] = {
          ...newProgressionLevels[indentLevel],
          recommendedElement: bestCandidate,
          recommendationReason: bestProgression.logic,
        };
        return {
          ...prev,
          levels: newProgressionLevels,
        };
      });
    }

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
            <div className="flex gap-4">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  // if (candidates.length > 1) {
                  findMissingInformation(candidates);
                  // }
                }}
              >
                Find Missing Information
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (candidates.length > 1) {
                    getBestCandidate();
                  }
                }}
              >
                Get Best Candidate
              </button>
            </div>
            {confirmationQuestion && (
              <div className="flex flex-col gap-6 bg-base-100 border-4 border-primary p-4 rounded-md">
                <div className="flex flex-col gap-2">
                  <TertiaryLabel value="Confirmation Question" />
                  <PrimaryLabel
                    value={confirmationQuestion.question}
                    color={Color.WHITE}
                  />
                  <TertiaryText value={confirmationQuestion.reason} />
                </div>
                <div className="flex gap-3 justify-around">
                  <button
                    className="btn btn-primary grow"
                    onClick={() => {
                      addChatMessage({
                        id: crypto.randomUUID(),
                        timestamp: new Date(),
                        role: "user",
                        content: "No",
                      });
                    }}
                  >
                    No
                  </button>
                  <button
                    className="btn btn-primary grow"
                    onClick={() => {
                      addChatMessage({
                        id: crypto.randomUUID(),
                        timestamp: new Date(),
                        role: "user",
                        content: "Yes",
                      });
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            )}
            <PrimaryLabel value="Candidate Options:" />
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
