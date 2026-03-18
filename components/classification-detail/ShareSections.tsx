"use client";

import { useState } from "react";
import { ClassificationRecord } from "../../interfaces/hts";
import {
  GlobeAltIcon,
  LinkIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { ClipboardIcon } from "@heroicons/react/16/solid";
import apiClient from "../../libs/api";
import config from "@/config";

export function PublicShareSection({
  classificationRecord,
}: {
  classificationRecord: ClassificationRecord;
}) {
  const [isShared, setIsShared] = useState(
    classificationRecord.is_shared ?? false
  );
  const [shareToken, setShareToken] = useState(
    classificationRecord.share_token ?? null
  );
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : `https://${config.domainName}`}/c/${shareToken}`
    : null;

  const handleToggleShare = async () => {
    setIsToggling(true);
    try {
      const response: { share_token: string | null; is_shared: boolean } =
        await apiClient.post("/classification/share", {
          id: classificationRecord.id,
          enable: !isShared,
        });
      setIsShared(response.is_shared);
      setShareToken(response.share_token);
    } catch (error) {
      console.error("Error toggling share:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <GlobeAltIcon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content">
                {isShared ? "Public Read-Only Link" : "Create Public Read-Only Link"}
              </p>
              <p className="text-xs text-base-content/50 mt-0.5">
                Anyone with the link can view this classification
              </p>
            </div>
            <label className="flex items-center cursor-pointer gap-2 shrink-0 ml-3">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={isShared}
                onChange={handleToggleShare}
                disabled={isToggling}
              />
              {isToggling && (
                <span className="loading loading-spinner loading-xs" />
              )}
            </label>
          </div>

          {isShared && shareUrl && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 border border-base-300 text-xs text-base-content/60 truncate">
                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{shareUrl}</span>
              </div>
              <button
                className="btn btn-sm btn-primary gap-1.5 shrink-0"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeamShareSection({
  classificationRecord,
}: {
  classificationRecord: ClassificationRecord;
}) {
  const [copied, setCopied] = useState(false);

  const teamUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/classifications/${classificationRecord.id}`
      : `https://${config.domainName}/classifications/${classificationRecord.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(teamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0 mt-0.5">
        <UsersIcon className="w-4 h-4 text-info" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-base-content">
          Share with Teammates
        </p>
        <p className="text-xs text-base-content/50 mt-0.5">
          Team members can view and collaborate on this classification
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 border border-base-300 text-xs text-base-content/60 truncate">
            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{teamUrl}</span>
          </div>
          <button
            className="btn btn-sm btn-outline btn-info gap-1.5 shrink-0"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <ClipboardIcon className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
