"use client";
import { NumberedListIcon } from "@heroicons/react/24/solid";

interface Props {
  onClick: () => void;
}

const ButtonGuide = ({ onClick }: Props) => {
  return (
    <button className="btn btn-sm" onClick={onClick} data-tooltip-id="tooltip">
      <NumberedListIcon className="w-5 h-5" />
      Guide
    </button>
  );
};

export default ButtonGuide;
