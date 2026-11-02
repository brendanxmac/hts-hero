import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import * as tt from "@/components/ui/styles/tracker";
import { TrackedProduct } from "../report";
import { AuditEntryButton } from "./check/AuditEntryButton";
import { Upload7501Button } from "./Upload7501Button";

// The audits before any entry is audited: what the audit does, and "Audit an Entry" big, in place
// of a strip of zeros. Once one is audited, the button moves to the header (or above the tab).
export const AuditStart = ({ fixedProduct }: { fixedProduct?: TrackedProduct }) => (
  <section className={`${tt.panel} flex flex-col items-center gap-5 px-6 py-12 text-center`} aria-labelledby="tt-audit-start">
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <DocumentMagnifyingGlassIcon className="h-7 w-7" aria-hidden />
    </span>
    <div className="flex max-w-lg flex-col gap-2">
      <h2 id="tt-audit-start" className={`${tt.display} m-0 text-xl font-semibold text-base-content`}>
        Check What You Paid on a Past Entry
      </h2>
      <p className="m-0 text-sm text-base-content/70">
        Enter an entry{fixedProduct ? " of this import" : ""} and we check it against the duty in force on its entry date, flagging possible over and underpayments
        for you and your broker.
      </p>
    </div>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <AuditEntryButton fixedProduct={fixedProduct} size="lg" />
      <Upload7501Button />
    </div>
  </section>
);
