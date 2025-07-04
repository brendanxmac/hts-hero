import apiClient from "../api";

export interface FileUploadDownloadResponse {
  signedUrl: string;
  error: string | null;
}

export const uploadLogo = async (
  formData: FormData
): Promise<FileUploadDownloadResponse> => {
  return apiClient.post("/supabase/upload-logo", formData);
};

export const fetchLogo = async (): Promise<FileUploadDownloadResponse> => {
  return apiClient.get("/supabase/fetch-logo");
};
