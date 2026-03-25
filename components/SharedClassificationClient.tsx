"use client";

import { useEffect, useRef, useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { ClassificationRecord } from "../interfaces/hts";
import { ClassificationDetailLayout } from "./classification-detail/ClassificationDetailLayout";
import { LoadingIndicator } from "./LoadingIndicator";
import { ReadOnlyProvider } from "../contexts/ReadOnlyContext";
import { ClassificationsProvider } from "../contexts/ClassificationsContext";
import { BreadcrumbsProvider } from "../contexts/BreadcrumbsContext";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";

interface Props {
  classificationRecord: ClassificationRecord;
}

export default function SharedClassificationClient({
  classificationRecord,
}: Props) {
  const {
    setClassification,
    setClassificationId,
    resetClassificationState,
    setCanSave,
  } = useClassification();
  const { fetchElements, revision } = useHts();
  const [isReady, setIsReady] = useState(false);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const hydrate = async () => {
      setClassification(classificationRecord.classification);
      setClassificationId(classificationRecord.id);
      setCanSave(false);

      if (
        classificationRecord.revision &&
        classificationRecord.revision !== revision
      ) {
        try {
          await fetchElements(classificationRecord.revision);
        } catch (e) {
          // Match app/classifications/[id]/page: HTS load failure is non-fatal
          console.error("Failed to fetch HTS elements (non-fatal):", e);
        }
      }

      setIsReady(true);
      trackEvent(MixpanelEvent.SHARED_CLASSIFICATION_VIEWED, {
        classification_id: classificationRecord.id,
      });
    };

    hydrate();

    return () => {
      setCanSave(true);
      resetClassificationState();
    };
  }, []);

  if (!isReady) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </main>
    );
  }

  return (
    <ReadOnlyProvider>
      <ClassificationsProvider>
        <BreadcrumbsProvider>
          <ClassificationDetailLayout
            classificationRecord={classificationRecord}
            onNavigateBack={() => {}}
          />
        </BreadcrumbsProvider>
      </ClassificationsProvider>
    </ReadOnlyProvider>
  );
}
