"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";

// Light or dark for the whole site: in the Tracker's sidebar, and in the site header on pages in
// the Tracker's look (skin:). One setting: <html data-theme>, remembered as "theme".
// className: the button's look, where it sits somewhere other than the Tracker's sidebar
export const ThemeSwitch = ({ className }: { className?: string } = {}) => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = document.documentElement.getAttribute("data-theme");
    setDark(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      // Not critical
    }
  };
  return (
    <button
      type="button"
      onClick={flip}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      title={`Switch to ${dark ? "light" : "dark"} mode`}
      className={
        className ??
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base-content/70 transition-colors hover:bg-tt-side-active hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      }
    >
      {dark ? <SunIcon className="h-4 w-4" aria-hidden /> : <MoonIcon className="h-4 w-4" aria-hidden />}
    </button>
  );
};
