"use client";

import { Fragment, ReactNode, RefObject, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

// The one dropdown: a Headless UI Listbox in place of the native <select>, so the chevron sits
// inside the box and the menu matches the rest of the app (light and dark). Each option has a
// label, and can have a line under it. Looks:
// - "field": a form field, like ui.input (the default)
// - "pill": a round filter in a toolbar
// - "ghost": no box until hovered, for dense table cells and inline text
// Sizes match the inputs: md 40px (ui.input), sm 32px (ui.inputSm), xs 28px.
// `name` (and `required`) post it with a plain <form>, through a hidden input.
// The menu opens in a layer of its own over the page (a portal), placed by the button, so a card
// that clips its contents can't cut it off; it opens upward when there's no room below.

export interface SelectOption<T extends string | number> {
  value: T;
  label: ReactNode;
  // Under the label in the menu
  description?: ReactNode;
  disabled?: boolean;
}

type Size = "xs" | "sm" | "md";
type Variant = "field" | "pill" | "ghost";

const HEIGHT: Record<Size, string> = {
  xs: "h-7 gap-1 px-2.5 text-xs",
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-3 text-sm",
};

const LOOK: Record<Variant, string> = {
  field: "rounded-md border border-base-content/20 bg-base-100 shadow-sm hover:border-base-content/30",
  pill: "rounded-full border border-base-300 bg-base-100 hover:border-base-content/30",
  ghost: "rounded-md border border-transparent bg-transparent hover:bg-base-content/5",
};

// Where the menu goes on screen, beside its button
interface Place {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  minWidth: number;
  maxHeight: number;
  // The page's theme classes (palette, fonts), so the menu looks the same outside the page's tree
  theme: string;
}

const MENU_MAX = 288;
const GAP = 6;
const THEME_CLASS = /^(hts-|follow-theme|__className|__variable)/;

const usePlace = (open: boolean, button: RefObject<HTMLButtonElement>, align: "left" | "right") => {
  const [place, setPlace] = useState<Place | null>(null);
  useLayoutEffect(() => {
    if (!open || !button.current) return setPlace(null);
    const el = button.current;
    const themeHost = el.closest<HTMLElement>("[class*='hts-theme']");
    const theme = Array.from(themeHost?.classList ?? [])
      .filter((c) => THEME_CLASS.test(c))
      .join(" ");
    const measure = () => {
      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom - GAP * 2;
      const above = r.top - GAP * 2;
      const up = below < 180 && above > below;
      setPlace({
        ...(up ? { bottom: window.innerHeight - r.top + GAP } : { top: r.bottom + GAP }),
        ...(align === "right" ? { right: window.innerWidth - r.right } : { left: r.left }),
        minWidth: r.width,
        maxHeight: Math.max(120, Math.min(MENU_MAX, up ? above : below)),
        theme,
      });
    };
    measure();
    // Follow the button while the page (or anything around it) scrolls or resizes
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, button, align]);
  return place;
};

// The menu, in a layer over the page
const Menu = ({ open, button, align, className, children }: { open: boolean; button: RefObject<HTMLButtonElement>; align: "left" | "right"; className: string; children: ReactNode }) => {
  const place = usePlace(open, button, align);
  if (!place) return null;
  const { theme, ...at } = place;
  return createPortal(
    <div className={theme}>
      <Transition as={Fragment} show={open} leave="transition ease-in duration-75" leaveFrom="opacity-100" leaveTo="opacity-0">
        <Listbox.Options
          static
          // Runtime position (DESIGN_SYSTEM §10)
          style={{ position: "fixed", ...at }}
          className={`z-[1000] overflow-auto rounded-xl border border-base-300 bg-base-100 p-1 text-sm text-base-content shadow-lg focus:outline-none ${className}`}
        >
          {children}
        </Listbox.Options>
      </Transition>
    </div>,
    document.body
  );
};

export const Select = <T extends string | number>({
  value,
  onChange,
  options,
  label,
  placeholder = "Choose…",
  size = "md",
  variant = "field",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  align = "left",
  disabled = false,
  name,
  required = false,
  id,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  // Names the control for screen readers when there's no <label> pointing at `id`
  label?: string;
  // Shown when no option has the value
  placeholder?: ReactNode;
  size?: Size;
  variant?: Variant;
  // The wrapper (width: "w-full", "w-48"…)
  className?: string;
  buttonClassName?: string;
  // The menu (width: "w-72"…); at least as wide as the button
  menuClassName?: string;
  align?: "left" | "right";
  disabled?: boolean;
  name?: string;
  required?: boolean;
  id?: string;
}) => {
  const current = options.find((o) => o.value === value);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled} name={name}>
      {({ open }) => (
        <div className={`relative min-w-0 ${className}`}>
          <Listbox.Button
            ref={button}
            id={id}
            aria-label={label}
            className={`flex w-full min-w-0 items-center justify-between text-left text-base-content outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${HEIGHT[size]} ${LOOK[variant]} ${
              open && variant !== "ghost" ? "!border-primary ring-2 ring-primary/20" : ""
            } ${buttonClassName}`}
          >
            <span className={`min-w-0 truncate ${current ? "font-medium" : "text-base-content/60"}`}>{current ? current.label : placeholder}</span>
            <ChevronUpDownIcon className={`shrink-0 text-base-content/50 ${size === "xs" ? "h-3.5 w-3.5" : "h-4 w-4"}`} aria-hidden />
          </Listbox.Button>
          {/* With `required`, an empty choice blocks the form like a native select */}
          {required && name && value === "" && (
            <input tabIndex={-1} required value="" onChange={() => {}} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0" />
          )}
          <Menu open={open} button={button} align={align} className={menuClassName}>
              {options.map((o) => (
                <Listbox.Option
                  key={String(o.value)}
                  value={o.value}
                  disabled={o.disabled}
                  className={({ active, disabled: off }) =>
                    `flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 ${active ? "bg-primary/10" : ""} ${off ? "cursor-default opacity-40" : ""}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={`text-base-content ${selected ? "font-semibold" : ""}`}>{o.label}</span>
                        {o.description && <span className="text-xs text-base-content/60">{o.description}</span>}
                      </span>
                      <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 text-primary ${selected ? "" : "invisible"}`} aria-hidden />
                    </>
                  )}
                </Listbox.Option>
              ))}
          </Menu>
        </div>
      )}
    </Listbox>
  );
};
