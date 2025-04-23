import { Classify } from "../../components/Classify";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-full w-full bg-base-300 overflow-hidden">
      <ChaptersProvider>
        <BreadcrumbsProvider>
          <Classify />
        </BreadcrumbsProvider>
      </ChaptersProvider>
    </main>
  );
}
