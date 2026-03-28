"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: JSX.Element;
  size?: "default" | "full" | "viewport";
}

// A simple modal component which can be shown/hidden with a boolean and a function
// Because of the setIsModalOpen function, you can't use it in a server component.
const Modal = ({ isOpen, setIsOpen, children, size = "default" }: ModalProps) => {
  const isViewport = size === "viewport";

  const sizeClasses = {
    default: "max-w-7xl",
    full: "max-w-[95vw] w-full",
    viewport: "",
  };

  const panelClassName = isViewport
    ? "relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-2xl border border-base-content/15 bg-base-100 shadow-2xl transform text-left align-middle transition-all"
    : `border border-base-content/15 relative ${sizeClasses[size]} max-h-full overflow-y-auto transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100`;

  // Block layout inside the scroll box: flex-col + min-height:auto on children prevents overflow
  // from creating a scrollable region. h-0 + flex-1 lets this flex item claim remaining panel height.
  const viewportScrollClassName =
    "relative h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain";

  const stickyClose = (
    <div className="sticky top-0 z-[60] flex h-0 justify-end pr-3 pt-3 sm:pr-4 sm:pt-4">
      <button
        type="button"
        className="btn btn-sm btn-neutral"
        onClick={() => setIsOpen(false)}
      >
        Close
      </button>
    </div>
  );

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

        <div
          className={`fixed inset-0 ${isViewport ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          <div
            role="presentation"
            className={
              isViewport
                ? "flex min-h-[100dvh] w-full flex-col p-3 sm:p-4"
                : "flex min-h-full items-center justify-center p-4"
            }
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
                className={panelClassName}
                onClick={(e) => e.stopPropagation()}
              >
                <Dialog.Description className="sr-only">
                  Modal dialog. Use the Close button, click the dimmed area around
                  this window, or press Escape to dismiss.
                </Dialog.Description>

                {isViewport ? (
                  <div className={viewportScrollClassName}>
                    {stickyClose}
                    <div className="w-full min-w-0">{children}</div>
                  </div>
                ) : (
                  <>
                    {stickyClose}
                    <div className="w-full">{children}</div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
