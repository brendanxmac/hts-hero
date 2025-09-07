import { Color } from "../enums/style";
import { FeatureI } from "../interfaces/ui";
import { Media } from "./Media";
import { PrimaryLabel } from "./PrimaryLabel";

interface Props {
  step: FeatureI;
}

export const HowToStep = ({ step }: Props) => {
  const { title, description, titleSvg, mediaPath } = step;

  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="flex gap-2 items-center flex-shrink-0">
        {titleSvg}
        <PrimaryLabel value={title} color={Color.WHITE} />
      </div>
      <div className="flex-shrink-0">{description}</div>
      {mediaPath && (
        <div className="w-full flex-1 min-h-0">
          <Media feature={step} />
        </div>
      )}
    </div>
  );
};
