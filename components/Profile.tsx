"use client";

import { UserProfile } from "../libs/supabase/user";
import { SecondaryLabel } from "./SecondaryLabel";
import { SecondaryText } from "./SecondaryText";
import { TertiaryText } from "./TertiaryText";
import LogoUploader from "./LogoUploader";
import { PrimaryLabel } from "./PrimaryLabel";
import { Color } from "../enums/style";
import { TertiaryLabel } from "./TertiaryLabel";

interface Props {
  user: UserProfile;
}

export default function Profile({ user }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 flex flex-col gap-2">
      <div className="w-full bg-base-100 rounded-lg border border-base-content/20 p-6 flex flex-col gap-6">
        <div className="flex flex-col">
          <PrimaryLabel value="User Profile" color={Color.WHITE} />
          <TertiaryText value="Manage your account information and preferences" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name Section */}
          <div className="flex flex-col">
            <TertiaryLabel value="Name" />
            <SecondaryText value={user.name} color={Color.WHITE} />
          </div>

          {/* Email Section */}
          <div className="flex flex-col">
            <TertiaryLabel value="Email" />
            <SecondaryText value={user.email} color={Color.WHITE} />
          </div>

          {/* Created Section */}
          <div className="flex flex-col">
            <TertiaryLabel value="Created" />
            <SecondaryText
              value={new Date(user.created_at).toLocaleDateString()}
              color={Color.WHITE}
            />
          </div>

          {/* Last Updated Section */}
          <div className="flex flex-col">
            <TertiaryLabel value="Last updated" />
            <SecondaryText
              value={new Date(user.updated_at).toLocaleDateString()}
              color={Color.WHITE}
            />
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
