import * as tt from "@/components/ui/styles/tracker";

// Links to each part of the page, under the hero: a quiet line of text links in a card of its own,
// so it reads as a table of contents rather than a row of buttons, and nothing sits on the background
export function OnThisPage({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className={`${tt.panel} mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 px-5 py-3`}>
      <span className={`${tt.eyebrow()} pr-2`}>On this page</span>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-full px-3 py-1 text-sm font-medium text-base-content/60 transition-colors hover:bg-tt-soft hover:text-primary"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
