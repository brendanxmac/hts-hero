import { useEffect, useState } from "react";
import { Color } from "../enums/style";
import { updateUserProfile, UserProfile } from "../libs/supabase/user";
import { PrimaryLabel } from "./PrimaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";
import { Importer } from "../interfaces/hts";
import {
  fetchClassifiersForUser,
  createClassifier,
} from "../libs/supabase/classifiers";
import {
  fetchImportersForUser,
  createImporter,
} from "../libs/supabase/importers";
import { BeakerIcon } from "@heroicons/react/16/solid";
import LogoUploader from "./LogoUploader";
import { TertiaryText } from "./TertiaryText";
import { Team } from "../libs/supabase/teams";
import { SecondaryLabel } from "./SecondaryLabel";

interface Props {
  user: UserProfile;
  team: Team;
}

export const UserSettings = ({ user, team }: Props) => {
  const [name, setName] = useState(user.name || "");
  const [originalName, setOriginalName] = useState(user.name || "");
  const [disclaimer, setDisclaimer] = useState(user.company_disclaimer || "");
  const [originalDisclaimer, setOriginalDisclaimer] = useState(
    user.company_disclaimer || ""
  );
  const [address, setAddress] = useState(user.company_address || "");
  const [originalAddress, setOriginalAddress] = useState(
    user.company_address || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [newImporter, setNewImporter] = useState("");
  const [importers, setImporters] = useState<Importer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCreatingClassifier, setIsCreatingClassifier] = useState(false);
  const [isCreatingImporter, setIsCreatingImporter] = useState(false);

  // Update local state when user prop changes
  useEffect(() => {
    setName(user.name || "");
    setOriginalName(user.name || "");
    setDisclaimer(user.company_disclaimer || "");
    setOriginalDisclaimer(user.company_disclaimer || "");
    setAddress(user.company_address || "");
    setOriginalAddress(user.company_address || "");
  }, [user]);

  // Fetch classifiers and importers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [importersData] = await Promise.all([fetchImportersForUser()]);
        setImporters(importersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleDisclaimerChange = (value: string) => {
    setDisclaimer(value);
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
  };

  const handleAddImporter = async () => {
    if (!newImporter.trim()) return;

    setIsCreatingImporter(true);
    try {
      const newImporterData = await createImporter(newImporter.trim());
      setImporters((prev) => [...prev, newImporterData]);
      setNewImporter("");
    } catch (error) {
      console.error("Failed to create importer:", error);
    } finally {
      setIsCreatingImporter(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      const updates: Partial<UserProfile> = {};

      if (name !== originalName) {
        updates.name = name;
      }

      if (disclaimer !== originalDisclaimer) {
        updates.company_disclaimer = disclaimer;
      }

      if (address !== originalAddress) {
        updates.company_address = address;
      }

      if (Object.keys(updates).length > 0) {
        await updateUserProfile(user.id, updates);
        setOriginalName(name);
        setOriginalDisclaimer(disclaimer);
        setOriginalAddress(address);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    name !== originalName ||
    disclaimer !== originalDisclaimer ||
    address !== originalAddress;

  return (
    <div className="flex flex-col gap-4">
      {/* Account Details Section */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 justify-between items-center h-8">
          <PrimaryLabel
            value={user.team_id ? "Personal Settings" : "Account Settings"}
            color={Color.WHITE}
          />
          {hasChanges && (
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-fit btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name Section */}
          <div className="flex flex-col gap-2">
            <TertiaryLabel value="Name" />
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              className="input input-bordered w-full"
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {/* Email Section */}
          <div className="flex flex-col gap-2">
            <TertiaryLabel value="Email" />
            <input
              type="text"
              value={user.email}
              disabled
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>

      {!team && (
        <div className="flex flex-col gap-8">
          <PrimaryLabel value="Company Details" color={Color.WHITE} />

          {/* Logo Section */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col">
              <SecondaryLabel value="Company Logo" />
              <TertiaryText value="This logo will be displayed on classification advisory reports" />
            </div>
            <div className="w-full flex items-center gap-4">
              <div className="w-full flex flex-col items-center gap-2">
                <LogoUploader user={user} />
              </div>
            </div>
          </div>

          {/* Classification Disclaimer Section */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col">
              <SecondaryLabel value="Classification Disclaimer" />
              <TertiaryText value="This disclaimer will be displayed on classification advisory reports" />
            </div>
            <div className="w-full flex flex-col gap-3">
              <textarea
                className="textarea textarea-bordered w-full resize-y"
                placeholder="Enter your classification disclaimer..."
                rows={4}
                value={disclaimer}
                onChange={(e) => handleDisclaimerChange(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Company Address Section */}
          <div className="w-full flex flex-col gap-2">
            <TertiaryLabel value="Company Address" />
            <input
              type="text"
              placeholder="Enter your company address"
              value={address}
              className="input input-bordered w-full"
              onChange={(e) => handleAddressChange(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
      )}

      {/* Importers Section */}
      {!team && (
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <PrimaryLabel value="Importers" color={Color.WHITE} />
              <div
                className="tooltip tooltip-bottom"
                data-tip="This feature is experimental"
              >
                <div className="rounded-sm bg-accent p-0.5 text-xs text-base-300">
                  <BeakerIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
            <TertiaryText value="The list of importers or clients that you provide advisory services to" />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter importers name"
              value={newImporter}
              className="max-w-md input input-sm input-bordered flex-1 py-4"
              onChange={(e) => setNewImporter(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddImporter}
              disabled={isCreatingImporter || !newImporter.trim()}
            >
              {isCreatingImporter ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Add"
              )}
            </button>
          </div>
          {isLoadingData ? (
            <div className="w-full flex flex-col items-center justify-center bg-base-200 px-4 py-6 rounded-md border-2 border-base-content/20">
              <span className="loading loading-spinner loading-md"></span>
              <TertiaryText value="Loading importers..." />
            </div>
          ) : importers.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center bg-base-200 px-4 py-6 rounded-md border-2 border-base-content/20">
              <TertiaryText value="No importers added yet" />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-2">
              {importers.map((importer) => (
                <div
                  key={importer.id}
                  className="flex items-center justify-between bg-base-200 px-4 py-3 rounded-md border border-base-content/20"
                >
                  <div className="flex flex-col">
                    <span className="text-base-content font-medium">
                      {importer.name}
                    </span>
                    <TertiaryText
                      value={`Created ${new Date(importer.created_at).toLocaleDateString()}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Created Section */}
        <div className="flex gap-2 items-center">
          <TertiaryText value="Account Created:" />
          <TertiaryText
            value={new Date(user.created_at).toLocaleDateString()}
          />
        </div>

        {/* Last Updated Section */}
        <div className="flex gap-2 items-center">
          <TertiaryText value="Last Updated:" />
          <TertiaryText
            value={new Date(user.updated_at).toLocaleDateString()}
          />
        </div>
      </div>

      {hasChanges && (
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      )}
    </div>
  );
};
