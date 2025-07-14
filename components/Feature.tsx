import { FeatureI } from "../interfaces/ui";
import { Media } from "./Media";

interface Props {
  feature: FeatureI;
}

export const Feature = ({ feature }: Props) => {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-10 items-center justify-center mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 items-center justify-center">
        <h2 className="text-white text-3xl md:text-5xl font-bold text-center">
          {feature.title}
        </h2>
        <p className="text-sm md:text-xl text-white font-light text-center max-w-4xl">
          {feature.description}
        </p>
      </div>

      <Media feature={feature} />
    </div>
  );
};
