import { ChangelogEntry } from "@/libs/supabase/tariff-changelog";
import * as ui from "@/components/ui/styles";
import { ChangelogCard } from "../changelog/ChangelogCard";

// The top of /duty-calculator. Server-rendered so crawlers see the copy; the tools follow.
export const Hero = ({
  latestUpdates,
}: {
  latestUpdates: ChangelogEntry[];
}) => (
  <div className="w-full">
    <header className={`${ui.container} grid gap-8 pt-10 pb-10 md:pt-14 md:pb-12 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-12 xl:gap-16`}>
      <div className="min-w-0">
        <h1 className="mt-5">
          <span className={`${ui.kicker} block`}>US Import Duty &amp; Tariff Calculator</span>
          <span className={`${ui.display} mt-3 block max-w-3xl leading-tight sm:leading-none`}>
            Know what you owe on every import.{" "}
            <span className="text-primary">And why.</span>
          </span>
        </h1>

        <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-base-content/70">
          We find every tariff, exemption, and fee in
          effect for your imports, itemized line by line with its legal
          source, and kept current with every HTS revision.
        </p>
      </div>

      {latestUpdates.length > 0 && (
        <div className="lg:pt-4">
          <ChangelogCard entries={latestUpdates} />
        </div>
      )}
    </header>
  </div>
);
