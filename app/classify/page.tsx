import { Classify } from "../../components/Classify";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-screen w-full overflow-auto flex flex-col bg-base-100">
      <ChaptersProvider>
        <BreadcrumbsProvider>
          <Classify />
        </BreadcrumbsProvider>
      </ChaptersProvider>
    </main>
  );
}
