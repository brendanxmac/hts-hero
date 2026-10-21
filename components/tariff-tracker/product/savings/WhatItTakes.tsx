import { ComponentType, SVGProps } from "react";
import {
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  MapPinIcon,
  ScaleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import * as tt from "@/components/ui/styles/tracker";
import { SavingKind } from "../../insights/savings";
import { requirementsFor } from "../../opportunities/requirements";

// What it takes to secure a saving, as a short path: each step with an icon for what it's about,
// joined by a line, the one to work on now picked out. General steps for its kind until the exact
// requirements for each program and exemption are in (requirements.ts).

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<SavingKind, Icon[]> = {
  program: [ScaleIcon, DocumentCheckIcon, ClipboardDocumentCheckIcon],
  exemption: [DocumentMagnifyingGlassIcon, CheckBadgeIcon, ChatBubbleLeftRightIcon],
  origin: [BuildingOffice2Icon, WrenchScrewdriverIcon, MapPinIcon],
};

export const WhatItTakes = ({ kind, current }: { kind: SavingKind; current?: number }) => {
  const { specific, steps } = requirementsFor(kind);
  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const Icon = ICONS[kind][i] ?? CheckBadgeIcon;
          const now = i === current;
          const done = current !== undefined && i < current;
          return (
            <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
              {/* The line down to the next step */}
              {i < steps.length - 1 && <span className="absolute left-5 top-11 bottom-1 w-px bg-base-300" aria-hidden />}
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  now ? "bg-primary text-primary-content" : done ? "bg-success/15 text-success" : "bg-tt-soft text-base-content/70"
                }`}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 pt-1.5">
                <p className="m-0 flex flex-wrap items-center gap-2 text-sm font-semibold text-base-content">
                  {step.title}
                  {now && <span className={tt.chip("primary")}>Now</span>}
                </p>
                <p className="m-0 mt-0.5 text-sm text-base-content/70">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {!specific && (
        <p className="m-0 text-xs text-base-content/60">
          General steps for now. The exact rules for this one (documents, who signs them) are coming soon: confirm them with your customs broker.
        </p>
      )}
    </div>
  );
};
