// What every Tariff Calculator result covers, as one row of short facts
const FACTS = [
  { value: "~200", label: "Origins" },
  { value: "Every", label: "HTS code" },
  { value: "Line by line", label: "With sources" },
  { value: "Current", label: "Latest revision" },
];

export const CoverageGrid = () => (
  <dl className="grid grid-cols-4 gap-1.5 rounded-2xl bg-tt-soft p-1.5 ring-1 ring-inset ring-base-300">
    {FACTS.map((fact) => (
      <div key={fact.label} className="flex flex-col-reverse items-center gap-0.5 rounded-xl px-1 py-2.5 text-center">
        <dt className="text-xs text-base-content/60">{fact.label}</dt>
        <dd className="whitespace-nowrap text-sm font-bold text-base-content">{fact.value}</dd>
      </div>
    ))}
  </dl>
);
