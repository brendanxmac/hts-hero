"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useHts } from "../../../contexts/HtsContext";
import { useUser } from "../../../contexts/UserContext";
import { useUserProfileAndImporters } from "../../../hooks";
import { fetchClassificationById } from "../../../libs/classification";
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
  const [error, setError] = useState<string | null>(null);
  const hasRefetchedForLinkingRef = useRef(false);
  const canUpdateRef = useRef(false);

  useEffect(() => {
    const canUpdate = canUserUpdateDetails(userProfile ?? null, record ?? undefined);
    canUpdateRef.current = canUpdate;
    if (record) {
      setCanSave(canUpdate);
    }
    return () => {
      setCanSave(true);
    };
  }, [userProfile, record, setCanSave]);

  useEffect(() => {
    let cancelled = false;

    const loadClassification = async () => {
      setError(null);
      try {
        setIsLoading(true);
        const fetchedRecord = await fetchClassificationById(id);
        if (cancelled) return;

        setError(null);
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
        setError("Classification not found");
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
  }, [user, record]);

  useEffect(() => {
    return () => {
      if (canUpdateRef.current) {
        flushAndSave();
      }
      resetClassificationState();
    };
  }, []);

  const handleNavigateBack = async () => {
    if (canUpdateRef.current) {
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

  if (error) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-base-100">
        <div className="text-error p-6 rounded-2xl bg-error/10 border border-error/20">
          {error}
        </div>
      </main>
    );
  }

  const canUpdate = canUserUpdateDetails(userProfile ?? null, record ?? undefined);

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
