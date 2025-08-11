import { ReactNode, Suspense } from "react";
import UnauthenticatedHeader from "../../../components/UnauthenticatedHeader";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-base-300 overflow-hidden">
      <Suspense
        fallback={
          <div className="w-full h-16 bg-base-100 border-b border-base-content/20" />
        }
      >
        <UnauthenticatedHeader />
      </Suspense>
      {children}
    </div>
  );
}
