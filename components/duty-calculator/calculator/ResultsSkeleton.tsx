import * as ui from "@/components/ui/styles";

// Stands in for the results while the HTS data loads
export const ResultsSkeleton = () => (
  <div
    className={`${ui.card} p-5 flex flex-col gap-3`}
    aria-busy="true"
    aria-label="Loading HTS data"
  >
    <div className={`${ui.skeleton} h-7 w-48`} />
    <div className={`${ui.skeleton} h-24 w-full`} />
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className={`${ui.skeleton} h-10 w-full`} />
    ))}
  </div>
);
