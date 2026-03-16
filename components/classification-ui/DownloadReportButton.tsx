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
      className="btn btn-primary btn-sm h-9"
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
