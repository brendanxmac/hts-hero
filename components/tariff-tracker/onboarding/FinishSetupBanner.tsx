"use client";

import { ArrowRightIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useUser } from "@/contexts/UserContext";
import { useTrackerAccess } from "../access/accessContext";
import { realItems } from "../catalog";
import { useTracker } from "../TrackerContext";
import { openImportTakeover, useImportTakeover } from "./takeoverStore";
import { useToFinish } from "./toFinish";

// Over every Tracker page once some imports are tracked but a sheet left rows to fix (toFinish.ts):
// how many, and the way back to them in the same grid and fix panel. With none of their imports yet,
// the empty Home and Imports pages ask instead (SetupPanel), so there's no banner for that.
export const FinishSetupBanner = () => {
  const { user } = useUser();
  const { loading } = useTrackerAccess();
  const { items } = useTracker();
  const { open } = useImportTakeover();
  const waiting = useToFinish(user?.id);
  const count = waiting.length;
  if (open || loading || count === 0 || realItems(items).length === 0) return null;

  return (
    <div
      role="status"
      className="tt-enter mb-4 flex flex-col gap-3 rounded-2xl border border-warning/35 bg-warning/8 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning" aria-hidden>
        <ExclamationTriangleIcon className="h-5 w-5" />
      </span>
      <p className="m-0 flex-1 text-sm leading-snug">
        <span className="block font-bold text-base-content">
          {count.toLocaleString("en-US")} {count === 1 ? "Import" : "Imports"} to Finish
        </span>
        <span className="text-base-content/70">
          {count === 1 ? "A row" : "Rows"} from your sheet that didn&apos;t read yet. Fix {count === 1 ? "it" : "them"} and{" "}
          {count === 1 ? "it's" : "they're"} tracked with the rest.
        </span>
      </p>
      <button
        type="button"
        className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`}
        onClick={() => openImportTakeover("to-finish", "finish")}
      >
        Finish {count === 1 ? "it" : "them"}
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};
