import { ChangeEvent, useState } from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";

interface Props {
  placeholder: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ placeholder, onChange }: Props) => {
  const [value, setValue] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setValue("");
    onChange("");
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="input input-bordered input-md w-full focus:ring-0 focus:outline-none pr-8"
        onChange={handleChange}
      />
      {value && (
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
