"use client";

import { fetchUser, UserProfile } from "../../libs/supabase/user";
import { useEffect, useState } from "react";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { User } from "@supabase/supabase-js";
import Profile from "../../components/Profile";

interface Props {
  user: User;
}

export default function ProfilePage({ user }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const getUserProfile = async () => {
    setIsLoading(true);
    const userProfile = await fetchUser(user.id);
    setUserProfile(userProfile);
    setIsLoading(false);
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  return (
    <main className="h-full w-full bg-base-300 overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoadingIndicator />
        </div>
      ) : userProfile ? (
        <div className="h-full overflow-y-auto">
          <Profile user={userProfile} onProfileUpdate={handleProfileUpdate} />
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
