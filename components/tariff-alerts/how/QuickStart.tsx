import { CheckIcon, ClockIcon, CloudArrowUpIcon, TableCellsIcon } from "@heroicons/react/20/solid";

// How It Works in one picture: the only thing you do is add your imports. One window plays it on a
// loop, in seconds: a spreadsheet drops in, the imports are added, and tariff alerts switch on by
// themselves (they're on by default for every import added). Pure CSS; for people who turn motion
// off it shows the finished state. The steps under it say it again in words: one step, then done.

const LOOP = "7s";

const STEPS = [
  { n: "1", title: "Upload your products", text: "A spreadsheet, or paste your HTS codes", you: true },
  { n: "2", title: "That's it", text: "Alerts switch on automatically", you: false },
];

export const QuickStart = () => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
    <style>{`
      .qs-a, .qs-b { opacity: 0; }
      @media (prefers-reduced-motion: no-preference) {
        .qs-a { animation: qs-a ${LOOP} ease-in-out infinite; }
        .qs-b { animation: qs-b ${LOOP} ease-in-out infinite; }
        .qs-c { animation: qs-c ${LOOP} ease-in-out infinite; }
        .qs-file { animation: qs-file ${LOOP} cubic-bezier(.2,.9,.3,1) infinite; }
        .qs-bar { animation: qs-bar ${LOOP} ease-out infinite; }
        .qs-pop { animation: qs-pop ${LOOP} cubic-bezier(.2,1.6,.4,1) infinite; }
        .qs-track { animation: qs-track ${LOOP} ease-in-out infinite; }
        .qs-knob { animation: qs-knob ${LOOP} cubic-bezier(.3,1.4,.5,1) infinite; }
      }
      @media (prefers-reduced-motion: reduce) { .qs-c { opacity: 1; } }
      /* Three moments: drop the file, it's added, alerts are on */
      @keyframes qs-a { 0%, 30% { opacity: 1; } 34%, 96% { opacity: 0; } 100% { opacity: 1; } }
      @keyframes qs-b { 0%, 30% { opacity: 0; } 34%, 54% { opacity: 1; } 58%, 100% { opacity: 0; } }
      @keyframes qs-c { 0%, 54% { opacity: 0; } 58%, 94% { opacity: 1; } 98%, 100% { opacity: 0; } }
      @keyframes qs-file {
        0% { opacity: 0; transform: translate(-140px, -70px) rotate(-10deg); }
        6% { opacity: 1; }
        20%, 100% { opacity: 1; transform: translate(0, 0) rotate(0); }
      }
      @keyframes qs-bar { 0%, 34% { width: 4%; } 52%, 100% { width: 100%; } }
      @keyframes qs-pop { 0%, 57% { transform: scale(0); } 62% { transform: scale(1.12); } 65%, 100% { transform: scale(1); } }
      @keyframes qs-track { 0%, 64% { background-color: var(--color-base-300); } 68%, 100% { background-color: var(--color-success); } }
      @keyframes qs-knob { 0%, 64% { transform: translateX(0); } 68%, 100% { transform: translateX(2.5rem); } }
    `}</style>

    {/* The window */}
    <figure
      className="overflow-hidden rounded-[28px] bg-base-100 shadow-2xl shadow-base-content/10 ring-1 ring-base-300"
      aria-label="Upload your products, and tariff alerts switch on automatically"
    >
      <div className="relative h-72 p-6">
        {/* 1. Drop your spreadsheet */}
        <div className="qs-a absolute inset-6 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-center">
          <span className="qs-file flex items-center gap-2.5 rounded-xl bg-base-100 px-4 py-3 shadow-xl shadow-base-content/10 ring-1 ring-base-300">
            <TableCellsIcon className="h-6 w-6 text-success" aria-hidden />
            <span className="text-sm font-semibold text-base-content">my-products.xlsx</span>
          </span>
          <p className="flex items-center gap-2 text-base font-semibold text-base-content/70">
            <CloudArrowUpIcon className="h-5 w-5 text-primary" aria-hidden /> Drop your spreadsheet, or paste your HTS codes
          </p>
        </div>

        {/* 2. Added, in seconds */}
        <div className="qs-b absolute inset-6 flex flex-col items-center justify-center gap-4">
          <span className="flex items-center gap-2.5 rounded-xl bg-base-100 px-4 py-3 shadow-xl shadow-base-content/10 ring-1 ring-base-300">
            <TableCellsIcon className="h-6 w-6 text-success" aria-hidden />
            <span className="text-sm font-semibold text-base-content">my-products.xlsx</span>
          </span>
          <div className="h-3 w-full max-w-sm overflow-hidden rounded-full bg-base-300">
            <div className="qs-bar h-full rounded-full bg-primary" />
          </div>
          <p className="text-base font-semibold text-base-content/70">Adding your products…</p>
        </div>

        {/* 3. Done: alerts on */}
        <div className="qs-c absolute inset-6 flex flex-col items-center justify-center gap-5 text-center">
          <span className="qs-pop flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-content shadow-lg shadow-success/30">
            <CheckIcon className="h-8 w-8" aria-hidden />
          </span>
          <p className="text-2xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">You&apos;re all set</p>
          <div className="flex items-center gap-3 rounded-full bg-base-100 py-2 pl-5 pr-2 shadow-lg shadow-base-content/5 ring-1 ring-base-300">
            <span className="text-sm font-semibold text-base-content">Tariff alerts</span>
            {/* The switch, turning itself on */}
            <span className="qs-track flex h-8 w-[4.5rem] items-center rounded-full bg-success p-1" aria-hidden>
              <span className="qs-knob h-6 w-6 translate-x-10 rounded-full bg-white shadow-md motion-safe:translate-x-0" />
            </span>
          </div>
        </div>
      </div>
    </figure>
  </div>
);
