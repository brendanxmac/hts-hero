import { VerticalAnchor } from "../enums/style";
import { GreenGlow } from "./GreenGlow";
import SearchInput from "./SearchInput";

export const InitialSearchSection = () => {
  return (
    <section className="grow h-full items-center overflow-auto flex flex-col">
      <div className="grow z-10 w-full h-full flex flex-col gap-5 flex-1 items-center justify-center">
        <h2 className="text-white font-bold text-xl md:text-3xl">
          Enter Product Description
        </h2>
        <SearchInput />
      </div>
      <GreenGlow anchor={VerticalAnchor.BOTTOM} />
    </section>
  );
};
