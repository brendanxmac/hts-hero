import { ClassifyPage } from "../enums/classify";
import { ClassificationSummary } from "./ClassificationSummary";
import { SecondaryText } from "./SecondaryText";
import { Color } from "../enums/style";
import { useClassifications } from "../contexts/ClassificationsContext";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState } from "react";
import { Loader } from "../interfaces/ui";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { PrimaryLabel } from "./PrimaryLabel";
import { TertiaryText } from "./TertiaryText";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/16/solid";
import { formatHumanReadableDate } from "../libs/date";
import { useClassification } from "../contexts/ClassificationContext";

interface Props {
  page: ClassifyPage;
  setPage: (page: ClassifyPage) => void;
}

export const Classifications = ({ page, setPage }: Props) => {
  const [loader, setLoader] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
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

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoader({ isLoading: true, text: "Fetching Classifications" });
      await refreshClassifications();
      setLastUpdated(new Date());
      setLoader({ isLoading: false, text: "" });
    };

    if (page === ClassifyPage.CLASSIFICATIONS) {
      fetchClassifications();
    }
  }, [page]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoader({ isLoading: true, text: "Loading Classifications" });
      await Promise.all([fetchElements(), getSections()]);
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
    setLastUpdated(new Date());
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
    <div className="h-full w-full max-w-3xl mx-auto pt-8 px-4 flex flex-col gap-4 overflow-y-scroll">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl text-neutral-50 font-bold">
          {getUserNameMessage()}
        </h1>
        <SecondaryText
          value="Review your classifications or start a new one now."
          color={Color.NEUTRAL_CONTENT}
        />
      </div>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center py-2">
          <div className="flex flex-col">
            <PrimaryLabel value="Your Classifications" color={Color.WHITE} />

            <TertiaryText
              value={`Last updated: ${
                lastUpdated
                  ? formatHumanReadableDate(lastUpdated.toISOString())
                  : "--"
              }`}
              color={Color.NEUTRAL_CONTENT}
            />
          </div>
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
                <span className={`loading loading-spinner loading-sm`}></span>
              ) : (
                <ArrowPathIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {classifications && classifications.length > 0 && (
          <div className="flex flex-col gap-2 pb-6">
            {classifications.map((classification, index) => (
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
      </div>
    </div>
  );
};
