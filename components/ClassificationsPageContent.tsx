"use client";

import { ClassificationsProvider } from "../contexts/ClassificationsContext";
import { BreadcrumbsProvider } from "../contexts/BreadcrumbsContext";
import { Classifications } from "./Classifications";

export const ClassificationsPageContent = () => {
  return (
    <ClassificationsProvider>
      <BreadcrumbsProvider>
        <div className="w-full bg-base-100">
          <Classifications />
        </div>
      </BreadcrumbsProvider>
    </ClassificationsProvider>
  );
};
