import apiClient from "../api";

export interface FileUploadDownloadResponse {
  signedUrl: string;
  error: string | null;
}

export const uploadUserLogo = async (
  formData: FormData
): Promise<FileUploadDownloadResponse> => {
  return apiClient.post("/supabase/upload-user-logo", formData);
};

export const uploadTeamLogo = async (
  formData: FormData
): Promise<FileUploadDownloadResponse> => {
  return apiClient.post("/supabase/upload-team-logo", formData);
};

export const fetchUserLogo = async (): Promise<FileUploadDownloadResponse> => {
  return apiClient.get("/supabase/fetch-user-logo");
};

export const fetchTeamLogo = async (
  teamId: string
): Promise<FileUploadDownloadResponse> => {
  return apiClient.get("/supabase/fetch-team-logo", { params: { teamId } });
};

export const fetchPDF = async (
  bucket: string,
  filePath: string
): Promise<FileUploadDownloadResponse> => {
  return apiClient.get(
    `/supabase/fetch-pdf?bucket=${bucket}&path=${encodeURIComponent(filePath)}`
  );
};
