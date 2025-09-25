"use client";

import { UserProfile, updateUserProfile } from "../libs/supabase/user";
import {
  fetchClassifiersForUser,
  createClassifier,
} from "../libs/supabase/classifiers";
import {
  fetchImportersForUser,
  createImporter,
} from "../libs/supabase/importers";
import { Classifier, Importer } from "../interfaces/hts";
import { TertiaryText } from "./TertiaryText";
import LogoUploader from "./LogoUploader";
import { PrimaryLabel } from "./PrimaryLabel";
import { Color } from "../enums/style";
import { TertiaryLabel } from "./TertiaryLabel";
import { useState, useEffect } from "react";
import { BeakerIcon } from "@heroicons/react/16/solid";

interface Props {
  user: UserProfile;
}

export default function Profile({ user }: Props) {
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
  const [newClassifier, setNewClassifier] = useState("");
  const [newImporter, setNewImporter] = useState("");
  const [classifiers, setClassifiers] = useState<Classifier[]>([]);
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
        const [classifiersData, importersData] = await Promise.all([
          fetchClassifiersForUser(),
          fetchImportersForUser(),
        ]);
        setClassifiers(classifiersData);
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

  const handleAddClassifier = async () => {
    if (!newClassifier.trim()) return;

    setIsCreatingClassifier(true);
    try {
      const newClassifierData = await createClassifier(newClassifier.trim());
      setClassifiers((prev) => [...prev, newClassifierData]);
      setNewClassifier("");
    } catch (error) {
      console.error("Failed to create classifier:", error);
    } finally {
      setIsCreatingClassifier(false);
    }
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col gap-2">
      <div className="w-full bg-base-100 rounded-lg border border-base-content/20 p-6 flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white">
              Manage Your Profile
            </h1>
            <TertiaryText value="Update your account information and preferences" />
          </div>
          {hasChanges && (
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-fit btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {/* Account Details Section */}
        <div className="flex flex-col gap-4">
          <PrimaryLabel value="Account Details" color={Color.WHITE} />
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

        <div className="flex flex-col gap-4">
          <PrimaryLabel value="Company Details" color={Color.WHITE} />

          {/* Logo Section */}
          <div className="w-full flex flex-col gap-4">
            <TertiaryLabel value="Company Logo" />
            <div className="w-full flex items-center gap-4">
              <div className="w-full flex flex-col items-center gap-2">
                <LogoUploader userId={user.id} />
              </div>
            </div>
          </div>

          {/* Company Disclaimer Section */}
          <div className="w-full flex flex-col gap-4">
            <TertiaryLabel value="Company Disclaimer" />
            <div className="w-full flex flex-col gap-3">
              <textarea
                className="textarea textarea-bordered w-full resize-y"
                placeholder="Enter your company disclaimer..."
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

        {/* Classifiers Section */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PrimaryLabel value="Classifiers" color={Color.WHITE} />
            <div
              className="tooltip tooltip-bottom"
              data-tip="This feature is experimental"
            >
              <div className="rounded-sm bg-accent p-0.5 text-xs text-base-300">
                <BeakerIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter classifiers name"
              value={newClassifier}
              className="max-w-md input input-sm input-bordered flex-1 py-4"
              onChange={(e) => setNewClassifier(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddClassifier}
              disabled={isCreatingClassifier || !newClassifier.trim()}
            >
              {isCreatingClassifier ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Add"
              )}
            </button>
          </div>
          {isLoadingData ? (
            <div className="w-full flex flex-col items-center justify-center bg-base-200 px-4 py-6 rounded-md border-2 border-base-content/20">
              <span className="loading loading-spinner loading-md"></span>
              <TertiaryText value="Loading classifiers..." />
            </div>
          ) : classifiers.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center bg-base-200 px-4 py-6 rounded-md border-2 border-base-content/20">
              <TertiaryText value="No classifiers added yet" />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-2">
              {classifiers.map((classifier) => (
                <div
                  key={classifier.id}
                  className="flex items-center justify-between bg-base-200 px-4 py-3 rounded-md border border-base-content/20"
                >
                  <div className="flex flex-col">
                    <span className="text-base-content font-medium">
                      {classifier.name}
                    </span>
                    <TertiaryText
                      value={`Created ${new Date(classifier.created_at).toLocaleDateString()}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Importers Section */}
        <div className="w-full flex flex-col gap-4">
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
    </div>
  );
}
