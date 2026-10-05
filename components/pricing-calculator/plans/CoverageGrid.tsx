import * as ui from "@/components/ui/styles";

// What every Tariff Calculator result covers, as a grid of short facts
const FACTS = [
  { value: "~200", label: "Countries of origin" },
  { value: "Every", label: "HTS code, to 10 digits" },
  { value: "Line by line", label: "With its legal source" },
  { value: "Current", label: "Through the latest HTS revision" },
];

export const CoverageGrid = () => (
  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-base-300 bg-base-300">
    {FACTS.map((fact) => (
      <div key={fact.label} className="flex flex-col-reverse gap-1 bg-base-100 px-4 py-3">
        <dt className={ui.caption}>{fact.label}</dt>
        <dd className="text-base font-semibold text-base-content">{fact.value}</dd>
      </div>
    ))}
  </dl>
);
