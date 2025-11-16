"use client";

import { WorkflowStep } from "../enums/hts";
import { useEffect, useState } from "react";
import { Explore } from "./Explore";
import { ClassificationStep } from "./workflow/ClassificationStep";
import { ClassificationNavigation } from "./workflow/ClassificationNavigation";
import { DescriptionStep } from "./workflow/DescriptionStep";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyPage, ClassifyTab } from "../enums/classify";
import { LoadingIndicator } from "./LoadingIndicator";
import { useHts } from "../contexts/HtsContext";
import { ClassificationResultPage } from "./ClassificationResultPage";
import Modal from "./Modal";
import ConversionPricing from "./ConversionPricing";
import { useClassification } from "../contexts/ClassificationContext";
import { classNames } from "../utilities/style";
import { fetchUser, UserProfile } from "../libs/supabase/user";
import { useUser } from "../contexts/UserContext";
import { useClassifications } from "../contexts/ClassificationsContext";

interface Props {
  setPage: (page: ClassifyPage) => void;
}

export const Classify = ({ setPage }: Props) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fetchingOptionsOrSuggestions, setFetchingOptionsOrSuggestions] =
    useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { activeTab } = useClassifyTab();
  const { isFetching } = useHts();
  const {
    classification,
    setClassification,
    setClassificationId,
    classificationId,
  } = useClassification();
  const { classifications } = useClassifications();
  const [classificationLevel, setClassificationLevel] = useState<
    number | undefined
  >(() => {
    if (classification?.levels.length) {
      return classification.levels.length - 1;
    }
    return undefined;
  });

  const classificationRecord = classifications.find(
    (c) => c.id === classificationId
  );

  const [workflowStep, setWorkflowStep] = useState(() => {
    if (classification?.isComplete) {
      return WorkflowStep.RESULT;
    }
    if (classification?.levels.length) {
      return WorkflowStep.CLASSIFICATION;
    }
    return WorkflowStep.DESCRIPTION;
  });

  const { user } = useUser();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userProfile = await fetchUser(user.id);
      setUserProfile(userProfile || null);
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      setClassification(null);
      setClassificationId(null);
    };
  }, []);

  if (isFetching || !userProfile) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-base-300 grid grid-cols-12">
      {/* Sidebar Navigation */}
      {classification &&
        !(
          workflowStep === WorkflowStep.DESCRIPTION &&
          !classification.articleDescription
        ) && (
          <div className="h-full bg-base-100 overflow-hidden border-r border-base-content/30 col-span-4">
            <ClassificationNavigation
              setPage={setPage}
              workflowStep={workflowStep}
              setWorkflowStep={setWorkflowStep}
              classificationLevel={classificationLevel}
              setClassificationLevel={setClassificationLevel}
              fetchingOptionsOrSuggestions={fetchingOptionsOrSuggestions}
            />
          </div>
        )}

      {/* Classify Tab */}
      <div
        className={classNames(
          "h-full grow overflow-y-auto",
          workflowStep === WorkflowStep.DESCRIPTION && !classification
            ? "col-span-12"
            : "col-span-8"
        )}
      >
        {activeTab === ClassifyTab.CLASSIFY && (
          <>
            {workflowStep === WorkflowStep.DESCRIPTION && (
              <DescriptionStep
                setPage={setPage}
                setWorkflowStep={setWorkflowStep}
                setClassificationLevel={setClassificationLevel}
                setShowPricing={setShowPricing}
                classificationRecord={classificationRecord}
              />
            )}
            {workflowStep === WorkflowStep.CLASSIFICATION && (
              <ClassificationStep
                key={`classification-step-${classificationLevel}`}
                setWorkflowStep={setWorkflowStep}
                classificationLevel={classificationLevel}
                setClassificationLevel={setClassificationLevel}
                setFetchingOptionsOrSuggestions={
                  setFetchingOptionsOrSuggestions
                }
                classificationRecord={classificationRecord}
              />
            )}
            {workflowStep === WorkflowStep.RESULT && (
              <ClassificationResultPage userProfile={userProfile} />
            )}
          </>
        )}
        {/* Explore Tab */}
        {activeTab === ClassifyTab.EXPLORE && <Explore />}
      </div>
      {showPricing && (
        <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
          <ConversionPricing />
        </Modal>
      )}
    </div>
  );
};
