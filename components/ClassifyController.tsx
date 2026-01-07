"use client";

import { UserProvider } from "../contexts/UserContext";
import { useState, useEffect } from "react";
import { Classifications } from "./Classifications";
import { ClassificationsProvider } from "../contexts/ClassificationsContext";
import { ClassifyPage } from "../enums/classify";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { Classification } from "./Classification";

export const ClassifyController = () => {
  const [page, setPage] = useState<ClassifyPage>(ClassifyPage.CLASSIFICATIONS);
  const { resetBreadcrumbs } = useBreadcrumbs();

  // Reset contexts when switching from Classify to Classifications
  useEffect(() => {
    if (page === ClassifyPage.CLASSIFICATIONS) {
      // Completely reset breadcrumbs to clear all Explore component state
      resetBreadcrumbs();
      // Reset to the Classify tab so user starts fresh when going back
      // setActiveTab(ClassifyTab.CLASSIFY);
    }
  }, [page]);

  return (
    <UserProvider>
      <ClassificationsProvider>
        <div className="w-full bg-base-100">
          {page === ClassifyPage.CLASSIFICATIONS ? (
            <Classifications page={page} setPage={setPage} />
          ) : (
            <Classification key={`classify-${page}`} setPage={setPage} />
          )}
        </div>
      </ClassificationsProvider>
    </UserProvider>
  );
};
