"use client";

import { Menu } from "@headlessui/react";
import { ArrowDownTrayIcon, ChevronDownIcon, DocumentTextIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { ExportFormat } from "./export";

const EXPORTS: { format: ExportFormat; label: string; note: string; Icon: typeof TableCellsIcon }[] = [
  { format: "xlsx", label: "Excel (.xlsx)", note: "Formatted, with a notes sheet", Icon: TableCellsIcon },
  { format: "csv", label: "CSV (.csv)", note: "For any spreadsheet or system", Icon: DocumentTextIcon },
];

// Downloads the report as a spreadsheet, in the format picked from the menu
export const ExportMenu = ({ onExport }: { onExport: (format: ExportFormat) => void }) => (
  <Menu as="div" className="relative flex-1 sm:flex-none">
    <Menu.Button className={`${ui.button({ size: "sm" })} w-full`}>
      <ArrowDownTrayIcon className="h-4 w-4" aria-hidden />
      Export
      <ChevronDownIcon className="-mr-1 h-4 w-4 text-base-content/60" aria-hidden />
    </Menu.Button>
    <Menu.Items className={`${ui.popover} absolute right-0 z-30 mt-2 w-64 focus:outline-none`}>
      {EXPORTS.map(({ format, label, note, Icon }) => (
        <Menu.Item key={format}>
          {({ active }) => (
            <button
              type="button"
              className={`flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left text-base-content ${
                active ? "bg-primary/10" : ""
              }`}
              onClick={() => onExport(format)}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-base-content/60">{note}</span>
              </span>
            </button>
          )}
        </Menu.Item>
      ))}
    </Menu.Items>
  </Menu>
);
