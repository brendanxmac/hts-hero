import * as tt from "@/components/ui/styles/tracker";

// Links to each part of the page, under the hero: a quiet line of text links, so it reads as a
// table of contents rather than a row of buttons
export function OnThisPage({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="mt-6 flex flex-wrap items-center gap-x-1 gap-y-1 border-t border-base-300 pt-4">
      <span className={`${tt.eyebrow()} pr-2`}>On this page</span>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-full px-3 py-1 text-sm font-medium text-base-content/60 transition-colors hover:bg-base-100 hover:text-primary"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
