import { ClassifyPage } from "../enums/classify";
import { ClassificationSummary } from "./ClassificationSummary";
import { useClassifications } from "../contexts/ClassificationsContext";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState, useMemo } from "react";
import { Loader } from "../interfaces/ui";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import {
  DocumentTextIcon,
  PlusIcon,
  TagIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import { BoltIcon } from "@heroicons/react/16/solid";
import Fuse, { IFuseOptions } from "fuse.js";
import { LoadingIndicator } from "./LoadingIndicator";
import { PricingPlan } from "../types";
import { getActiveClassifyPurchase } from "../libs/supabase/purchase";
import apiClient from "../libs/api";
import { classifyPro } from "../config";
import {
  fetchUser,
  fetchUsersByTeam,
  UserProfile,
} from "../libs/supabase/user";
import {
  fetchImportersForTeam,
  fetchImportersForUser,
} from "../libs/supabase/importers";
import { ClassificationStatus, Importer } from "../interfaces/hts";
import { EmptyResults, EmptyResultsConfig } from "./EmptyResults";
import { deleteClassification } from "../libs/classification";
import toast from "react-hot-toast";

interface Props {
  page: ClassifyPage;
  setPage: (page: ClassifyPage) => void;
}

// Define the searchable fields for Fuse.js
interface SearchableClassification {
  id: string;
  articleDescription: string;
  htsCodes: string[];
}

export const Classifications = ({ page, setPage }: Props) => {
  const [loadingNewClassification, setLoadingNewClassification] =
    useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const [loader, setLoader] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "final" | "review" | "draft"
  >("all");
  const { htsElements, fetchElements } = useHts();
  const { getSections, sections } = useHtsSections();
  const {
    classifications,
    error: classificationsError,
    isLoading: classificationsLoading,
    refreshClassifications,
  } = useClassifications();
  const [activeClassifyPlan, setActiveClassifyPlan] =
    useState<PricingPlan | null>(null);
  const { user, error: userError } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teamUsers, setTeamUsers] = useState<UserProfile[]>([]);
  const [importers, setImporters] = useState<Importer[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedImporterId, setSelectedImporterId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const UNASSIGNED_IMPORTER_VALUE = "unassigned";

  const handleDeleteClassification = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteClassification(id);
      toast.success("Classification deleted");
      await refreshClassifications();
    } catch (error) {
      // Error is already handled by apiClient
    } finally {
      setDeletingId(null);
    }
  };

  // Helper function to get the appropriate empty state configuration
  const getEmptyStateConfig = (): EmptyResultsConfig | null => {
    const hasClassifications = classifications && classifications.length > 0;
    const noFiltered = filteredClassifications.length === 0;
    const hasActiveFilters =
      searchQuery !== "" ||
      (teamUsers.length > 0 && selectedUserId !== "") ||
      selectedImporterId !== "";
    const noActiveFilters =
      searchQuery === "" &&
      selectedImporterId === "" &&
      (teamUsers.length === 0 || selectedUserId === "");

    // No classifications at all
    if (!hasClassifications) {
      return {
        iconPath:
          "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
        title: "No Classifications Yet",
        descriptions: [
          "You haven't started or completed any classifications yet, but can start one now.",
        ],
        buttonText: "Start First Classification",
        onButtonClick: () => setPage(ClassifyPage.CLASSIFY),
      };
    }

    // No search results (active filters applied)
    if (hasClassifications && noFiltered && hasActiveFilters) {
      return {
        iconPath:
          "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
        title: "No Matching Classifications",
        descriptions: ["No classifications found for your search critieria."],
        buttonText: "Clear Filters",
        buttonClassName: "btn btn-primary w-fit btn-sm",
        onButtonClick: () => {
          setSearchQuery("");
          setSelectedUserId("");
          setSelectedImporterId("");
        },
      };
    }

    // Empty state for draft tab
    if (
      hasClassifications &&
      noFiltered &&
      activeTab === "draft" &&
      noActiveFilters
    ) {
      return {
        iconPath:
          "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
        title: "No Draft Classifications",
        descriptions: [
          "You don't have any draft classifications at the moment.",
          "Start a new classification to begin working on a draft.",
        ],
        buttonText: "Start New Classification",
        buttonIcon: loadingNewClassification ? (
          <span className={`loading loading-spinner loading-sm`}></span>
        ) : (
          <PlusIcon className="h-5 w-5" />
        ),
        onButtonClick: async () => {
          setLoadingNewClassification(true);
          await fetchElements("latest");
          setPage(ClassifyPage.CLASSIFY);
          setLoadingNewClassification(false);
        },
      };
    }

    // Empty state for finalized tab
    if (
      hasClassifications &&
      noFiltered &&
      activeTab === "final" &&
      noActiveFilters
    ) {
      return {
        iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        title: "No Finalized Classifications",
        descriptions: [
          "Classifications that you've fully completed can be marked as final.",
          'To do this, open the classification and click "Mark as Final" in the top right hand corner.',
        ],
        buttonText: "View Drafts",
        buttonClassName: "btn btn-primary btn-wide btn-sm",
        maxWidth: "max-w-md",
        onButtonClick: () => setActiveTab("draft"),
      };
    }

    // Empty state for review tab
    if (
      hasClassifications &&
      noFiltered &&
      activeTab === "review" &&
      noActiveFilters
    ) {
      return {
        iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        title: "No Classifications in Review",
        descriptions: [
          "Classifications can be marked as 'Needs Review'.",
          "To do this, open the classification and select this status",
        ],
        buttonText: "View Drafts",
        buttonClassName: "btn btn-primary btn-wide btn-sm",
        maxWidth: "max-w-md",
        onButtonClick: () => setActiveTab("draft"),
      };
    }

    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const [activeClassifyPurchase, userProfile] = await Promise.all([
        getActiveClassifyPurchase(user.id),
        fetchUser(user.id),
      ]);

      if (activeClassifyPurchase) {
        setActiveClassifyPlan(activeClassifyPurchase.product_name);
      }

      if (userProfile) {
        let teamUsers: UserProfile[] = [];
        let importers: Importer[] = [];

        if (userProfile.team_id) {
          [teamUsers, importers] = await Promise.all([
            fetchUsersByTeam(userProfile.team_id),
            userProfile.team_id
              ? await fetchImportersForTeam(userProfile.team_id)
              : await fetchImportersForUser(),
          ]);
        } else {
          importers = await fetchImportersForUser();
        }

        setTeamUsers(teamUsers);
        setImporters(importers);
        setUserProfile(userProfile);

        // Set current user as default selected classifier
        // setSelectedUserId(user.id);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Create searchable data for Fuse.js
  const searchableClassifications: SearchableClassification[] = useMemo(() => {
    if (!classifications) return [];

    return classifications.map((classificationRecord) => {
      const htsCodes: string[] = [];

      // Extract HTS codes and descriptions from all levels
      classificationRecord.classification.levels.forEach((level) => {
        if (level.selection) {
          htsCodes.push(level.selection.htsno);
        }
      });

      return {
        id: classificationRecord.id,
        articleDescription:
          classificationRecord.classification.articleDescription,
        htsCodes,
      };
    });
  }, [classifications]);

  // Configure Fuse.js options
  const fuseOptions: IFuseOptions<SearchableClassification> = {
    keys: ["articleDescription", "htsCodes"],
    threshold: 0.1, // Lower threshold = more strict matching
    findAllMatches: true,
    ignoreLocation: true,
  };

  // Create Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(searchableClassifications, fuseOptions);
  }, [searchableClassifications]);

  // Filter classifications based on search query using Fuse.js
  const searchFilteredClassifications = useMemo(() => {
    if (!searchQuery.trim() || !classifications) {
      return classifications || [];
    }

    const searchResults = fuse.search(searchQuery);
    const resultIds = searchResults.map((result) => result.item.id);

    return classifications.filter((classification) =>
      resultIds.includes(classification.id)
    );
  }, [searchQuery, classifications, fuse]);

  // Filter classifications based on active tab (finalized status)
  const tabFilteredClassifications = useMemo(() => {
    if (!searchFilteredClassifications) {
      return [];
    }

    switch (activeTab) {
      case "all":
        return searchFilteredClassifications;
      case "final":
        return searchFilteredClassifications.filter(
          (classification) =>
            classification.status === ClassificationStatus.FINAL
        );
      case "review":
        return searchFilteredClassifications.filter(
          (classification) =>
            classification.status === ClassificationStatus.REVIEW
        );
      case "draft":
        return searchFilteredClassifications.filter(
          (classification) =>
            classification.status === ClassificationStatus.DRAFT
        );
      default:
        return searchFilteredClassifications;
    }
  }, [searchFilteredClassifications, activeTab]);

  // Filter classifications based on selected user and importer
  const filteredClassifications = useMemo(() => {
    let filtered = tabFilteredClassifications;

    // Filter by selected user
    if (selectedUserId) {
      filtered = filtered.filter(
        (classification) => classification.user_id === selectedUserId
      );
    }

    // Filter by selected importer
    if (selectedImporterId) {
      if (selectedImporterId === UNASSIGNED_IMPORTER_VALUE) {
        // Filter for classifications with no importer
        filtered = filtered.filter(
          (classification) => classification.importer_id === null
        );
      } else {
        // Filter for specific importer
        filtered = filtered.filter(
          (classification) => classification.importer_id === selectedImporterId
        );
      }
    }

    return filtered;
  }, [tabFilteredClassifications, selectedUserId, selectedImporterId]);

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoader({ isLoading: true, text: "Fetching Classifications" });
      await refreshClassifications();
      setLoader({ isLoading: false, text: "" });
    };

    if (page === ClassifyPage.CLASSIFICATIONS) {
      fetchClassifications();
    }
  }, [page]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoader({ isLoading: true, text: "Loading Classifications" });
      await Promise.all([fetchElements("latest"), getSections()]);
      setLoader({ isLoading: false, text: "" });
    };

    if (!sections.length || !htsElements.length) {
      loadAllData();
    } else {
      setLoader({ isLoading: false, text: "" });
    }
  }, []);

  if (classificationsError || userError) {
    return (
      <main className="w-full h-full flex items-center justify-center bg-base-100">
        <div className="text-error p-6 rounded-2xl bg-error/10 border border-error/20">
          {classificationsError &&
            `Error loading classifications: ${classificationsError.message}`}
          {userError && `Error loading user: ${userError.message}`}
        </div>
      </main>
    );
  }

  // Show full screen loading when data is being loaded
  if (loader.isLoading) {
    return (
      <main className="w-full h-full flex items-center justify-center bg-base-300">
        <LoadingIndicator />
      </main>
    );
  }

  return (
    <main className="w-full min-h-full flex flex-col bg-base-100">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200/80 via-base-100 to-base-200/60 border-b border-base-content/10">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left side - Main headline */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="inline-block w-8 h-px bg-primary/60" />
                Your Classification History
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                <span className="text-base-content">
                  Classifications
                </span>
              </h1>
              <p className="text-base-content/70 text-sm md:text-base max-w-lg mt-1">
                View, manage, and track your classifications.
              </p>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-row gap-3 md:items-end">
              {!activeClassifyPlan && (
                <button
                  className="group relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-secondary/15 border border-secondary/30 hover:border-secondary/50 hover:bg-secondary/25 hover:shadow-lg hover:shadow-secondary/20"
                  disabled={loadingUpgrade}
                  onClick={async () => {
                    try {
                      setLoadingUpgrade(true);
                      const { url }: { url: string } = await apiClient.post(
                        "/stripe/create-checkout",
                        {
                          itemId: classifyPro.planIdentifier,
                          successEndpoint: "/classifications",
                          cancelUrl: window.location.href,
                        }
                      );
                      window.location.href = url;
                    } catch (error) {
                      setLoadingUpgrade(false);
                    }
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loadingUpgrade ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <BoltIcon className="h-4 w-4 text-secondary" />
                    )}
                    <span className="text-secondary font-bold">Upgrade</span>
                  </span>
                </button>
              )}
              <button
                className="group relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-primary text-primary-content hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]"
                onClick={async () => {
                  setLoadingNewClassification(true);
                  await fetchElements("latest");
                  setPage(ClassifyPage.CLASSIFY);
                  setLoadingNewClassification(false);
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loadingNewClassification ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <PlusIcon className="h-5 w-5" />
                  )}
                  New Classification
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto flex flex-col px-4 sm:px-6 gap-4 py-6">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {!loader.isLoading && (
              <div className="flex p-1 gap-1 bg-base-200/60 rounded-xl border border-base-content/5">
                {[
                  { key: "all", label: "All" },
                  { key: "final", label: "Final" },
                  { key: "review", label: "Needs Review" },
                  { key: "draft", label: "Drafts" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab.key
                        ? "bg-base-100 text-base-content shadow-sm"
                        : "text-base-content/60 hover:text-base-content hover:bg-base-100/50"
                    }`}
                    onClick={() =>
                      setActiveTab(
                        tab.key as "all" | "final" | "review" | "draft"
                      )
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            {(loader.isLoading || classificationsLoading) && (
              <span className="loading loading-spinner loading-sm text-primary"></span>
            )}
          </div>
        </div>

        {/* Filtering Section */}
        <div className="relative overflow-hidden rounded-2xl border border-base-content/15 bg-base-200/50 p-4">
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-4">
            {/* Filter Bar */}
            <div className="grow flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 items-center">
                  <DocumentTextIcon className="h-4 w-4 text-primary" />
                  <label className="text-xs font-semibold uppercase tracking-wider text-base-content/80">
                    Description or Code
                  </label>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Filter by description or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] px-4 bg-base-100 rounded-xl border border-base-content/15 transition-all duration-200 placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 hover:border-primary/40"
              />
            </div>

            {/* Filter By User/Classifier */}
            {teamUsers.length > 0 && (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1.5 items-center">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <label className="text-xs font-semibold uppercase tracking-wider text-base-content/80">
                      Classifier
                    </label>
                  </div>
                  {selectedUserId && (
                    <button
                      onClick={() => setSelectedUserId("")}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="h-[42px] px-4 bg-base-100 rounded-xl border border-base-content/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 hover:border-primary/40 cursor-pointer"
                >
                  <option value="">All Users</option>
                  {teamUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter By Importer */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 items-center">
                  <TagIcon className="h-4 w-4 text-primary" />
                  <label className="text-xs font-semibold uppercase tracking-wider text-base-content/80">
                    Importer
                  </label>
                </div>
                {selectedImporterId && (
                  <button
                    onClick={() => setSelectedImporterId("")}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <select
                value={selectedImporterId}
                onChange={(e) => setSelectedImporterId(e.target.value)}
                className="h-[42px] px-4 bg-base-100 rounded-xl border border-base-content/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 hover:border-primary/40 cursor-pointer"
              >
                <option value="">All Importers</option>
                <option value={UNASSIGNED_IMPORTER_VALUE}>Unassigned</option>
                {importers.map((importer) => (
                  <option key={importer.id} value={importer.id}>
                    {importer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredClassifications && filteredClassifications.length > 0 && (
          <>
            {/* Results Separator */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-content/30 to-base-content/30"></div>
              <span className="text-xs font-semibold uppercase tracking-widest text-base-content/60">
                {filteredClassifications.length}{" "}
                {filteredClassifications.length === 1
                  ? "Classification"
                  : "Classifications"}
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-base-content/30 to-base-content/30"></div>
            </div>

            <div className="flex flex-col gap-3 pb-6">
              {filteredClassifications.map((classification, index) => (
                <ClassificationSummary
                  key={`classification-${index}`}
                  classificationRecord={classification}
                  setPage={setPage}
                  user={userProfile}
                  onDelete={handleDeleteClassification}
                  isDeleting={deletingId === classification.id}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loader.isLoading &&
          !classificationsLoading &&
          (() => {
            const emptyStateConfig = getEmptyStateConfig();
            if (!emptyStateConfig) return null;

            return (
              <div className="relative overflow-hidden flex flex-col items-center justify-center py-16 px-6 rounded-2xl border border-base-content/15 bg-base-200/50">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-secondary/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
                  {/* Grid pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                      backgroundSize: "40px 40px",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                  {/* Icon with animated ring */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-xl animate-pulse" />
                    <div className="relative p-5 rounded-full bg-base-100 shadow-lg border border-base-content/10">
                      <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-10 h-10 text-primary"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={emptyStateConfig.iconPath}
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping [animation-duration:3s]" />
                  </div>

                  {/* Text content */}
                  <div
                    className={`text-center ${emptyStateConfig.maxWidth || "max-w-xl"}`}
                  >
                    <h3 className="text-2xl md:text-3xl font-bold text-base-content">
                      {emptyStateConfig.title}
                    </h3>
                    <div className="text-base-content/70 mt-3 text-base leading-relaxed">
                      {emptyStateConfig.descriptions.map((desc, index) => (
                        <p key={index}>{desc}</p>
                      ))}
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    className="group relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-primary text-primary-content hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]"
                    onClick={emptyStateConfig.onButtonClick}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {emptyStateConfig.buttonIcon}
                      {emptyStateConfig.buttonText}
                    </span>
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
    </main>
  );
};
