"use client";

import { Fragment, ReactNode } from "react";
import { Transition } from "@headlessui/react";
import { Dialog } from "@/components/ui/Dialog";
import { THEME } from "@/components/ui/theme";

// The explorer floating over a page: a big round panel on a dimmed backdrop, in the Tracker's
// look whatever the page under it. Escape or a click outside closes it.
export const ExplorerDialog = ({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  // Names the dialog for screen readers
  label: string;
  children: ReactNode;
}) => (
  <Transition appear show={open} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose} aria-label={label}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/60" aria-hidden />
      </Transition.Child>
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 translate-y-2 scale-[0.98]"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-[0.98]"
        >
          <Dialog.Panel
            className={`${THEME} hts-tracker flex h-[min(94dvh,64rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-base-300 shadow-2xl`}
          >
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);
