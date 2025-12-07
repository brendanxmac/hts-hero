import { Explore } from "../../components/Explore";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="w-full h-svh grow flex flex-col bg-base-100">
      <BreadcrumbsProvider>
        <Explore />
      </BreadcrumbsProvider>
    </main>
  );
}
