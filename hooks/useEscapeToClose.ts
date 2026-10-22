import { useEffect, useRef } from "react";

// Escape closes the topmost open popup, and only that one. Every open popup (every Dialog, via
// components/ui/Dialog) joins one stack, and one listener closes the last one opened.
//
// The listener is the app's, not Headless UI's: Headless UI skips an Escape something else marked
// handled (preventDefault), and browser extensions (password managers, keyboard tools) do that.
// So this one ignores preventDefault, is added before any dialog's own listener, and marks the key
// handled so a Headless UI dialog doesn't close a second time. A part of a popup that uses Escape
// itself (a cell being edited, an open dropdown) stops it from reaching here (stopPropagation).

type Entry = { close: () => void };

const stack: Entry[] = [];

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== "Escape") return;
  const top = stack[stack.length - 1];
  if (!top) return;
  e.preventDefault();
  top.close();
};

if (typeof window !== "undefined") window.addEventListener("keydown", onKeyDown);

export const useEscapeToClose = (open: boolean, onClose: () => void) => {
  // The latest onClose, so an inline callback doesn't move the popup in the stack each render
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const entry: Entry = { close: () => close.current() };
    stack.push(entry);
    return () => {
      stack.splice(stack.indexOf(entry), 1);
    };
  }, [open]);
};
