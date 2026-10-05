import Link from "next/link";
import type { HtsElement } from "@/interfaces/hts";
import { mono } from "@/components/ui/font";
import type { SectionChapter } from "./types";

// The path from the explorer to this line: section, chapter, then each parent
export function Breadcrumbs({
  element,
  parents,
  sectionChapter,
}: {
  element: HtsElement;
  parents: HtsElement[];
  sectionChapter: SectionChapter;
}) {
  const sep = <span aria-hidden="true" className="mx-1.5 text-base-content/60">/</span>;
  const linkClass = "hover:underline text-base-content/70 underline-offset-4 hover:text-primary";
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-y-1 text-sm text-base-content/60">
        <li>
          <Link href="/explore" className={linkClass}>HTS</Link>
        </li>
        {sectionChapter && (
          <>
            <li className="flex items-center">
              {sep}
              <Link href={`/section/${sectionChapter.sectionNumber}`} className={linkClass}>
                Section {sectionChapter.sectionNumber}
              </Link>
            </li>
            <li className="flex items-center">
              {sep}
              <Link href={`/chapter/${element.chapter}`} className={linkClass}>
                Chapter {element.chapter}
              </Link>
            </li>
          </>
        )}
        {parents.map((parent) => (
          <li key={parent.uuid} className="flex items-center">
            {sep}
            {parent.htsno ? (
              <Link href={`/hts/${parent.htsno}`} className={`${mono.className} ${linkClass}`}>
                {parent.htsno}
              </Link>
            ) : (
              <span className="max-w-36 truncate" title={parent.description}>
                {parent.description.split(" ").slice(0, 3).join(" ")}...
              </span>
            )}
          </li>
        ))}
        <li className="flex items-center">
          {sep}
          <span className={`${mono.className} font-semibold text-base-content`} aria-current="page">
            {element.htsno || "Current"}
          </span>
        </li>
      </ol>
    </nav>
  );
}
