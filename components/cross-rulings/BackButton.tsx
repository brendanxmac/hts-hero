import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Props {
  onClick: () => void;
}

export const BackButton = ({ onClick }: Props) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors w-fit"
  >
    <ArrowLeftIcon className="w-4 h-4" />
    Back to rulings
  </button>
);
