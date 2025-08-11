import {
  TariffCoverage,
  TariffCoverageI,
  TariffSection,
} from "./TariffCoverage";

interface Props {
  name: string;
  description: string;
  type: TariffSection;
  tariffs: TariffCoverageI[];
}

export const TariffCoverageSection = ({
  name,
  description,
  type,
  tariffs,
}: Props) => {
  return (
    <div className="bg-base-100 rounded-2xl border-2 border-neutral-content/50 p-8">
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full ${
            type === TariffSection.COVERED ? "bg-success" : "bg-warning"
          }`}
        ></div>
        <h2 className="text-2xl font-semibold text-base-content">{name}</h2>
      </div>
      <p className="text-base-content/70 mb-6">{description}</p>
      <div className="gap-3 lg:gap-1 grid grid-cols-1 lg:grid-cols-2 items-start">
        {tariffs.map((tariff) => (
          <TariffCoverage key={tariff.name} tariff={tariff} type={type} />
        ))}
      </div>
    </div>
  );
};
