import { createContext, useContext, useState, useEffect } from "react";
import { ClassificationRecord } from "../interfaces/hts";
import { fetchClassifications } from "../libs/classification";

interface ClassificationsContextType {
  classifications: ClassificationRecord[];
  isLoading: boolean;
  error: Error | null;
  refreshClassifications: () => Promise<void>;
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

  const refreshClassifications = async () => {
    try {
      setIsLoading(true);
      const data = await fetchClassifications();
      setClassifications(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshClassifications();
  }, []);

  return (
    <ClassificationsContext.Provider
      value={{ classifications, isLoading, error, refreshClassifications }}
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
