import { useHtsContext } from "../context/hts-context";
import SearchInput from "./SearchInput";

export const InitialSearchSection = () => {
  const { productDescription } = useHtsContext();
  return (
    <section className="h-[calc(100vh-8rem)]">
      <div className="z-10 w-full h-full flex flex-col gap-5 flex-1 items-center justify-center">
        <h2 className="text-white font-bold text-xl md:text-3xl">
          Enter Product Description
        </h2>
        <SearchInput />
      </div>
    </section>
  );
};
