import { NoSymbolIcon } from "@heroicons/react/20/solid";
import type { CalculationResult } from "@/tariffs/engine-v2/types";
import * as ui from "@/components/ui/styles";

// An import ban on the entry, above the results: the goods can't be entered on this date, so the
// duty shown only matters for goods imported before the ban
export const ProhibitedNotice = ({ prohibitions }: { prohibitions: CalculationResult["prohibitions"] }) => {
  if (prohibitions.length === 0) return null;
  const askable = prohibitions.some((p) => p.openInputs.length > 0);
  return (
    <div role="alert" className={`${ui.notice("error")} flex gap-3`}>
      <NoSymbolIcon className="w-5 h-5 shrink-0 mt-0.5 text-error" aria-hidden />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-base font-semibold text-base-content">These goods are banned from import on this date</p>
        {prohibitions.map((p) => (
          <div key={p.id} className="flex flex-col gap-1">
            <p className="text-sm font-medium text-base-content">{p.name}</p>
            <p className={ui.bodySm}>{p.description}</p>
            {p.source?.citation && (
              <p className={ui.caption}>
                Source:{" "}
                {p.source.url ? (
                  <a href={p.source.url} target="_blank" rel="noopener" className={ui.link}>
                    {p.source.citation}
                  </a>
                ) : (
                  p.source.citation
                )}
              </p>
            )}
          </div>
        ))}
        {askable && (
          <p className={ui.bodySm}>
            The ban depends on how the goods are packaged. Answer the question under Possible Adjustments to check.
          </p>
        )}
      </div>
    </div>
  );
};
