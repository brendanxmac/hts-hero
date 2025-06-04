import { useClassification } from "../contexts/ClassificationContext";
import { Color } from "../enums/style";
import { getProgressionDescriptions } from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import { PrimaryLabel } from "./PrimaryLabel";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryText } from "./TertiaryText";

export const ClassificationSummaryPage = () => {
  const { classification } = useClassification();
  const { articleDescription, levels } = classification;

  return (
    <div className="w-full flex flex-col pt-8">
      <PrimaryLabel value="Classification Summary" />
      <div>
        <div>
          <SecondaryLabel value="Article Description" />
          <TertiaryText value={articleDescription} />
        </div>
        <div>
          <SecondaryLabel value="Full Classification Description" />
          {getProgressionDescriptions(classification).map(
            (description, index) =>
              description && (
                <TertiaryText
                  key={index}
                  value={
                    index === 0
                      ? description
                      : `${"-".repeat(index)} ${description}`
                  }
                  color={Color.NEUTRAL_CONTENT}
                />
              )
          )}
        </div>
      </div>
      <div>
        <PrimaryLabel value="Classification Levels" />

        {levels.map((level, index) => (
          <div key={`level-${index}`} className="flex flex-col gap-2">
            <TertiaryText value={level.selection?.htsno} />
            <SecondaryLabel value={level.selection?.description} />
            <SecondaryLabel value={level.recommendationReason} />
            <div>
              <SecondaryLabel value="Candidates" />
              {level.candidates.map((candidate) => (
                <ElementSummary
                  key={candidate.uuid}
                  element={candidate}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
