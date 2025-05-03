"use client";

import { useState } from "react";
import { Classifications } from "./Classifications";
import { Classify } from "./Classify";
import { ClassifyPage } from "../enums/classify";

export const ClassifyController = () => {
  const [page, setPage] = useState<ClassifyPage>(ClassifyPage.CLASSIFICATIONS);

  return (
    <div className="h-full w-full bg-base-300">
      <div className="h-full w-full bg-base-100 col-span-1 overflow-hidden">
        {page === ClassifyPage.CLASSIFICATIONS && (
          <Classifications setPage={setPage} />
        )}
        {page === ClassifyPage.CLASSIFY && <Classify setPage={setPage} />}
      </div>
    </div>
  );
};
