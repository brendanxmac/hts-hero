import { Classify } from "../../components/Classify";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-full w-full overflow-y-auto flex flex-col bg-base-300">
      <ChaptersProvider>
        <BreadcrumbsProvider>
          <Classify />
        </BreadcrumbsProvider>
      </ChaptersProvider>
    </main>
  );
}
