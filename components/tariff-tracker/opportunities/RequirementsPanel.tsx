import { DocumentTextIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { SavingKind } from "../insights/savings";
import { requirementsFor } from "./requirements";

// What it takes to secure a saving: the steps, in order. General steps for its kind until the
// exact requirements for each program and exemption are in (requirements.ts).
export const RequirementsPanel = ({ kind }: { kind: SavingKind }) => {
  const { specific, steps } = requirementsFor(kind);
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className={`${tt.numberChip()} flex h-6 shrink-0 items-center text-xs font-bold`}>{i + 1}</span>
            <div>
              <p className="m-0 text-sm font-semibold text-base-content">{step.title}</p>
              <p className="m-0 mt-0.5 text-sm text-base-content/70">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      {!specific && (
        <p className={`${ui.notice("warning")} text-sm`}>
          <DocumentTextIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
          The exact requirements for this one (its rules, documents and who signs them) are coming soon. Until then, confirm
          them with your customs broker.
        </p>
      )}
    </div>
  );
};
