import apiClient from "../api";

export interface FileUploadDownloadResponse {
  signedUrl: string;
  error: string | null;
}

export const uploadLogo = async (
  userId: string,
  file: File
): Promise<FileUploadDownloadResponse> => {
  return apiClient.post("/supabase/upload-logo", {
    file,
    userId,
  });
};

export const fetchLogo = async (): Promise<FileUploadDownloadResponse> => {
  return apiClient.get("/supabase/fetch-logo");
};
