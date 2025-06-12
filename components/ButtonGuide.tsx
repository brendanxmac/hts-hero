"use client";
import { PlayIcon } from "@heroicons/react/24/solid";

interface Props {
  onClick: () => void;
}

const ButtonGuide = ({ onClick }: Props) => {
  return (
    <button className="btn btn-sm" onClick={onClick} data-tooltip-id="tooltip">
      <PlayIcon className="w-5 h-5" />
      Tutorial
    </button>
  );
};

export default ButtonGuide;
