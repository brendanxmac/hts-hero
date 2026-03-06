import { ReactNode } from "react";
import { LeadMagnetHeader } from "../../components/LeadMagnetHeader";

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <div className="flex flex-col bg-base-100">
      <LeadMagnetHeader />
      {children}
    </div>
  );
}
