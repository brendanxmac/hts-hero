"use client";

import { fetchUser, UserProfile } from "../../libs/supabase/user";
import { useEffect, useState } from "react";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import SettingsPage from "../../components/SettingsPage";
import { useUser } from "../../contexts/UserContext";

export default function Home() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const getUserProfile = async () => {
    setIsLoading(true);
    const userProfile = await fetchUser(user.id);
    setUserProfile(userProfile);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getUserProfile();
    }
  }, [user]);

  return (
    <main className="h-full w-full bg-base-300 overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoadingIndicator />
        </div>
      ) : userProfile ? (
        <div className="h-full overflow-y-auto">
          <SettingsPage user={userProfile} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Profile Not Found</h2>
            <p className="text-base-content/70">
              Unable to load your profile information.
            </p>
            <button onClick={getUserProfile} className="btn btn-primary btn-sm">
              Try Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
