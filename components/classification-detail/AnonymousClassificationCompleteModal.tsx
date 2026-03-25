import { Fragment, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  GiftIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { LockClosedIcon } from "@heroicons/react/16/solid";
import { NUM_FREE_CLASSIFICATIONS } from "../../constants/classification";

interface AnonymousClassificationCompleteModalProps {
  show: boolean;
  latestHtsCode: string | null;
  articleDescription?: string;
  classificationId?: string;
  onContinueWithoutSaving: () => void;
}

const LOSS_ITEMS = [
  "Your HTS Code Results & Reasoning",
  "Your Classification Defense Report",
  "HTS Code Validation from CROSS Rulings",
  "Unlimited Tariff & Duty Rate Lookups",
  `${NUM_FREE_CLASSIFICATIONS} FREE Classifications`,
] as const;

export function AnonymousClassificationCompleteModal({
  show,
  latestHtsCode,
  articleDescription,
  classificationId,
  onContinueWithoutSaving,
}: AnonymousClassificationCompleteModalProps) {
  const [codeCopied, setCodeCopied] = useState(false);

  const signupHref = `/signin?redirect=${encodeURIComponent(
    classificationId
      ? `/classifications/${classificationId}`
      : "/classifications"
  )}&sign-up=true`;

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onContinueWithoutSaving}
      >
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
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-base-100 border border-base-300 shadow-2xl transition-all">
                <div className="relative max-h-[94vh] overflow-y-auto overscroll-contain">
                  {/* Decorative bg */}
                  <div className="absolute inset-x-0 top-0 h-36 pointer-events-none" />

                  <div className="relative px-5 sm:px-7 pt-6 sm:pt-8 pb-5 sm:pb-7 flex flex-col items-center text-center">
                    {/* ── Top: Success + Result ── */}
                    <div className="relative mb-2">
                      <div className="absolute -inset-2 rounded-full bg-success/20 blur-xl animate-pulse" />
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
                      </div>
                    </div>

                    <Dialog.Title className="text-sm md:text-base font-bold text-base-content mb-3">
                      {/* Classification Complete! */}
                    </Dialog.Title>

                    {/* Inline HTS result (copyable) */}
                    <div className="flex flex-col items-center gap-0.5 mt-2 mb-6">
                      <span className="relative inline-block">
                        <span
                          onClick={
                            latestHtsCode
                              ? () => {
                                navigator.clipboard.writeText(latestHtsCode);
                                setCodeCopied(true);
                                setTimeout(() => setCodeCopied(false), 1500);
                              }
                              : undefined
                          }
                          className={`text-2xl sm:text-3xl font-mono font-bold tracking-wide ${latestHtsCode
                            ? "text-success cursor-pointer"
                            : "text-base-content/40"
                            }`}
                        >
                          {latestHtsCode || "\u2014"}
                        </span>
                        {latestHtsCode && (
                          <span
                            className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-success text-white text-[10px] font-semibold whitespace-nowrap pointer-events-none transition-all duration-200 ${codeCopied
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-1"
                              }`}
                          >
                            Copied!
                          </span>
                        )}
                      </span>
                      {articleDescription && (
                        <p className="text-xs text-base-content/45 leading-snug line-clamp-1 max-w-xs">
                          {articleDescription}
                        </p>
                      )}
                      {/* <p className="text-[11px] text-error mt-3 font-medium animate-pulse">
                        Note: Results will disappear unless you create a free account
                      </p> */}
                    </div>

                    {/* <div className="w-full border-t border-base-content/20 mb-3" /> */}

                    {/* ── Defense Report Banner (animated) ── */}
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-600 delay-500"
                      enterFrom="opacity-0 -translate-y-2"
                      enterTo="opacity-100 translate-y-0"
                    >
                      <div className="w-full rounded-xl bg-gradient-to-r from-primary/[0.08] via-primary/[0.05] to-secondary/[0.08] border border-primary/20 px-4 py-3 sm:py-3.5 mb-5 flex items-center gap-4">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                          <LockClosedIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm md:text-base lg:text-lg font-bold text-base-content leading-snug">
                            Create a <span className="underline">FREE</span> Account to Save Your Results & Verify your Code!
                          </p>
                          <p className="text-[11px] text-primary font-semibold mt-3">
                            100% FREE &ensp;· Takes 10 seconds&ensp;· &ensp;No credit card required
                          </p>
                          {/* <p className="text-xs md:text-sm text-base-content/70 leading-snug">
                            Save this classification, unlock your audit-ready defense report, and get 10 more free classifications.
                          </p> */}
                        </div>
                        {/* <LockOpenIcon className="w-4 h-4 text-primary/40 shrink-0" /> */}
                      </div>
                    </Transition.Child>


                    {/* ── Loss List ── */}
                    <div className="w-full rounded-xl bg-error/[0.05] border border-error/15 px-4 py-3.5 sm:px-5 sm:py-4 mb-5 text-center">
                      <div className="flex items-center gap-2 mb-3">
                        <ExclamationTriangleIcon className="w-4 h-4 text-error shrink-0" />
                        <p className="text-sm md:text-base lg:text-lg font-bold text-error">
                          Without an account, you will lose:
                        </p>
                      </div>
                      <ul className="space-y-2 pl-0.5">
                        {LOSS_ITEMS.map((item) => (
                          <li key={item} className="flex items-center gap-2.5">
                            <XCircleIcon className="w-4 h-4 text-error/70 shrink-0" />
                            <span className="text-sm md:text-base font-medium text-base-content/80 text-left">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {/* <p className="text-[11px] text-error mt-3 font-medium animate-pulse">
                        Results will disappear if you don't create a free account
                      </p> */}
                    </div>

                    {/* ── CTA Area (sticky feel) ── */}
                    <div className="w-full flex flex-col items-center">
                      <Link
                        href={signupHref}
                        className="btn btn-primary btn-lg w-full text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                      >
                        Save Results &amp; Verify Code
                        <span aria-hidden="true" className="ml-1">→</span>
                      </Link>

                      {/* <p className="text-[11px] text-base-content/40 mt-3">
                        100% FREE &ensp;· Takes 10 seconds&ensp;· &ensp;No credit card required
                      </p> */}

                      <button
                        onClick={onContinueWithoutSaving}
                        className="mt-5 text-xs text-base-content/80 hover:text-base-content transition-colors cursor-pointer"
                      >
                        Continue without saving
                      </button>
                    </div>
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
