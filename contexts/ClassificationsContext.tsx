import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ClassificationRecord } from "../interfaces/hts";
import { fetchClassifications } from "../libs/classification";

export type RefreshClassificationsOptions = {
  showLoading?: boolean;
};

interface ClassificationsContextType {
  classifications: ClassificationRecord[];
  isLoading: boolean;
  error: Error | null;
  refreshClassifications: (
    options?: RefreshClassificationsOptions
  ) => Promise<void>;
  removeClassificationById: (id: string) => void;
}

const ClassificationsContext = createContext<
  ClassificationsContextType | undefined
>(undefined);

export function ClassificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [classifications, setClassifications] = useState<
    ClassificationRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshClassifications = async (
    options?: RefreshClassificationsOptions
  ) => {
    const showLoading = options?.showLoading !== false;
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const data = await fetchClassifications();
      setClassifications(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeClassificationById = useCallback((id: string) => {
    setClassifications((prev) => prev.filter((c) => c.id !== id));
  }, []);

  useEffect(() => {
    refreshClassifications();
  }, []);

  return (
    <ClassificationsContext.Provider
      value={{
        classifications,
        isLoading,
        error,
        refreshClassifications,
        removeClassificationById,
      }}
    >
      {children}
    </ClassificationsContext.Provider>
  );
}

export function useClassifications() {
  const context = useContext(ClassificationsContext);
  if (context === undefined) {
    throw new Error(
      "useClassifications must be used within a ClassificationsProvider"
    );
  }
  return context;
}
