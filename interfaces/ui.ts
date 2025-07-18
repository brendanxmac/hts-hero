import { SupabaseBuckets } from "../constants/supabase";

export interface Loader {
  isLoading: boolean;
  text?: string;
}

export interface PDFProps {
  title: string;
  bucket: SupabaseBuckets;
  filePath: string;
}

export interface FeatureI {
  title: string; // The title of the feature
  description: JSX.Element | string; // The description of the feature (when clicked)
  mediaType?: "video" | "image"; // The type of media (video or image)
  mediaPath?: string; // The path to the media (for better SEO, try to use a local path)
  mediaFormat?: string; // The format of the media (if type is 'video')
  altText?: string; // The alt text of the image (if type is 'image')
  titleSvg?: JSX.Element;
}
