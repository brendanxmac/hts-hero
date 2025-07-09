import { ClassifyPage } from "../enums/classify";
import { ClassificationSummary } from "./ClassificationSummary";
import { SecondaryText } from "./SecondaryText";
import { Color } from "../enums/style";
import { useClassifications } from "../contexts/ClassificationsContext";
import { LoadingIndicator } from "./LoadingIndicator";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState } from "react";
import { Loader } from "../interfaces/ui";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { PrimaryLabel } from "./PrimaryLabel";

interface Props {
  page: ClassifyPage;
  setPage: (page: ClassifyPage) => void;
}

export const Classifications = ({ page, setPage }: Props) => {
  const [loader, setLoader] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const { htsElements, fetchElements } = useHts();
  const { getSections, sections } = useHtsSections();
  const {
    classifications,
    error: classificationsError,
    isLoading: classificationsLoading,
    refreshClassifications,
  } = useClassifications();
  const { user, error: userError } = useUser();

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
    let message = "Welcome back";

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
      <div className="flex flex-col">
        <div className="flex justify-between items-center shadow-xl py-2">
          <PrimaryLabel value="Your Classifications" color={Color.WHITE} />
          {loader.isLoading || classificationsLoading ? (
            <LoadingIndicator text={loader.text || "Loading Classifications"} />
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setPage(ClassifyPage.CLASSIFY)}
            >
              New Classification
            </button>
          )}
        </div>
        {classifications && (
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
      </div>
    </div>
  );
};
