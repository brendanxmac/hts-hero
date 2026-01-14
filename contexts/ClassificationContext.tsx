"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { ClassificationI, ClassificationProgression } from "../interfaces/hts";
import { HtsElement } from "../interfaces/hts";
import {
  createClassification,
  updateClassification,
} from "../libs/classification";
import { NoteRecord } from "../types/hts";

export type ClassificationTier = "premium" | "standard";

interface ClassificationContextType {
  classification?: ClassificationI;
  classificationId?: string;
  classificationTier: ClassificationTier;
  isCreatingClassification: boolean;
  isSaving: boolean;
  // Notes cache for the current classification
  notes: NoteRecord[];
  setClassificationId: (id: string | null) => void;
  setClassification: (
    classification:
      | ClassificationI
      | ((prev: ClassificationI) => ClassificationI)
  ) => void;
  setClassificationTier: (tier: ClassificationTier) => void;
  // Helper functions
  setArticleDescription: (description: string) => void;
  setProgressionDescription: (description: string) => void;
  setArticleAnalysis: (analysis: string) => void;
  addLevel: (
    candidates: HtsElement[],
    selection?: HtsElement,
    reasoning?: string,
    questions?: string[]
  ) => void;
  updateLevel: (
    index: number,
    updates: Partial<ClassificationProgression>
  ) => void;
  clearClassification: (keepArticleDescription?: boolean) => void;
  resetClassificationState: () => void;
  startNewClassification: (
    articleDescription: string,
    includeFirstLevel?: boolean
  ) => Promise<void>;
  saveClassification: () => Promise<void>;
  // Flush any pending debounce and save immediately - use before navigation
  flushAndSave: () => Promise<void>;
  // Notes helper functions
  addNotes: (newNotes: NoteRecord[]) => void;
  getNotesForSectionsAndChapters: (
    sections: number[],
    chapters: number[]
  ) => {
    existingNotes: NoteRecord[];
    missingSections: number[];
    missingChapters: number[];
  };
}

const ClassificationContext = createContext<
  ClassificationContextType | undefined
>(undefined);

export const ClassificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [classificationId, setClassificationId] = useState<string | null>(null);
  const [classification, setClassification] = useState<ClassificationI>(null);
  const [classificationTier, setClassificationTier] =
    useState<ClassificationTier>("standard");
  const [isCreatingClassification, setIsCreatingClassification] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const lastClassificationIdRef = useRef<string | null>(null);
  const pendingClassificationRef = useRef<Promise<void> | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Refs to always have access to current values (avoids stale closures)
  const classificationRef = useRef<ClassificationI>(null);
  const classificationIdRef = useRef<string | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    classificationRef.current = classification;
  }, [classification]);

  useEffect(() => {
    classificationIdRef.current = classificationId;
  }, [classificationId]);

  // Debounced auto-save effect with saving state tracking
  useEffect(() => {
    if (!classification || !classificationId) {
      return;
    }

    // If the classificationId has changed, update the ref and skip save
    if (lastClassificationIdRef.current !== classificationId) {
      lastClassificationIdRef.current = classificationId;
      return;
    }

    // Clear any existing debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set saving state immediately when changes are detected
    isSavingRef.current = true;
    setIsSaving(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      // Use refs to get current values, avoiding stale closures
      const currentClassification = classificationRef.current;
      const currentClassificationId = classificationIdRef.current;

      if (currentClassificationId && currentClassification) {
        try {
          await updateClassification(
            currentClassificationId,
            currentClassification
          );
        } finally {
          isSavingRef.current = false;
          setIsSaving(false);
          debounceTimeoutRef.current = null;
        }
      } else {
        isSavingRef.current = false;
        setIsSaving(false);
        debounceTimeoutRef.current = null;
      }
    }, 200);

    return () => {
      // Cleanup only clears the timer, doesn't reset saving state
      // The saving state will be reset when the save completes or state is reset
    };
  }, [classification, classificationId]);

  const setArticleDescription = (description: string) => {
    setClassification((prev) => ({
      ...prev,
      articleDescription: description,
    }));
  };

  const setProgressionDescription = (description: string) => {
    setClassification((prev) => ({
      ...prev,
      progressionDescription: description,
    }));
  };

  const setArticleAnalysis = (analysis: string) => {
    setClassification((prev) => ({
      ...prev,
      articleAnalysis: analysis,
    }));
  };

  const addLevel = (
    candidates: HtsElement[],
    selection?: HtsElement,
    reasoning?: string,
    questions?: string[]
  ) => {
    setClassification((prev) => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          candidates,
          selection,
          reasoning,
          questions,
        },
      ],
    }));
  };

  const updateLevel = (
    index: number,
    updates: Partial<ClassificationProgression>
  ) => {
    setClassification((prev) => {
      // This code safely updates a specific progression level in the classification state
      // 1. First spread creates a new array copy to avoid mutating the original state
      const newProgressionLevels = [...prev.levels];

      // 2. For the progression level we want to update:
      // - First spread copies all existing properties from the original level
      // - Second spread overlays any new/updated properties on top
      // This ensures we keep all original properties while updating only what changed
      newProgressionLevels[index] = {
        ...newProgressionLevels[index], // Keep existing properties
        ...updates, // Override with any new values
      };

      // 3. Create new state object with updated progression levels
      return {
        ...prev,
        levels: newProgressionLevels,
      };
    });
  };

  const clearClassification = () => {
    setClassification({
      articleDescription: "",
      articleAnalysis: "",
      progressionDescription: "",
      levels: [],
      isComplete: false,
      notes: "",
    });
    setNotes([]);
  };

  // Add new notes to the cache, avoiding duplicates
  const addNotes = (newNotes: NoteRecord[]) => {
    setNotes((prevNotes) => {
      const existingIds = new Set(prevNotes.map((n) => n.id));
      const uniqueNewNotes = newNotes.filter((n) => !existingIds.has(n.id));
      return [...prevNotes, ...uniqueNewNotes];
    });
  };

  // Check which notes we already have and which are missing
  const getNotesForSectionsAndChapters = (
    sections: number[],
    chapters: number[]
  ): {
    existingNotes: NoteRecord[];
    missingSections: number[];
    missingChapters: number[];
  } => {
    const existingNotes: NoteRecord[] = [];
    const missingSections: number[] = [];
    const missingChapters: number[] = [];

    // Check for each section
    for (const section of sections) {
      const sectionNote = notes.find(
        (n) => n.type === "section" && n.number === section
      );
      if (sectionNote) {
        existingNotes.push(sectionNote);
      } else {
        missingSections.push(section);
      }
    }

    // Check for each chapter
    for (const chapter of chapters) {
      const chapterNote = notes.find(
        (n) => n.type === "chapter" && n.number === chapter
      );
      if (chapterNote) {
        existingNotes.push(chapterNote);
      } else {
        missingChapters.push(chapter);
      }
    }

    return { existingNotes, missingSections, missingChapters };
  };

  const saveClassification = async () => {
    // Use refs to get current values, avoiding stale closures
    const currentClassification = classificationRef.current;
    const currentClassificationId = classificationIdRef.current;

    if (!currentClassificationId) {
      throw new Error("Classification ID is not set");
    }

    if (currentClassification) {
      await updateClassification(
        currentClassificationId,
        currentClassification
      );
    }
  };

  // Flush any pending debounce and save immediately
  // Call this before navigation to ensure all changes are saved
  const flushAndSave = async () => {
    // Clear any pending debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    const currentClassification = classificationRef.current;
    const currentClassificationId = classificationIdRef.current;

    // Only save if we have both ID and classification data
    if (currentClassificationId && currentClassification) {
      setIsSaving(true);
      isSavingRef.current = true;
      try {
        await updateClassification(
          currentClassificationId,
          currentClassification
        );
      } finally {
        setIsSaving(false);
        isSavingRef.current = false;
      }
    }
  };

  // This creates a record in the DB and sets up the context record for local changes
  // includeFirstLevel: if true, adds an empty first level to trigger candidate fetching
  const startNewClassification = async (
    articleDescription: string,
    includeFirstLevel: boolean = false
  ) => {
    const newClassification: ClassificationI = {
      articleDescription,
      articleAnalysis: "",
      progressionDescription: "",
      preliminaryLevels: [],
      levels: includeFirstLevel ? [{ candidates: [] }] : [],
      isComplete: false,
      notes: "",
    };

    // Set the classification state immediately so UI can transition
    setClassification(newClassification);
    setIsCreatingClassification(true);

    // Create the DB record and track the promise
    const createPromise = (async () => {
      try {
        const classificationRecord =
          await createClassification(newClassification);
        setClassificationId(classificationRecord.id);
      } finally {
        setIsCreatingClassification(false);
        pendingClassificationRef.current = null;
      }
    })();

    pendingClassificationRef.current = createPromise;
    await createPromise;
  };

  // Reset classification state without saving (auto-save handles saves)
  const resetClassificationState = () => {
    // Clear any pending debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setClassification(null);
    setClassificationId(null);
    setNotes([]);
    isSavingRef.current = false;
    setIsSaving(false);
    lastClassificationIdRef.current = null;
    classificationRef.current = null;
    classificationIdRef.current = null;
  };

  return (
    <ClassificationContext.Provider
      value={{
        classification,
        classificationId,
        classificationTier,
        isCreatingClassification,
        isSaving,
        notes,
        setClassificationId,
        setClassification,
        setClassificationTier,
        setArticleDescription,
        setProgressionDescription,
        setArticleAnalysis,
        addLevel,
        updateLevel,
        clearClassification,
        resetClassificationState,
        startNewClassification,
        saveClassification,
        flushAndSave,
        addNotes,
        getNotesForSectionsAndChapters,
      }}
    >
      {children}
    </ClassificationContext.Provider>
  );
};

export const useClassification = () => {
  const context = useContext(ClassificationContext);
  if (context === undefined) {
    throw new Error(
      "useClassification must be used within a ClassificationProvider"
    );
  }
  return context;
};
