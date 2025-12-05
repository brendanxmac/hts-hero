import { TariffFinderPage } from "../../components/TariffFinderPage";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <BreadcrumbsProvider>
      <TariffFinderPage />
    </BreadcrumbsProvider>
  );
}
