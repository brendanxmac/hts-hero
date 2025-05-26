import { ChangeEvent, useState } from "react";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";

interface Props {
  placeholder: string;
  onSearch: (value: string) => void;
}

export const SearchBar = ({ placeholder, onSearch }: Props) => {
  const [value, setValue] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
  };

  const handleClear = () => {
    setValue("");
    setHasSearched(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="input input-bordered input-md h-10 w-full focus:ring-0 focus:outline-none pr-8"
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch(value);
            setHasSearched(true);
          }
        }}
      />
      {value && !hasSearched && (
        <button
          onClick={() => {
            onSearch(value);
            setHasSearched(true);
          }}
          disabled={!value}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 ${
            !value
              ? "opacity-50"
              : "hover:bg-primary text-gray-600 hover:text-white transition-colors"
          }`}
        >
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      )}
      {value && hasSearched && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-primary text-gray-600 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
