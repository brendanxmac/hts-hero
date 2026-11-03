import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FlowTester } from "@/components/dev/FlowTester";

export const metadata: Metadata = {
  title: "Flow Tester",
  robots: { index: false, follow: false },
};

// The Flow Tester: run every sign-up path on your own account, in development only
export default function FlowsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <FlowTester />;
}
