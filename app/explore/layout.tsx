import { ReactNode } from "react";
import { HtsFrame } from "@/components/hts-page/HtsFrame";

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return <HtsFrame>{children}</HtsFrame>;
}
