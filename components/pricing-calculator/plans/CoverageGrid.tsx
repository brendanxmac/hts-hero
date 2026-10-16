// What every Tariff Calculator result covers, as a grid of short facts
const FACTS = [
  { value: "~200", label: "Countries of origin" },
  { value: "Every", label: "HTS code, to 10 digits" },
  { value: "Line by line", label: "With its legal source" },
  { value: "Current", label: "Through the latest HTS revision" },
];

export const CoverageGrid = () => (
  <dl className="grid grid-cols-2 gap-3">
    {FACTS.map((fact) => (
      <div key={fact.label} className="flex flex-col-reverse gap-1 rounded-xl bg-tt-soft px-4 py-3.5 ring-1 ring-inset ring-base-300">
        <dt className="text-sm text-base-content/60">{fact.label}</dt>
        <dd className="text-lg font-bold text-base-content">{fact.value}</dd>
      </div>
    ))}
  </dl>
);
