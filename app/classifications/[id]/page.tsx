"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useHts } from "../../../contexts/HtsContext";
import { useUser } from "../../../contexts/UserContext";
import { useUserProfileAndImporters } from "../../../hooks";
import {
  ClassificationFetchError,
  fetchClassificationById,
} from "../../../libs/classification";
import { ClassificationLoadFailure } from "../../../components/classification-detail/ClassificationFetchError";
import { canUserUpdateDetails } from "../../../libs/classification-helpers";
import { ClassificationDetailLayout } from "../../../components/classification-detail/ClassificationDetailLayout";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { ClassificationRecord } from "../../../interfaces/hts";
import { BreadcrumbsProvider } from "../../../contexts/BreadcrumbsContext";
import { ClassificationsProvider } from "../../../contexts/ClassificationsContext";
import { ReadOnlyProvider } from "../../../contexts/ReadOnlyContext";

export default function ClassificationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useUser();
  const { userProfile } = useUserProfileAndImporters(user?.id);
  const {
    setClassification,
    setClassificationId,
    resetClassificationState,
    flushAndSave,
    setCanSave,
  } = useClassification();
  const { fetchElements, revision } = useHts();

  const [record, setRecord] = useState<ClassificationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  /** HTTP status from failed fetch; `0` = network / unknown */
  const [loadErrorStatus, setLoadErrorStatus] = useState<number | null>(null);
  const hasRefetchedForLinkingRef = useRef(false);
  const canUpdateRef = useRef(false);
  /** When true, unmount must not flush (e.g. row was deleted). */
  const skipUnmountFlushRef = useRef(false);

  useEffect(() => {
    const anonymousEditorClassificationId =
      !user &&
      record &&
      record.user_id === null &&
      !record.is_shared
        ? record.id
        : null;

    const canUpdate = canUserUpdateDetails(
      userProfile ?? null,
      record ?? undefined,
      { anonymousEditorClassificationId },
    );
    canUpdateRef.current = canUpdate;
    if (record) {
      setCanSave(canUpdate);
    }
    return () => {
      setCanSave(true);
    };
  }, [userProfile, record, setCanSave, user]);

  useEffect(() => {
    let cancelled = false;

    const loadClassification = async () => {
      setLoadErrorStatus(null);
      try {
        setIsLoading(true);
        const fetchedRecord = await fetchClassificationById(id);
        if (cancelled) return;

        setLoadErrorStatus(null);
        setRecord(fetchedRecord);
        setClassification(fetchedRecord.classification);
        setClassificationId(fetchedRecord.id);

        if (
          fetchedRecord.revision &&
          fetchedRecord.revision !== revision
        ) {
          try {
            await fetchElements(fetchedRecord.revision);
          } catch (e) {
            console.error("Failed to fetch HTS elements (non-fatal):", e);
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load classification:", err);
        const status =
          err instanceof ClassificationFetchError ? err.status : 0;
        setLoadErrorStatus(status);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadClassification();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (
      user &&
      record &&
      !record.user_id &&
      !hasRefetchedForLinkingRef.current
    ) {
      hasRefetchedForLinkingRef.current = true;

      const refetch = async () => {
        try {
          const updated = await fetchClassificationById(id);
          setRecord(updated);
          setClassification(updated.classification);
        } catch {
          // Linking may not have completed yet
        }
      };

      const timer = setTimeout(refetch, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, record, id, setClassification]);

  useEffect(() => {
    return () => {
      if (canUpdateRef.current && !skipUnmountFlushRef.current) {
        void flushAndSave();
      }
      resetClassificationState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run cleanup only on real unmount
  }, []);

  const handleNavigateBack = async (options?: { skipFlush?: boolean }) => {
    if (options?.skipFlush) {
      skipUnmountFlushRef.current = true;
    }
    if (!options?.skipFlush && canUpdateRef.current) {
      await flushAndSave();
    }
    router.push("/classifications");
  };

  if (isLoading) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </main>
    );
  }

  if (loadErrorStatus !== null) {
    return <ClassificationLoadFailure httpStatus={loadErrorStatus} />;
  }

  const anonymousEditorClassificationId =
    !user &&
    record &&
    record.user_id === null &&
    !record.is_shared
      ? record.id
      : null;

  const canUpdate = canUserUpdateDetails(
    userProfile ?? null,
    record ?? undefined,
    { anonymousEditorClassificationId },
  );

  return (
    <ClassificationsProvider>
      <BreadcrumbsProvider>
        <ReadOnlyProvider readOnly={!canUpdate}>
          <ClassificationDetailLayout
            classificationRecord={record ?? undefined}
            onNavigateBack={handleNavigateBack}
          />
        </ReadOnlyProvider>
      </BreadcrumbsProvider>
    </ClassificationsProvider>
  );
}
