import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { EXCLUDED } from "./content";

// Charges an entry can owe that the estimate leaves out
export const NotIncluded = () => (
  <div className={`${ui.card} p-5 sm:p-6`}>
    <h3 className={`${ui.cardTitle} flex items-center gap-2`}>
      <ExclamationTriangleIcon className="h-4 w-4 text-warning" aria-hidden />
      Not included
    </h3>
    <p className="mt-0.5 text-sm text-base-content/70">
      Charges an entry can owe that this estimate leaves out.
    </p>
    <ul className="mt-4 flex flex-col divide-y divide-base-300">
      {EXCLUDED.map((item) => (
        <li key={item.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/60"
            aria-hidden
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-base-content">{item.title}</span>
            <span className={`${ui.bodySm} block`}>{item.text}</span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);
