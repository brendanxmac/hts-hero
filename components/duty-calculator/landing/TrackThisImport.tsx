"use client";

import { BellAlertIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";

// "Track this Import": an email when the duty on this import changes. Shown, not wired yet: the
// alert job comes with the Tracker's alert delivery.
export const TrackThisImport = () => (
  <section className="flex flex-col gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-5 md:flex-row md:items-center md:justify-between">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex shrink-0 text-primary">
        <BellAlertIcon className="h-5 w-5" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className={`${tt.display} m-0 text-base font-semibold text-base-content`}>Track this Import</h2>
        <p className={`${tt.subtitle} m-0`}>Get an email the moment a tariff on this import changes, with what it means for your total.</p>
      </div>
    </div>
    <form className="flex w-full gap-2 md:w-auto" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="dc-track-email" className="sr-only">
        Email
      </label>
      <input
        id="dc-track-email"
        type="email"
        placeholder="you@company.com"
        className="h-10 min-w-0 flex-1 rounded-full border border-base-300 bg-base-100 px-4 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-primary md:w-64"
      />
      <button type="submit" className={tt.button("secondary")} disabled>
        Coming soon
      </button>
    </form>
  </section>
);
