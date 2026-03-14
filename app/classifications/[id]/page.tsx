"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useHts } from "../../../contexts/HtsContext";
import { useUser } from "../../../contexts/UserContext";
import { fetchClassificationById } from "../../../libs/classification";
import { Classification } from "../../../components/Classification";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { ClassificationRecord } from "../../../interfaces/hts";
import { BreadcrumbsProvider } from "../../../contexts/BreadcrumbsContext";
import { ClassificationsProvider } from "../../../contexts/ClassificationsContext";

export default function ClassificationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useUser();
  const {
    setClassification,
    setClassificationId,
    resetClassificationState,
    flushAndSave,
  } = useClassification();
  const { fetchElements, revision } = useHts();

  const [record, setRecord] = useState<ClassificationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasRefetchedForLinkingRef = useRef(false);

  // Always fetch the classification record from the API
  useEffect(() => {
    let cancelled = false;

    const loadClassification = async () => {
      try {
        setIsLoading(true);
        const fetchedRecord = await fetchClassificationById(id);
        if (cancelled) return;

        setRecord(fetchedRecord);

        // Load the correct HTS revision if needed
        if (fetchedRecord.revision && fetchedRecord.revision !== revision) {
          await fetchElements(fetchedRecord.revision);
        }
        if (cancelled) return;

        // Hydrate the ClassificationContext
        setClassification(fetchedRecord.classification);
        setClassificationId(fetchedRecord.id);
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

  // Re-fetch if the record is still anonymous but the user is now authenticated.
  // This handles the race between the initial fetch and the AnonymousClassificationLinker.
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
          // Linking may not have completed yet — the stale record is still usable
        }
      };

      // Brief delay to let the AnonymousClassificationLinker POST complete
      const timer = setTimeout(refetch, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, record]);

  // Flush and reset when leaving the page
  useEffect(() => {
    return () => {
      flushAndSave();
      resetClassificationState();
    };
  }, []);

  const handleNavigateBack = async () => {
    await flushAndSave();
    // resetClassificationState();
    router.push("/classifications");
  };

  if (isLoading) {
    return (
      <main className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-100">
        <div className="text-error p-6 rounded-2xl bg-error/10 border border-error/20">
          {error}
        </div>
      </main>
    );
  }

  return (
    <ClassificationsProvider>
      <BreadcrumbsProvider>
        <main className="w-full bg-base-100">
          <Classification
            classificationRecord={record ?? undefined}
            onNavigateBack={handleNavigateBack}
          />
        </main>
      </BreadcrumbsProvider>
    </ClassificationsProvider>
  );
}
