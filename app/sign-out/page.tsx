"use client";

import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import config from "@/config";

export default function SignOut() {
  const { user, signOut, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If not logged in, redirect to signin immediately
    if (!isLoading && !user) {
      router.push("/signin");
      return;
    }

    // If logged in, sign them out
    if (!isLoading && user) {
      const handleSignOut = async () => {
        await signOut();
        router.push("/signin");
      };

      handleSignOut();
    }
  }, [user, isLoading, signOut, router]);

  return (
    <main
      className="p-8 md:p-24 min-h-screen flex items-center justify-center"
      data-theme={config.colors.theme}
    >
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-lg">Signing you out...</p>
      </div>
    </main>
  );
}
