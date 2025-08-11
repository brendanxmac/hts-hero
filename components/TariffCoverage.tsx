export interface TariffCoverageI {
  name: string;
  details?: string;
}

export enum TariffSection {
  COVERED = "covered",
  COMING_SOON = "coming-soon",
}

interface Props {
  tariff: TariffCoverageI;
  type: TariffSection;
}

export const TariffCoverage = ({ tariff, type }: Props) => {
  const { name, details } = tariff;
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
          type === TariffSection.COVERED ? "bg-success" : "bg-warning"
        }`}
      ></div>
      <div>
        <h3 className="font-medium text-base-content">{name}</h3>
        {details && <p className="text-sm text-base-content/60">{details}</p>}
      </div>
    </div>
  );
};
