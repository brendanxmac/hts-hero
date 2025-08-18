"use client";

import { Classify } from "./Classify";
import { UserProvider } from "../contexts/UserContext";
import { useState, useEffect } from "react";
import { Classifications } from "./Classifications";
import { ClassificationsProvider } from "../contexts/ClassificationsContext";
import { ClassifyPage } from "../enums/classify";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";

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
        <div className="h-full w-full bg-base-300">
          <div className="h-full w-full bg-base-300 overflow-hidden">
            {page === ClassifyPage.CLASSIFICATIONS ? (
              <div className="h-full w-full overflow-y-scroll">
                <Classifications page={page} setPage={setPage} />
              </div>
            ) : (
              <Classify key={`classify-${page}`} setPage={setPage} />
            )}
          </div>
        </div>
      </ClassificationsProvider>
    </UserProvider>
  );
};
