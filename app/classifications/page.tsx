import { ClassifyController } from "../../components/ClassifyController";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";

export default function Home() {
  return (
    <main className="w-full bg-base-300">
      <BreadcrumbsProvider>
        <ClassifyController />
      </BreadcrumbsProvider>
    </main>
  );
}
