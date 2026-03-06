import { ReactNode, Suspense } from "react";
import { LeadMagnetHeader } from "../../components/LeadMagnetHeader";

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <div className="flex flex-col bg-base-100">
      <Suspense fallback={<div className="w-full h-16" />}>
        <LeadMagnetHeader />
      </Suspense>
      {children}
    </div>
  );
}
