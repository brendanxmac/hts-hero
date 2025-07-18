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
import {
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { useClassification } from "../contexts/ClassificationContext";
import Fuse from "fuse.js";

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
  const [loader, setLoader] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { htsElements, fetchElements } = useHts();
  const { getSections, sections } = useHtsSections();
  const {
    classifications,
    error: classificationsError,
    isLoading: classificationsLoading,
    refreshClassifications,
  } = useClassifications();
  const { setClassification } = useClassification();
  const { user, error: userError } = useUser();

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
  const fuseOptions = {
    keys: [
      { name: "articleDescription", weight: 0.4 },
      { name: "htsCodes", weight: 0.4 },
    ],
    threshold: 0.3, // Lower threshold = more strict matching
    includeScore: true,
    includeMatches: true,
  };

  // Create Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(searchableClassifications, fuseOptions);
  }, [searchableClassifications]);

  // Filter classifications based on search query using Fuse.js
  const filteredClassifications = useMemo(() => {
    if (!searchQuery.trim() || !classifications) {
      return classifications || [];
    }

    const searchResults = fuse.search(searchQuery);
    const resultIds = searchResults.map((result) => result.item.id);

    return classifications.filter((classification) =>
      resultIds.includes(classification.id)
    );
  }, [searchQuery, classifications, fuse]);

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

  const handleRefreshClassifications = async () => {
    await refreshClassifications();
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

  return (
    <div className="h-full w-full max-w-5xl mx-auto pt-2 lg:pt-8 px-4 flex flex-col gap-4">
      {/* <div className="flex flex-col gap-2">
        <h1 className="text-4xl text-neutral-50 font-bold">
          {getUserNameMessage()}
        </h1>
        <SecondaryText
          value="Review your classifications or start a new one now."
          color={Color.NEUTRAL_CONTENT}
        />
      </div> */}
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-4 py-2">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl xl:text-4xl text-neutral-50 font-bold">
                {getUserNameMessage()}
              </h1>
              <SecondaryText
                value="Review your classifications or start a new one now."
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
          </div>

          {/* Search and Actions Row */}
          {classifications && classifications.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end justify-between">
              {/* Search Bar */}
              <div className="flex-1 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by description or HTS code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-1 bg-base-100 border-2 border-base-content/20 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm gap-1"
                  onClick={() => {
                    setClassification({
                      articleDescription: "",
                      articleAnalysis: "",
                      progressionDescription: "",
                      levels: [],
                      isComplete: false,
                      notes: "",
                    });
                    setPage(ClassifyPage.CLASSIFY);
                  }}
                >
                  <PlusIcon className="h-5 w-5" />
                  New
                </button>
                <button
                  className="btn btn-primary btn-sm btn-square"
                  onClick={handleRefreshClassifications}
                >
                  {loader.isLoading || classificationsLoading ? (
                    <span
                      className={`loading loading-spinner loading-sm`}
                    ></span>
                  ) : (
                    <ArrowPathIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        {filteredClassifications && filteredClassifications.length > 0 && (
          <div className="flex flex-col gap-2 pb-6">
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
          filteredClassifications.length === 0 && (
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
      </div>
    </div>
  );
};
