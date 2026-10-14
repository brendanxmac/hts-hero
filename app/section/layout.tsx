import { ReactNode } from "react";
import { HtsFrame } from "@/components/hts-page/HtsFrame";

export default function Layout({ children }: { children: ReactNode }) {
  return <HtsFrame>{children}</HtsFrame>;
}
