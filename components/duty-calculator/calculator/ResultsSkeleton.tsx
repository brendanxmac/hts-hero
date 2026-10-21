import * as ui from "@/components/ui/styles";

// Stands in for the results while the HTS data loads, module by module (the header with its tabs,
// the key numbers, then the breakdown and the adjustments side by side), so nothing jumps when they
// arrive
export const ResultsSkeleton = () => (
  <div className="flex flex-col gap-module" aria-busy="true" aria-label="Loading HTS data">
    <div className={`${ui.card} flex flex-col gap-3 p-5`}>
      <div className={`${ui.skeleton} h-7 w-64`} />
      <div className={`${ui.skeleton} h-4 w-40`} />
      <div className="mt-2 flex gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`${ui.skeleton} h-5 w-16`} />
        ))}
      </div>
    </div>
    <div className={`${ui.card} grid grid-cols-2 gap-6 p-5 lg:grid-cols-4`}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className={`${ui.skeleton} h-3 w-20`} />
          <div className={`${ui.skeleton} h-8 w-28`} />
        </div>
      ))}
    </div>
    <div className="grid gap-module lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, c) => (
        <div key={c} className={`${ui.card} flex flex-col gap-3 p-5`}>
          <div className={`${ui.skeleton} h-6 w-40`} />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`${ui.skeleton} h-10 w-full`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);
