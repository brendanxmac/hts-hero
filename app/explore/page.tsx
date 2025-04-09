import { Explore } from "../../components/Explore";
import { ChaptersProvider } from "../../contexts/ChaptersContext";

export default function Home() {
  return (
    <main className="h-svh grow overflow-auto flex flex-col bg-base-300">
      <ChaptersProvider>
        <Explore />
      </ChaptersProvider>
    </main>
  );
}
