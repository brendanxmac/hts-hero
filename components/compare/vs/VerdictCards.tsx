import { CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// "Choose HTS Hero if…" beside "Choose them if…": the honest split of who each tool suits
export function VerdictCards({
  theirName,
  chooseUs,
  chooseThem,
}: {
  theirName: string;
  chooseUs: string[];
  chooseThem: string[];
}) {
  const columns = [
    { title: "Choose HTS Hero if", items: chooseUs, ours: true },
    { title: `Choose ${theirName} if`, items: chooseThem, ours: false },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {columns.map((col) => (
        <div key={col.title} className={`${ui.card} ${col.ours ? "border-primary/40" : ""}`}>
          <div className={ui.cardHeader}>
            <h3 className={ui.cardTitle}>{col.title}</h3>
            {col.ours && <span className={ui.badge("primary")}>Our pick for most importers</span>}
          </div>
          <ul className="flex flex-col gap-3 px-5 py-4">
            {col.items.map((item) => (
              <li key={item} className={`${ui.body} flex items-start gap-2.5`}>
                <CheckIcon
                  className={`mt-1 h-4 w-4 shrink-0 ${col.ours ? "text-primary" : "text-base-content/60"}`}
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
