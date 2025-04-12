import { Classify } from "../../components/Classify";
import { Explore } from "../../components/Explore";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-svh grow overflow-auto flex flex-col bg-base-100">
      <ChaptersProvider>
        <BreadcrumbsProvider>
          <div className="grid grid-cols-2 md:grid-cols-12 h-full">
            <div className="overflow-auto col-span-2 md:col-span-6 p-4 bg-base-100 md:border-r md:border-base-300">
              <Classify />
            </div>
            <div className="overflow-auto hidden md:block md:col-span-6 p-4 bg-base-100">
              <Explore />
            </div>
          </div>
        </BreadcrumbsProvider>
      </ChaptersProvider>
    </main>
  );
}
