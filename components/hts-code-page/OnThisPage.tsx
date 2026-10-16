import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";

// Links to each part of the page, as one row of pills across the page under the hero
export function OnThisPage({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="mt-6 flex flex-wrap items-center gap-2">
      <span className={`${tt.eyebrow()} pr-1`}>On this page</span>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-base-300 bg-base-100 px-3.5 text-sm font-medium text-base-content/80 transition-colors hover:border-primary/40 hover:text-primary"
        >
          {s.label}
          <ChevronDownIcon className="h-3.5 w-3.5 text-base-content/50" aria-hidden />
        </a>
      ))}
    </nav>
  );
}
