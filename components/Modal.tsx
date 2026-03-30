"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  Fragment,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
  size?: "default" | "full" | "viewport";
}

/**
 * Modal sizes:
 * - default: width follows content (max 7xl), height capped; tall content scrolls inside.
 * - full: width follows content (max 95vw), height capped; tall content scrolls inside.
 * - viewport: nearly edge-to-edge inside padding; fills available height; content scrolls inside.
 *
 * Scrolling is always on an inner body with min-h-0 so flex layout cannot suppress overflow.
 */
const Modal = ({ isOpen, setIsOpen, children, size = "default" }: ModalProps) => {
  const shellClass =
    size === "viewport"
      ? "flex h-full min-h-0 w-full flex-col overflow-hidden p-3 sm:p-4"
      : size === "full"
        ? "flex h-full min-h-0 w-full items-center justify-center overflow-hidden p-3 sm:p-4"
        : "flex h-full min-h-0 w-full items-center justify-center overflow-y-auto overflow-x-hidden p-4";

  const panelClass =
    size === "viewport"
      ? "relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-2xl border border-base-content/15 bg-base-100 text-left align-middle shadow-2xl transition-all transform"
      : size === "full"
        ? "relative flex w-max max-w-[min(100%,95vw)] flex-col overflow-hidden rounded-xl border border-base-content/15 bg-base-100 text-left align-middle shadow-xl transition-all transform max-h-[min(95dvh,calc(100dvh-2rem))]"
        : "relative flex w-max max-w-[min(100%,80rem)] flex-col overflow-hidden rounded-xl border border-base-content/15 bg-base-100 text-left align-middle shadow-xl transition-all transform max-h-[min(90dvh,calc(100dvh-2rem))]";

  const scrollBodyClass = "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div
            role="presentation"
            className={shellClass}
            onClick={() => setIsOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={panelClass}
                onClick={(e) => e.stopPropagation()}
              >
                <Dialog.Description className="sr-only">
                  Modal dialog. Use the Close button, click the dimmed area around
                  this window, or press Escape to dismiss.
                </Dialog.Description>

                <button
                  type="button"
                  className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 z-[60] shrink-0 border border-base-content/10 bg-base-100/90 text-base-content shadow-sm backdrop-blur-sm hover:bg-base-200/90 sm:right-3 sm:top-3"
                  aria-label="Close"
                  onClick={() => setIsOpen(false)}
                >
                  <span aria-hidden className="text-lg leading-none font-light">
                    ×
                  </span>
                </button>

                <div className={scrollBodyClass}>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
