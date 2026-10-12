import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { EXCLUDED } from "./content";

// Charges an entry can owe that the estimate leaves out
export const NotIncluded = () => (
  <div className="min-w-0 self-start rounded-3xl border border-slate-200 skin:border-base-300 bg-white skin:bg-base-100 p-6 shadow-sm sm:p-8">
    <h3 className={`${mk.h3} flex items-center gap-2`}>
      <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" aria-hidden />
      Not included
    </h3>
    <p className={`${mk.small} mt-1`}>
      Charges an entry can owe that this estimate leaves out.
    </p>
    <ul className="mt-5 flex flex-col divide-y divide-slate-100 skin:divide-base-300">
      {EXCLUDED.map((item) => (
        <li key={item.title} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 skin:bg-tt-soft text-slate-500 skin:text-base-content/60"
            aria-hidden
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-900 skin:text-base-content">{item.title}</span>
            <span className="mt-0.5 block text-sm leading-relaxed text-slate-600 skin:text-base-content/70">{item.text}</span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);
