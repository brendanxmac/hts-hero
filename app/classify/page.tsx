import { Classify } from "../../components/Classify";
import { Explore } from "../../components/Explore";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-svh grow overflow-auto flex flex-col bg-base-100">
      <ChaptersProvider>
        <div className="grid grid-cols-2 md:grid-cols-12 h-full">
          <div className="col-span-2 md:col-span-6 overflow-y-scroll p-4 bg-base-100 md:border-r md:border-base-300">
            <Classify />
          </div>
          <div className="hidden md:block md:col-span-6 overflow-y-scroll p-4 bg-base-100">
            <Explore />
          </div>
        </div>
      </ChaptersProvider>
    </main>
  );
}
