"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { PlusIcon } from "@heroicons/react/16/solid";

interface TextSelectionPopoverProps {
  children: ReactNode;
  onAddToNotes: (text: string) => void;
  className?: string;
}

interface PopoverState {
  text: string;
  top: number;
  left: number;
}

export const TextSelectionPopover = ({
  children,
  onAddToNotes,
  className,
}: TextSelectionPopoverProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const updatePopover = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) {
      setPopover(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setPopover(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setPopover(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setPopover({
      text,
      top: Math.max(0, rect.top - containerRect.top - 36),
      left: Math.min(
        containerRect.width - 60,
        Math.max(60, rect.left - containerRect.left + rect.width / 2)
      ),
    });
  }, []);

  useEffect(() => {
    const onSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPopover(null);
      }
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  const handleAdd = useCallback(() => {
    if (!popover) return;
    onAddToNotes(popover.text);
    window.getSelection()?.removeAllRanges();
    setPopover(null);
  }, [popover, onAddToNotes]);

  return (
    <div
      ref={containerRef}
      className={className ?? "relative"}
      onMouseUp={updatePopover}
    >
      {children}
      {popover && (
        <button
          type="button"
          className="absolute z-50 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-content text-xs font-semibold shadow-lg -translate-x-1/2 hover:brightness-90 active:scale-95 transition-all animate-in fade-in duration-150"
          style={{ top: popover.top, left: popover.left }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAdd}
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add to Notes
        </button>
      )}
    </div>
  );
};
