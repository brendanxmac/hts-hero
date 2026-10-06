import { CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// The post's main facts up front, for skimmers and for AI answers that quote a page's summary
export function KeyTakeaways({ takeaways }: { takeaways: string[] }) {
  return (
    <section aria-labelledby="key-takeaways" className={ui.card}>
      <div className={ui.cardHeader}>
        <h2 id="key-takeaways" className={ui.cardTitle}>
          Key takeaways
        </h2>
      </div>
      <ul className="flex flex-col gap-3 px-5 py-4">
        {takeaways.map((takeaway) => (
          <li key={takeaway} className={`${ui.body} flex items-start gap-2.5`}>
            <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {takeaway}
          </li>
        ))}
      </ul>
    </section>
  );
}
