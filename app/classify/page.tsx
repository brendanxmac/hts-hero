import { ClassifyController } from "../../components/ClassifyController";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-full w-full bg-base-300 overflow-hidden">
      <ChaptersProvider>
        <BreadcrumbsProvider>
          <ClassifyController />
        </BreadcrumbsProvider>
      </ChaptersProvider>
    </main>
  );
}
