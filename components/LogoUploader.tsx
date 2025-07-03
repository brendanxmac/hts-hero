"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { fetchUser } from "../libs/supabase/user";
import { TertiaryText } from "./TertiaryText";
import { SecondaryLabel } from "./SecondaryLabel";

export default function LogoUploader({
  userId,
  onUploaded,
}: {
  userId: string;
  onUploaded?: (url: string, path: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogoUrl = async () => {
      const user = await fetchUser(userId);
      setPreviewUrl(user?.logo_url || null);
    };
    fetchLogoUrl();
  }, [userId]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 4 * 1024 * 1024) {
        setError("File too large (max 4MB)");
        return;
      }

      if (!["image/png", "image/jpeg"].includes(file.type)) {
        setError("Only PNG and JPEG allowed");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      setUploading(true);
      setError(null);

      const res = await fetch("/api/supabase/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setPreviewUrl(data.signedUrl);
        if (onUploaded) onUploaded(data.signedUrl, data.path);
      }

      setUploading(false);
    },
    [userId, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full flex flex-col items-start gap-4">
      {previewUrl && (
        <img src={previewUrl} alt="Logo" className="h-24 w-auto rounded-lg" />
      )}
      <div
        {...getRootProps()}
        className={`w-full border-dashed border-2 p-6 text-center rounded cursor-pointer transition flex flex-col items-center
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        `}
      >
        <input {...getInputProps()} />
        <SecondaryLabel
          value={
            uploading
              ? "Uploading..."
              : `Drag & drop or click to ${previewUrl ? "update" : "upload"} logo`
          }
        />
        <TertiaryText value="(Must be PNG/JPEG, Max Size 4MB)" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
