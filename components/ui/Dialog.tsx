"use client";

import { ComponentProps } from "react";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import { useEscapeToClose } from "@/hooks";

// Headless UI's Dialog, closed by Escape through the app's own listener (hooks/useEscapeToClose),
// so a browser extension that swallows Escape can't keep it open. Use this one, never Headless
// UI's directly. Inside a <Transition show>, without `open`, it's open while shown.
type DialogProps = Omit<ComponentProps<typeof HeadlessDialog>, "open" | "onClose"> & {
  open?: boolean;
  onClose: (value: boolean) => void;
};

const EscapableDialog = ({ open, onClose, ...props }: DialogProps) => {
  useEscapeToClose(open ?? true, () => onClose(false));
  return <HeadlessDialog {...props} {...(open === undefined ? {} : { open })} onClose={onClose} />;
};

export const Dialog = Object.assign(EscapableDialog, {
  Panel: HeadlessDialog.Panel,
  Title: HeadlessDialog.Title,
  Description: HeadlessDialog.Description,
});
