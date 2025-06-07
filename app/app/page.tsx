import { ClassifyController } from "../../components/ClassifyController";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";

export default function Home() {
  return (
    <main className="h-full w-full bg-base-300 overflow-hidden">
      <BreadcrumbsProvider>
        <ClassifyController />
      </BreadcrumbsProvider>
    </main>
  );
}
