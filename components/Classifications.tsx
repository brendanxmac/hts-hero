import { ClassifyPage } from "../enums/classify";
import { ClassificationSummary } from "./ClassificationSummary";
import { useClassifications } from "../contexts/ClassificationsContext";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState, useMemo } from "react";
import { Loader } from "../interfaces/ui";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { PlusIcon } from "@heroicons/react/16/solid";
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

        console.log("teamUsers", teamUsers);
        console.log("importers", importers);

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
      filtered = filtered.filter(
        (classification) => classification.importer_id === selectedImporterId
      );
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
      <div className="h-full w-full max-w-3xl mx-auto pt-12 flex flex-col gap-8">
        <div className="text-error">
          {classificationsError &&
            `Error loading classifications: ${classificationsError.message}`}
          {userError && `Error loading user: ${userError.message}`}
        </div>
      </div>
    );
  }

  // Show full screen loading when data is being loaded
  if (loader.isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <LoadingIndicator />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full max-w-5xl mx-auto p-4 flex flex-col">
      <div className="flex flex-col gap-4 py-2">
        {/* Search and Actions Row */}
        <div className="w-full flex flex-col gap-3 items-start justify-between">
          <div className="w-full flex flex-col md:flex-row md:justify-between gap-4 md:gap-2 items-start md:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 items-start md:items-center">
              <h2 className="text-2xl md:text-3xl text-neutral-content font-bold">
                Classifications
              </h2>
              <div className="flex gap-2">
                {!loader.isLoading && (
                  <div
                    role="tablist"
                    className="tabs tabs-boxed tabs-sm bg-primary/30 rounded-xl gap-1"
                  >
                    <a
                      role="tab"
                      className={`tab transition-all duration-200 ease-in text-white font-semibold ${
                        activeTab === "all"
                          ? "tab-active"
                          : "hover:bg-primary/70 hover:text-black"
                      }`}
                      onClick={() => setActiveTab("all")}
                    >
                      All
                    </a>
                    <a
                      role="tab"
                      className={`tab transition-all duration-200 ease-in text-white font-semibold ${
                        activeTab === "final"
                          ? "tab-active"
                          : "hover:bg-primary/70 hover:text-black"
                      }`}
                      onClick={() => setActiveTab("final")}
                    >
                      Final
                    </a>
                    <a
                      role="tab"
                      className={`tab transition-all duration-200 ease-in text-white font-semibold ${
                        activeTab === "review"
                          ? "tab-active"
                          : "hover:bg-primary/70 hover:text-black"
                      }`}
                      onClick={() => setActiveTab("review")}
                    >
                      Needs Review
                    </a>
                    <a
                      role="tab"
                      className={`tab transition-all duration-200 ease-in text-white font-semibold ${
                        activeTab === "draft"
                          ? "tab-active"
                          : "hover:bg-primary/70 hover:text-black"
                      }`}
                      onClick={() => setActiveTab("draft")}
                    >
                      Drafts
                    </a>
                  </div>
                )}
                {loader.isLoading ||
                  (classificationsLoading && (
                    <span
                      className={`loading loading-spinner loading-sm`}
                    ></span>
                  ))}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto items-center">
              {!activeClassifyPlan && (
                <button
                  className="btn btn-secondary btn-sm flex gap-2 grow md:grow-0"
                  disabled={loadingUpgrade}
                  onClick={async () => {
                    try {
                      setLoadingUpgrade(true);
                      // Send them to checkout page
                      const { url }: { url: string } = await apiClient.post(
                        "/stripe/create-checkout",
                        {
                          itemId: classifyPro.planIdentifier,
                          successEndpoint: "/app",
                          cancelUrl: window.location.href,
                        }
                      );

                      window.location.href = url;
                    } catch (error) {
                      setLoadingUpgrade(false);
                    }
                  }}
                >
                  {loadingUpgrade ? (
                    <span
                      className={`loading loading-spinner loading-sm`}
                    ></span>
                  ) : (
                    <BoltIcon className="h-4 w-4" />
                  )}
                  Upgrade
                </button>
              )}
              <button
                className="btn btn-primary btn-sm grow md:grow-0"
                onClick={async () => {
                  setLoadingNewClassification(true);
                  await fetchElements("latest");
                  setPage(ClassifyPage.CLASSIFY);
                  setLoadingNewClassification(false);
                }}
              >
                {loadingNewClassification ? (
                  <span className={`loading loading-spinner loading-sm`}></span>
                ) : (
                  <PlusIcon className="h-5 w-5" />
                )}
                New Classification
              </button>
            </div>
          </div>

          {/* Filtering */}
          <div className="w-full flex flex-col md:flex-row gap-2">
            {/* Filter Bar */}
            <div className="grow flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-neutral-content">
                  Description or Code
                </label>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-primary font-bold hover:text-primary/80 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Filter by description, code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full input input-sm pr-4 py-1 bg-base-100 border-2 border-base-content/20 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter By User/Classifier */}
            {teamUsers.length > 0 && (
              <div className="flex flex-col gap-1 min-w-[250px]">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-neutral-content">
                    Classifier
                  </label>
                  {selectedUserId && (
                    <button
                      onClick={() => setSelectedUserId("")}
                      className="text-xs text-primary font-bold hover:text-primary/80 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="select select-sm bg-base-100 border-2 border-base-content/20 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            {importers.length > 0 && (
              <div className="flex flex-col gap-1 min-w-[250px]">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-neutral-content">
                    Importer
                  </label>
                  {selectedImporterId && (
                    <button
                      onClick={() => setSelectedImporterId("")}
                      className="text-xs text-primary font-bold hover:text-primary/80 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  value={selectedImporterId}
                  onChange={(e) => setSelectedImporterId(e.target.value)}
                  className="select select-sm bg-base-100 border-2 border-base-content/20 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Importers</option>
                  {importers.map((importer) => (
                    <option key={importer.id} value={importer.id}>
                      {importer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredClassifications && filteredClassifications.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 pb-6">
          {filteredClassifications.map((classification, index) => (
            <ClassificationSummary
              key={`classification-${index}`}
              classificationRecord={classification}
              setPage={setPage}
              user={userProfile}
            />
          ))}
        </div>
      )}

      {/* Unified empty state rendering */}
      {!loader.isLoading &&
        !classificationsLoading &&
        (() => {
          const emptyStateConfig = getEmptyStateConfig();
          return emptyStateConfig ? (
            <EmptyResults config={emptyStateConfig} />
          ) : null;
        })()}
    </div>
  );
};
