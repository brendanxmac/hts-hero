"use client";

import { ReactNode } from "react";
import { Dialog } from "@headlessui/react";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { trackerSans } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { Answer, DetailsLink, Moved, OverviewTab, PayLess, Stats, Watch, Why } from "./parts";
import { Overview } from "./useOverview";

// "Summarize": the same high-level story as the Overview tab, in a drawer from the right that
// sits over the page instead of pushing it down, so the breakdown stays where it was. Stacked:
// the answer and its numbers, then why, could you pay less, how it's moved and what to watch,
// each with the way to its details (which closes the drawer). It carries its own theme classes,
// since the dialog portals out of the page.

const Part = ({ title, link, children }: { title: string; link?: ReactNode; children: ReactNode }) => (
  <section className="flex flex-col gap-3 border-t border-base-300 px-6 py-5">
    <div className="flex items-center justify-between gap-3">
      <h3 className={`m-0 ${tt.eyebrow("primary")}`}>{title}</h3>
      {link}
    </div>
    {children}
  </section>
);

export const ExplainDrawer = ({
  open,
  onClose,
  title,
  o,
  colors,
  canSee,
  onLocked,
  onOpenTab,
}: {
  open: boolean;
  onClose: () => void;
  // What it's about: "8708.80.13.00 from China"
  title: string;
  o: Overview | null;
  colors: Record<string, string>;
  canSee: boolean;
  onLocked: () => void;
  onOpenTab: (tab: OverviewTab) => void;
}) => {
  const go = (tab: OverviewTab) => {
    onClose();
    onOpenTab(tab);
  };
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden />
      <div className="fixed inset-y-0 right-0 flex w-full max-w-xl p-2 sm:p-3">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} flex w-full flex-col overflow-hidden shadow-2xl`}>
          <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
            <div className="min-w-0">
              <span className={`flex items-center gap-1.5 ${tt.eyebrow("primary")}`}>
                <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
                In plain English
              </span>
              <Dialog.Title className={`${tt.display} m-0 mt-1 truncate text-lg font-semibold text-base-content`}>{title}</Dialog.Title>
            </div>
            <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={onClose}>
              <XMarkIcon className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {o ? (
              <>
                <div className="flex flex-col gap-5 px-6 pb-5">
                  <Answer o={o} colors={colors} compact />
                  <Stats o={o} compact />
                </div>
                <Part title="Why you pay it" link={<DetailsLink label="Full breakdown" onClick={() => go("duty")} />}>
                  <Why o={o} colors={colors} canSee={canSee} onLocked={onLocked} />
                </Part>
                <Part title="Could you pay less?" link={<DetailsLink label="Compare countries" onClick={() => go("compare")} />}>
                  <PayLess o={o} compact />
                </Part>
                <Part title="How it's moved" link={<DetailsLink label="Full history" onClick={() => go("history")} />}>
                  <Moved o={o} compact />
                </Part>
                <Part title="What to watch">
                  <Watch o={o} />
                </Part>
              </>
            ) : (
              <div className={`${ui.skeleton} mx-6 h-96`} />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
