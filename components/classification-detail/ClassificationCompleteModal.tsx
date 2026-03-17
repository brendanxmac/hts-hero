import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

interface ClassificationCompleteModalProps {
  show: boolean;
  latestHtsCode: string | null;
  articleDescription?: string;
  onClose: () => void;
  onProceed: () => void;
}

const NEXT_STEPS = [
  { icon: ScaleIcon, text: "Verify with CROSS rulings database" },
  { icon: CurrencyDollarIcon, text: "Find duty & tariff rates for any country" },
  { icon: ShieldCheckIcon, text: "Generate an audit-ready defense report" },
  { icon: ShareIcon, text: "Share with clients or teammates" },
] as const;

export function ClassificationCompleteModal({
  show,
  latestHtsCode,
  articleDescription,
  onClose,
  onProceed,
}: ClassificationCompleteModalProps) {
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-base-100 border border-base-300 shadow-2xl transition-all">
                <div className="relative overflow-hidden">
                  {/* Decorative gradient header */}
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-success/10 to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-success/5 blur-3xl pointer-events-none" />

                  <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="absolute -inset-2 rounded-full bg-success/20 blur-xl animate-pulse" />
                      <div className="relative w-14 h-14 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center">
                        <CheckCircleIcon className="w-8 h-8 text-success" />
                      </div>
                    </div>

                    <Dialog.Title className="text-xl font-bold text-base-content mb-1">
                      Classification Complete
                    </Dialog.Title>
                    <p className="text-sm text-base-content/50 mb-5">
                      Your item has been successfully classified
                    </p>

                    <div className="w-full rounded-xl bg-base-200/60 border border-base-300 p-4 mb-6">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-1.5">
                        HTS Code
                      </p>
                      <p className="text-2xl font-mono font-bold text-success tracking-wide mb-2">
                        {latestHtsCode || "\u2014"}
                      </p>
                      {articleDescription && (
                        <p className="text-xs text-base-content/50 leading-relaxed line-clamp-2">
                          {articleDescription}
                        </p>
                      )}
                    </div>

                    <div className="w-full space-y-2.5 mb-6">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 text-left">
                        What you can do next
                      </p>
                      {NEXT_STEPS.map(({ icon: Icon, text }) => (
                        <div
                          key={text}
                          className="flex items-center gap-3 rounded-lg bg-base-200/40 px-3.5 py-2.5"
                        >
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs font-medium text-base-content/70">
                            {text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn btn-primary w-full gap-2"
                      onClick={onProceed}
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Proceed to Overview
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
