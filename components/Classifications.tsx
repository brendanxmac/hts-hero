import { ClassifyPage } from "../enums/classify";
import { ClassificationSummary } from "./ClassificationSummary";
import { SecondaryText } from "./SecondaryText";
import { Color } from "../enums/style";
import { useClassifications } from "../contexts/ClassificationsContext";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState, useMemo } from "react";
import { Loader } from "../interfaces/ui";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { PrimaryLabel } from "./PrimaryLabel";
import { TertiaryText } from "./TertiaryText";
import { PlusIcon } from "@heroicons/react/16/solid";
import { FunnelIcon } from "@heroicons/react/24/solid";
import { BoltIcon } from "@heroicons/react/16/solid";
import Fuse, { IFuseOptions } from "fuse.js";
import { LoadingIndicator } from "./LoadingIndicator";
import { PricingPlan } from "../types";
import { getActiveClassifyPurchase } from "../libs/supabase/purchase";
import { classNames } from "../utilities/style";
import Link from "next/link";

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
  const [loader, setLoader] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "finalized" | "draft">(
    "all"
  );
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

  useEffect(() => {
    const fetchActiveClassifyPurchase = async () => {
      const activeClassifyPurchase = await getActiveClassifyPurchase(user.id);

      if (activeClassifyPurchase) {
        setActiveClassifyPlan(activeClassifyPurchase.product_name);
      }
    };
    if (user) {
      fetchActiveClassifyPurchase();
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
  const filteredClassifications = useMemo(() => {
    if (!searchFilteredClassifications) {
      return [];
    }

    switch (activeTab) {
      case "all":
        return searchFilteredClassifications;
      case "finalized":
        return searchFilteredClassifications.filter(
          (classification) => classification.finalized === true
        );
      case "draft":
        return searchFilteredClassifications.filter(
          (classification) => !classification.finalized
        );
      default:
        return searchFilteredClassifications;
    }
  }, [searchFilteredClassifications, activeTab]);

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

  const getUserNameMessage = () => {
    const hasClassifications = classifications && classifications.length > 0;
    let message = hasClassifications ? "Welcome back" : "Welcome to HTS Hero";

    if (user?.user_metadata?.name) {
      const firstName = user.user_metadata.name.split(" ")[0];
      message += `, ${firstName}`;
    }

    return `${message} 👋`;
  };

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
    <div className="h-full w-full max-w-5xl mx-auto pt-2 lg:pt-8 px-4 flex flex-col gap-4">
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-4 py-2">
          {/* Header Row */}
          <div className="w-full flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div className="flex flex-col gap-2">
              <div className="flex sm:flex-row flex-col sm:items-center gap-2">
                <h1 className="text-2xl md:text-3xl xl:text-4xl text-neutral-50 font-bold">
                  {getUserNameMessage()}
                </h1>

                <div
                  className={classNames(
                    "hidden md:block shrink-0 h-fit w-fit text-sm border rounded-md px-2 py-0 text-primary font-semibold",
                    activeClassifyPlan
                      ? "text-primary border-primary"
                      : "text-warning border-warning"
                  )}
                >
                  {activeClassifyPlan ? activeClassifyPlan : "Free Trial"}
                </div>
              </div>
              <SecondaryText
                value="Review your classifications or start a new one now."
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              {!activeClassifyPlan && (
                <Link
                  href="/about#pricing"
                  className="btn btn-secondary btn-sm flex gap-2"
                >
                  <BoltIcon className="h-4 w-4" />
                  Upgrade
                </Link>
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

          {/* Search and Actions Row */}
          <div className="flex flex-col gap-3 items-start justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 items-center">
              <h2 className="text-xl md:text-2xl text-neutral-50 font-bold">
                Your Classifications
              </h2>
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
                      activeTab === "finalized"
                        ? "tab-active"
                        : "hover:bg-primary/70 hover:text-black"
                    }`}
                    onClick={() => setActiveTab("finalized")}
                  >
                    Finalized
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
            </div>
            {/* Filter Bar */}

            <div className="flex-1 relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Filter classifications by description or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1 bg-base-100 border-2 border-base-content/20 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loader.isLoading ||
          (classificationsLoading && (
            <div className="w-full flex justify-center items-center">
              <span className={`loading loading-spinner loading-sm`}></span>
            </div>
          ))}

        {filteredClassifications && filteredClassifications.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 pb-6">
            {filteredClassifications.map((classification, index) => (
              <ClassificationSummary
                key={`classification-${index}`}
                classificationRecord={classification}
                setPage={setPage}
              />
            ))}
          </div>
        )}
        {!loader.isLoading &&
          !classificationsLoading &&
          classifications &&
          classifications.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-24 h-24 text-neutral-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-4 items-center">
                <div className="text-center flex flex-col gap-1 items-center">
                  <PrimaryLabel
                    value="No Classifications Yet"
                    color={Color.WHITE}
                  />
                  <TertiaryText
                    value="You haven't started or completed any classifications yet, but can start one now."
                    color={Color.NEUTRAL_CONTENT}
                  />
                </div>
                <button
                  className="btn btn-primary w-fit"
                  onClick={() => setPage(ClassifyPage.CLASSIFY)}
                >
                  Start First Classification
                </button>
              </div>
            </div>
          )}

        {/* No search results */}
        {!loader.isLoading &&
          !classificationsLoading &&
          classifications &&
          classifications.length > 0 &&
          filteredClassifications.length === 0 &&
          searchQuery !== "" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-24 h-24 text-neutral-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-4 items-center">
                <div className="text-center flex flex-col gap-1 items-center">
                  <PrimaryLabel
                    value="No Matching Classifications"
                    color={Color.WHITE}
                  />
                  <TertiaryText
                    value={`No classifications found matching "${searchQuery}".`}
                    color={Color.NEUTRAL_CONTENT}
                  />
                  <TertiaryText
                    value="Try adjusting your search terms or start a new classification."
                    color={Color.NEUTRAL_CONTENT}
                  />
                </div>
                <button
                  className="btn btn-primary w-fit btn-sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

        {/* Empty state for draft tab */}
        {!loader.isLoading &&
          !classificationsLoading &&
          classifications &&
          classifications.length > 0 &&
          filteredClassifications.length === 0 &&
          searchQuery === "" &&
          activeTab === "draft" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-24 h-24 text-neutral-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-4 items-center">
                <div className="text-center flex flex-col gap-1 items-center">
                  <PrimaryLabel
                    value="No Draft Classifications"
                    color={Color.WHITE}
                  />
                  <TertiaryText
                    value="You don't have any draft classifications at the moment."
                    color={Color.NEUTRAL_CONTENT}
                  />
                  <TertiaryText
                    value="Start a new classification to begin working on a draft."
                    color={Color.NEUTRAL_CONTENT}
                  />
                </div>
                <button
                  className="btn btn-primary w-fit"
                  onClick={async () => {
                    setLoadingNewClassification(true);
                    await fetchElements("latest");
                    setPage(ClassifyPage.CLASSIFY);
                    setLoadingNewClassification(false);
                  }}
                >
                  {loadingNewClassification ? (
                    <span
                      className={`loading loading-spinner loading-sm`}
                    ></span>
                  ) : (
                    <PlusIcon className="h-5 w-5" />
                  )}
                  Start New Classification
                </button>
              </div>
            </div>
          )}

        {/* Empty state for finalized tab */}
        {!loader.isLoading &&
          !classificationsLoading &&
          classifications &&
          classifications.length > 0 &&
          filteredClassifications.length === 0 &&
          searchQuery === "" &&
          activeTab === "finalized" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-24 h-24 text-neutral-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-4 items-center">
                <div className="text-center flex flex-col gap-1 items-center max-w-md">
                  <PrimaryLabel
                    value="No Finalized Classifications"
                    color={Color.WHITE}
                  />
                  <TertiaryText
                    value="Classifications that you've fully completed can be marked as final."
                    color={Color.NEUTRAL_CONTENT}
                  />
                  <TertiaryText
                    value='To do this, open the classification and click "Mark as Final" in the top right hand corner.'
                    color={Color.NEUTRAL_CONTENT}
                  />
                </div>
                <button
                  className="btn btn-primary btn-wide btn-sm"
                  onClick={() => setActiveTab("draft")}
                >
                  View Drafts
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
