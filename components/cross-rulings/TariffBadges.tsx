import { parseRulingTariffs } from "../../libs/cross-rulings";

interface Props {
  tariffs: string | string[];
}

export const TariffBadges = ({ tariffs }: Props) => {
  const codes = parseRulingTariffs(tariffs);
  if (codes.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {codes.map((tariff) => (
        <span
          key={tariff}
          className="inline-flex items-center px-2 py-0.5 rounded-full bg-base-200 border border-base-300 text-xs font-mono text-base-content/70"
        >
          {tariff}
        </span>
      ))}
    </div>
  );
};
