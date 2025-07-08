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

interface Props {
  setPage: (page: ClassifyPage) => void;
}

export const Classifications = ({ setPage }: Props) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const { htsElements, fetchElements } = useHts();
  const { getSections, sections } = useHtsSections();
  const { classifications, error: classificationsError } = useClassifications();
  const { user, error: userError } = useUser();

  useEffect(() => {
    const loadAllData = async () => {
      setLoading({ isLoading: true, text: "Fetching All Data" });
      await Promise.all([fetchElements(), getSections()]);
      setLoading({ isLoading: false, text: "" });
    };

    if (!sections.length || !htsElements.length) {
      loadAllData();
    } else {
      setLoading({ isLoading: false, text: "" });
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

  if (loading.isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingIndicator text="Fetching your classifications" />
      </div>
    );
  }

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
    <div className="h-full w-full max-w-3xl mx-auto pt-12 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl text-neutral-50 font-bold">
          {getUserNameMessage()}
        </h1>
        <SecondaryText
          value="Review your classifications or start a new one now."
          color={Color.WHITE}
        />
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-neutral-50 font-bold">
          Your Classifications
        </h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setPage(ClassifyPage.CLASSIFY)}
        >
          New Classification
        </button>
      </div>
      {classifications && (
        <div className="flex flex-col gap-4">
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
  );
};
