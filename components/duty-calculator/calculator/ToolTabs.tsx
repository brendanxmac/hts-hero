"use client";

import * as ui from "@/components/ui/styles";
import { Tool, TOOLS } from "./tools";

// Switches between the Tariff Calculator and the Tariff Watcher
export const ToolTabs = ({ tool, onChange }: { tool: Tool; onChange: (tool: Tool) => void }) => (
  <div
    id="tariff-tools"
    role="tablist"
    aria-label="Tariff tools"
    className="grid grid-cols-2 gap-1 self-start w-full sm:w-auto rounded-lg border border-base-300 bg-base-200 p-1.5 scroll-mt-4"
  >
    {TOOLS.map(({ id, label, note, Icon }) => {
      const active = id === tool;
      return (
        <button
          key={id}
          type="button"
          role="tab"
          id={`tool-tab-${id}`}
          aria-selected={active}
          aria-controls={`tool-panel-${id}`}
          onClick={() => onChange(id)}
          className={`flex items-center gap-3 rounded-md px-3 sm:px-4 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${active
            ? "bg-base-100 shadow-sm ring-1 ring-base-300"
            : "hover:bg-base-300"
            }`}
        >
          <span
            className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active
              ? "bg-primary/10 text-primary"
              : "bg-base-300 text-base-content/60"
              }`}
            aria-hidden
          >
            <Icon className="w-5 h-5" />
          </span>
          <span className="flex flex-col min-w-0">
            <span className={`text-base font-semibold ${active ? "text-base-content" : "text-base-content/70"}`}>
              {label}
            </span>
            <span className={`${ui.caption} truncate`}>{note}</span>
          </span>
        </button>
      );
    })}
  </div>
);
