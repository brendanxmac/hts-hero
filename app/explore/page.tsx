import { Explore } from "../../components/Explore";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-svh grow overflow-auto flex flex-col p-4 bg-base-100">
      <ChaptersProvider>
        <Explore />
      </ChaptersProvider>
    </main>
  );
}
