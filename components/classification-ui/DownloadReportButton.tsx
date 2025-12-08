"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/16/solid";

export interface DownloadReportButtonProps {
  isDownloading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function DownloadReportButton({
  isDownloading,
  disabled,
  onClick,
}: DownloadReportButtonProps) {
  return (
    <button
      className="group flex items-center gap-1.5 h-9 px-3 rounded-lg font-semibold text-xs transition-all duration-200 bg-primary text-primary-content hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
      onClick={onClick}
      title="Download classification report"
    >
      {isDownloading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">Report</span>
    </button>
  );
}

