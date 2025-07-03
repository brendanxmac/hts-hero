"use client";

import { UserProfile } from "../libs/supabase/user";
import { SecondaryLabel } from "./SecondaryLabel";
import { SecondaryText } from "./SecondaryText";
import { TertiaryText } from "./TertiaryText";
import LogoUploader from "./LogoUploader";
import { PrimaryLabel } from "./PrimaryLabel";

interface Props {
  user: UserProfile;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
}

export default function Profile({ user, onProfileUpdate }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-2">
      {/* Header */}
      <div className="flex flex-col">
        <PrimaryLabel value="Profile" />
        <TertiaryText value="Manage your account information and preferences" />
      </div>

      {/* Profile Card */}
      <div className="w-full bg-base-100 rounded-lg border border-base-content/20 p-6 space-y-6">
        {/* Name Section */}
        <div className="flex flex-col">
          <SecondaryLabel value="Name" />
          <SecondaryText value={user.name} />
        </div>

        {/* Email Section */}
        <div className="flex flex-col">
          <SecondaryLabel value="Email" />
          <SecondaryText value={user.email} />
        </div>

        {/* Account Info */}
        <div className="flex flex-col gap-4">
          <SecondaryLabel value="Account Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <TertiaryText value="Member since" />
              <SecondaryText
                value={new Date(user.created_at).toLocaleDateString()}
              />
            </div>
            <div>
              <TertiaryText value="Last updated" />
              <SecondaryText
                value={new Date(user.updated_at).toLocaleDateString()}
              />
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="w-full flex flex-col gap-4">
          <SecondaryLabel value="Company Logo" />
          <div className="w-full flex items-center gap-4">
            <div className="w-full flex flex-col items-center gap-2">
              <LogoUploader userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
