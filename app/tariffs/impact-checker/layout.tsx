import { ReactNode } from "react";
import UnauthenticatedHeader from "../../../components/UnauthenticatedHeader";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col max-h-svh bg-base-300 overflow-hidden">
      <UnauthenticatedHeader />
      {children}
    </div>
  );
}
