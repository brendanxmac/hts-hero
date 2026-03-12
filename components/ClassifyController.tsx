"use client";

import { UserProvider, useUser } from "../contexts/UserContext";
import { useState, useEffect, useRef } from "react";
import { Classifications } from "./Classifications";
import {
  ClassificationsProvider,
  useClassifications,
} from "../contexts/ClassificationsContext";
import { ClassifyPage } from "../enums/classify";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { Classification } from "./Classification";
import { linkAnonymousClassifications } from "../libs/link-anonymous-classifications";
import { getAnonymousToken } from "../libs/anonymous-token";

const ClassifyControllerInner = () => {
  const [page, setPage] = useState<ClassifyPage>(ClassifyPage.CLASSIFICATIONS);
  const { resetBreadcrumbs } = useBreadcrumbs();
  const { user } = useUser();
  const { refreshClassifications } = useClassifications();
  const hasLinkedRef = useRef(false);

  // Reset contexts when switching from Classify to Classifications
  useEffect(() => {
    if (page === ClassifyPage.CLASSIFICATIONS) {
      resetBreadcrumbs();
    }
  }, [page]);

  // Link anonymous classifications when a user signs in
  useEffect(() => {
    if (user && !hasLinkedRef.current && getAnonymousToken()) {
      hasLinkedRef.current = true;
      linkAnonymousClassifications().then((count) => {
        if (count > 0) {
          refreshClassifications();
        }
      });
    }
  }, [user]);

  return (
    <div className="w-full bg-base-100">
      {page === ClassifyPage.CLASSIFICATIONS ? (
        <Classifications page={page} setPage={setPage} />
      ) : (
        <Classification key={`classify-${page}`} setPage={setPage} />
      )}
    </div>
  );
};

export const ClassifyController = () => {
  return (
    <UserProvider>
      <ClassificationsProvider>
        <ClassifyControllerInner />
      </ClassificationsProvider>
    </UserProvider>
  );
};
