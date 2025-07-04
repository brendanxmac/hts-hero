"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { fetchUser } from "../libs/supabase/user";
import { TertiaryText } from "./TertiaryText";
import { SecondaryLabel } from "./SecondaryLabel";
import { fetchLogo, uploadLogo } from "../libs/supabase/storage";
import { LoadingIndicator } from "./LoadingIndicator";
import Image from "next/image";

export default function LogoUploader({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogoUrl = async () => {
      setLoading(true);
      const user = await fetchUser(userId);
      if (user && user.company_logo) {
        const { signedUrl, error } = await fetchLogo();
        if (error) {
          setError(error);
        } else {
          setPreviewUrl(signedUrl || null);
        }
      }
      setLoading(false);
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

      const { signedUrl, error } = await uploadLogo(formData);

      if (error) {
        setError(error || "Upload failed");
      } else {
        setPreviewUrl(signedUrl);
      }

      setUploading(false);
    },
    [userId]
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
      {(loading || previewUrl) && (
        <div className="h-24 w-full flex-col items-center justify-center gap-2">
          {loading && <LoadingIndicator text="Fetching logo" />}
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Logo"
              className="h-24 w-auto rounded-lg"
              width={400}
              height={400}
            />
          )}
        </div>
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
