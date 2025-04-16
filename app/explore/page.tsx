import { Explore } from "../../components/Explore";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-svh grow overflow-auto flex flex-col bg-base-300">
      <ChaptersProvider>
        <BreadcrumbsProvider>
          <Explore />
        </BreadcrumbsProvider>
      </ChaptersProvider>
    </main>
  );
}
