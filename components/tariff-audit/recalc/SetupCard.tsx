import { CheckIcon, ClockIcon, CloudArrowUpIcon, PlayIcon, TableCellsIcon } from "@heroicons/react/20/solid";

// "Get Set Up in 30 Seconds" in one window, like the alerts page's quick start: a spreadsheet of
// entries drops in, the lines are added, and the audit is one click away (the Start button presses
// itself). Plays on a loop in pure CSS; for people who turn motion off it shows the finished state.

const LOOP = "7s";

export const SetupCard = () => (
  <figure
    className="hts-tracker-inverse w-full overflow-hidden rounded-[28px] bg-base-100 text-base-content shadow-2xl shadow-black/30 ring-1 ring-base-300"
    aria-label="Upload your entries, and your audit is ready to start"
  >
    <style>{`
      .su-a, .su-b { opacity: 0; }
      @media (prefers-reduced-motion: no-preference) {
        .su-a { animation: su-a ${LOOP} ease-in-out infinite; }
        .su-b { animation: su-b ${LOOP} ease-in-out infinite; }
        .su-c { animation: su-c ${LOOP} ease-in-out infinite; }
        .su-file { animation: su-file ${LOOP} cubic-bezier(.2,.9,.3,1) infinite; }
        .su-bar { animation: su-bar ${LOOP} ease-out infinite; }
        .su-pop { animation: su-pop ${LOOP} cubic-bezier(.2,1.6,.4,1) infinite; }
        .su-press { animation: su-press ${LOOP} ease-in-out infinite; }
      }
      @media (prefers-reduced-motion: reduce) { .su-c { opacity: 1; } }
      /* Three moments: drop the file, it's added, start the audit */
      @keyframes su-a { 0%, 30% { opacity: 1; } 34%, 96% { opacity: 0; } 100% { opacity: 1; } }
      @keyframes su-b { 0%, 30% { opacity: 0; } 34%, 54% { opacity: 1; } 58%, 100% { opacity: 0; } }
      @keyframes su-c { 0%, 54% { opacity: 0; } 58%, 94% { opacity: 1; } 98%, 100% { opacity: 0; } }
      @keyframes su-file {
        0% { opacity: 0; transform: translate(-140px, -70px) rotate(-10deg); }
        6% { opacity: 1; }
        20%, 100% { opacity: 1; transform: translate(0, 0) rotate(0); }
      }
      @keyframes su-bar { 0%, 34% { width: 4%; } 52%, 100% { width: 100%; } }
      @keyframes su-pop { 0%, 57% { transform: scale(0); } 62% { transform: scale(1.12); } 65%, 100% { transform: scale(1); } }
      @keyframes su-press { 0%, 72% { transform: scale(1); box-shadow: 0 0 0 0 transparent; } 75% { transform: scale(.94); } 79%, 100% { transform: scale(1); box-shadow: 0 0 0 8px color-mix(in oklab, var(--color-primary) 25%, transparent); } }
    `}</style>

    <div className="flex items-center justify-between gap-3 border-b border-base-300 px-6 py-4">
      <p className="font-semibold [font-family:var(--font-tracker-display)]">Add Your Products</p>
      <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
        <ClockIcon className="h-3.5 w-3.5" aria-hidden /> About 30 seconds
      </span>
    </div>

    <div className="relative h-72 p-6">
      {/* 1. Drop your spreadsheet */}
      <div className="su-a absolute inset-6 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-center">
        <span className="su-file flex items-center gap-2.5 rounded-xl bg-base-100 px-4 py-3 shadow-xl shadow-base-content/10 ring-1 ring-base-300">
          <TableCellsIcon className="h-6 w-6 text-success" aria-hidden />
          <span className="text-sm font-semibold">my-products.xlsx</span>
        </span>
        <p className="flex items-center gap-2 text-base font-semibold text-base-content/70">
          <CloudArrowUpIcon className="h-5 w-5 text-primary" aria-hidden /> Drop your product spreadsheet
        </p>
      </div>

      {/* 2. Added, in seconds */}
      <div className="su-b absolute inset-6 flex flex-col items-center justify-center gap-4">
        <span className="flex items-center gap-2.5 rounded-xl bg-base-100 px-4 py-3 shadow-xl shadow-base-content/10 ring-1 ring-base-300">
          <TableCellsIcon className="h-6 w-6 text-success" aria-hidden />
          <span className="text-sm font-semibold">my-products.xlsx</span>
        </span>
        <div className="h-3 w-full max-w-sm overflow-hidden rounded-full bg-base-300">
          <div className="su-bar h-full rounded-full bg-primary" />
        </div>
        <p className="text-base font-semibold text-base-content/70">Adding your products</p>
      </div>

      {/* 3. Ready: one click to start */}
      <div className="su-c absolute inset-6 flex flex-col items-center justify-center gap-5 text-center">
        <span className="su-pop flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-content shadow-lg shadow-success/30">
          <CheckIcon className="h-8 w-8" aria-hidden />
        </span>
        <p className="text-2xl font-semibold [font-family:var(--font-tracker-display)]">Your entries are in</p>
        <span className="su-press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-content">
          <PlayIcon className="h-4 w-4" aria-hidden /> Start Entry Audits
        </span>
      </div>
    </div>
  </figure>
);
