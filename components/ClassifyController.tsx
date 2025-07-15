"use client";

import { Classify } from "./Classify";
import { UserProvider } from "../contexts/UserContext";
import { useState } from "react";
import { Classifications } from "./Classifications";
import { ClassificationsProvider } from "../contexts/ClassificationsContext";
import { ClassifyPage } from "../enums/classify";

export const ClassifyController = () => {
  const [page, setPage] = useState<ClassifyPage>(ClassifyPage.CLASSIFICATIONS);

  return (
    <UserProvider>
      <ClassificationsProvider>
        <div className="h-full w-full bg-base-300">
          <div className="h-full w-full bg-base-300 overflow-hidden">
            {page === ClassifyPage.CLASSIFICATIONS ? (
              <Classifications page={page} setPage={setPage} />
            ) : (
              <Classify setPage={setPage} />
            )}
          </div>
        </div>
      </ClassificationsProvider>
    </UserProvider>
  );
};
