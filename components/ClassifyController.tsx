"use client";

import { Classify } from "./Classify";
import { UserProvider } from "../contexts/UserContext";

export const ClassifyController = () => {
  // const [page, setPage] = useState<ClassifyPage>(ClassifyPage.CLASSIFICATIONS);

  return (
    <UserProvider>
      {/* <ClassificationsProvider> */}
      <div className="h-full w-full bg-base-300">
        <div className="h-full w-full bg-base-100 col-span-1 overflow-hidden">
          <Classify />
        </div>
      </div>
      {/* </ClassificationsProvider> */}
    </UserProvider>
  );
};

// {page === ClassifyPage.CLASSIFICATIONS && (
//               <Classifications setPage={setPage} />
//             )} */}
