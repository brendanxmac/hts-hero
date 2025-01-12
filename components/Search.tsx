import { Dispatch, SetStateAction } from "react";
import SearchInput from "./SearchInput";

interface Props {
  setProductDescription: Dispatch<SetStateAction<string>>;
}

export const Search = ({ setProductDescription }: Props) => {
  return (
    <section className="grow h-full items-center overflow-auto flex flex-col">
      <div className="grow z-10 w-full h-full flex flex-col gap-5 flex-1 items-center justify-center">
        <h2 className="text-white font-bold text-xl md:text-3xl">
          Enter Product Description
        </h2>
        <SearchInput
          placeholder="e.g. 10 Inch Frying Pan with Bamboo Handle"
          setProductDescription={setProductDescription}
        />
      </div>
    </section>
  );
};
