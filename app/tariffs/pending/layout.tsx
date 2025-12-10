import { ReactNode, Suspense } from "react";
import UnauthenticatedTariffsHeader from "../../../components/UnauthenticatedTariffsHeader";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-base-100 overflow-hidden">
      <Suspense
        fallback={
          <div className="w-full h-16 bg-base-100/95 backdrop-blur-md border-b border-base-content/10" />
        }
      >
        <UnauthenticatedTariffsHeader />
      </Suspense>
      {children}
    </div>
  );
}
