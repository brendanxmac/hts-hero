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

interface Props {
  classificationRecord: ClassificationRecord;
}

export default function SharedClassificationClient({
  classificationRecord,
}: Props) {
  const { setClassification, setClassificationId, resetClassificationState } =
    useClassification();
  const { fetchElements, revision } = useHts();
  const [isReady, setIsReady] = useState(false);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const hydrate = async () => {
      setClassification(classificationRecord.classification);
      setClassificationId(classificationRecord.id);

      if (
        classificationRecord.revision &&
        classificationRecord.revision !== revision
      ) {
        await fetchElements(classificationRecord.revision);
      }

      setIsReady(true);
    };

    hydrate();

    return () => {
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
