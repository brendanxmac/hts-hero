import { ChevronRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// Links to each part of the page, in the hero's rail
export function OnThisPage({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Also on this page" className={`${ui.card} p-2`}>
      <span className={`${ui.label} block px-3 pt-1.5 pb-1`}>
        Also on this page
      </span>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="group flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-primary"
            >
              {s.label}
              <ChevronRightIcon className="h-4 w-4 text-base-content/60 group-hover:text-primary" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
