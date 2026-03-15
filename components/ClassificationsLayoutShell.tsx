"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthenticatedHeader } from "./AuthenticatedHeader";
import UnauthenticatedHeader from "./UnauthenticatedHeader";

interface Props {
  children: ReactNode;
  isAuthenticated: boolean;
}

export const ClassificationsLayoutShell = ({
  children,
  isAuthenticated,
}: Props) => {
  const pathname = usePathname();
  const isDetailPage = /^\/classifications\/[^/]+$/.test(pathname);

  if (isDetailPage) {
    return <div className="h-screen overflow-hidden">{children}</div>;
  }

  return (
    <div className="h-screen overflow-y-auto">
      {isAuthenticated ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
    </div>
  );
};
