import { Color } from "../enums/style";
import { Feature, Media } from "./FeaturesAccordion";
import { PrimaryLabel } from "./PrimaryLabel";

interface Props {
  feature: Feature;
}

export const HowToStep = ({ feature }: Props) => {
  const { title, description, titleSvg, mediaPath } = feature;

  return (
    <div className="h-full w-full flex flex-col gap-4">
      {mediaPath && <Media feature={feature} />}
      <div className="flex gap-2 items-center">
        {titleSvg}
        <PrimaryLabel value={title} color={Color.WHITE} />
      </div>
      <div>{description}</div>
    </div>
  );
};
