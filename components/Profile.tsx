"use client";

import { UserProfile, updateUserProfile } from "../libs/supabase/user";
import { SecondaryLabel } from "./SecondaryLabel";
import { SecondaryText } from "./SecondaryText";
import { TertiaryText } from "./TertiaryText";
import LogoUploader from "./LogoUploader";
import { PrimaryLabel } from "./PrimaryLabel";
import { Color } from "../enums/style";
import { TertiaryLabel } from "./TertiaryLabel";
import { useState, useEffect } from "react";

interface Props {
  user: UserProfile;
}

export default function Profile({ user }: Props) {
  const [disclaimer, setDisclaimer] = useState(user.company_disclaimer || "");
  const [originalDisclaimer, setOriginalDisclaimer] = useState(
    user.company_disclaimer || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when user prop changes
  useEffect(() => {
    setDisclaimer(user.company_disclaimer || "");
    setOriginalDisclaimer(user.company_disclaimer || "");
  }, [user.company_disclaimer]);

  const handleDisclaimerChange = (value: string) => {
    setDisclaimer(value);
  };

  const handleSaveDisclaimer = async () => {
    setIsSaving(true);

    try {
      await updateUserProfile(user.id, { company_disclaimer: disclaimer });
      setOriginalDisclaimer(disclaimer);
    } catch (error) {
      console.error("Failed to update disclaimer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = disclaimer !== originalDisclaimer;

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

        {/* Company Disclaimer Section */}
        <div className="w-full flex flex-col gap-4">
          <SecondaryLabel value="Company Disclaimer" />
          <div className="w-full flex flex-col gap-3">
            <textarea
              className="w-full resize-none p-3 bg-base-200 border border-base-content/20 rounded-lg text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your company disclaimer..."
              rows={4}
              value={disclaimer}
              onChange={(e) => handleDisclaimerChange(e.target.value)}
              disabled={isSaving}
            />
            <div className="flex items-center gap-3 w-full justify-end">
              {hasChanges && (
                <button
                  onClick={handleSaveDisclaimer}
                  disabled={isSaving}
                  className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
