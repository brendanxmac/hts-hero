"use client";

import {
  ClassificationRecord,
  ClassificationStatus,
} from "../../interfaces/hts";
import { StatusDropdown } from "./StatusDropdown";
import { DownloadReportButton } from "./DownloadReportButton";
import { DeleteButton } from "./DeleteButton";

export interface HeaderActionsProps {
  classificationRecord: ClassificationRecord;
  isComplete: boolean;
  canUpdateDetails: boolean;
  canDelete: boolean;
  updatingStatus: boolean;
  downloadingReport: boolean;
  isLoadingImporters: boolean;
  isDeleting: boolean;
  onStatusChange: (status: ClassificationStatus) => void;
  onDownloadReport: () => void;
  onDeleteClick: () => void;
}

export function HeaderActions({
  classificationRecord,
  isComplete,
  canUpdateDetails,
  canDelete,
  updatingStatus,
  downloadingReport,
  isLoadingImporters,
  isDeleting,
  onStatusChange,
  onDownloadReport,
  onDeleteClick,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {isComplete && (
        <>
          <StatusDropdown
            status={classificationRecord.status}
            isUpdating={updatingStatus}
            disabled={!canUpdateDetails}
            onChange={onStatusChange}
          />
          <DownloadReportButton
            isDownloading={downloadingReport}
            disabled={downloadingReport || isLoadingImporters}
            onClick={onDownloadReport}
          />
        </>
      )}
      <DeleteButton
        canDelete={canDelete}
        isDeleting={isDeleting}
        onClick={onDeleteClick}
      />
    </div>
  );
}
