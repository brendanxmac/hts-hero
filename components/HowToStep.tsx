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
      <div className="flex gap-2 items-center">
        {titleSvg}
        <PrimaryLabel value={title} color={Color.WHITE} />
      </div>
      <div>{description}</div>
      {mediaPath && (
        <div className="w-full aspect-video">
          <Media feature={step} />
        </div>
      )}
    </div>
  );
};
