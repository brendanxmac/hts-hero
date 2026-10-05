"use client";

import { useState } from "react";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { covers } from "./noteText";

const COLLAPSED = 60;

// A note's list of provisions as a grid, with the ones covering the entered code highlighted
export const NoteCodeList = ({ codes, htsCode }: { codes: string[]; htsCode: string }) => {
  const [all, setAll] = useState(false);
  const matches = codes.filter((c) => covers(c, htsCode));
  // Collapsed, the entered code's matches come first so they're always visible
  const shown = all
    ? codes
    : [...matches, ...codes.filter((c) => !covers(c, htsCode))].slice(
        0,
        COLLAPSED,
      );
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-base-content/70">
        {codes.length} {codes.length === 1 ? "provision" : "provisions"}
        {" · "}
        {matches.length ? (
          <span className="font-semibold text-success">
            {htsCode} is on this list ({matches.join(", ")})
          </span>
        ) : (
          <span>{htsCode} isn&apos;t on this list</span>
        )}
      </p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-1">
        {shown.map((code, i) => (
          <li
            key={`${code}-${i}`}
            className={`${mono.className} rounded px-1.5 py-0.5 text-xs ${
              covers(code, htsCode)
                ? "bg-success/10 text-success font-semibold ring-1 ring-success"
                : "bg-base-100 text-base-content/70 ring-1 ring-base-300"
            }`}
          >
            {code}
          </li>
        ))}
      </ul>
      {codes.length > COLLAPSED && (
        <button
          type="button"
          className={`${ui.link} self-start text-sm`}
          onClick={() => setAll((x) => !x)}
        >
          {all ? "Show fewer" : `Show all ${codes.length}`}
        </button>
      )}
    </div>
  );
};
