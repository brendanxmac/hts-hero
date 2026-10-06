import { ChevronRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// Links to each of the post's sections, in the rail
export function TableOfContents({ headings }: { headings: { id: string; text: string }[] }) {
  return (
    <nav aria-label="In this article" className={`${ui.card} p-2`}>
      <span className={`${ui.label} block px-3 pb-1 pt-1.5`}>In this article</span>
      <ul>
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="group flex items-start justify-between gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-primary"
            >
              {h.text}
              <ChevronRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
