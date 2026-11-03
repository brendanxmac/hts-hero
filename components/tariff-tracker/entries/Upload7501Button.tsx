import { ArrowUpTrayIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// Coming soon: entries read straight from CBP Form 7501 entry summaries. Beside "Audit an Entry",
// as its secondary action.
export const Upload7501Button = () => (
  <button
    type="button"
    disabled
    title="Coming soon: drop in CBP Form 7501 entry summaries (PDF) or ES-003 ACE reports and every line is logged and audited for you"
    className={`${ui.button({ variant: "secondary" })} disabled:opacity-100`}
  >
    <ArrowUpTrayIcon className="h-4 w-4 text-base-content/50" aria-hidden />
    <span className="text-base-content/60">Upload 7501</span>
    <span className={tt.chip("warning")}>Soon</span>
  </button>
);
