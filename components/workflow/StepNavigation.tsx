import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";

interface Step {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface StepNavigationProps {
  next: Step;
  previous?: Step;
}

export const StepNavigation = ({ next, previous }: StepNavigationProps) => {
  return (
    <div className="shrink px-8 py-4 flex items-center justify-between">
      {previous ? (
        <button
          className="btn btn-link btn-sm btn-primary px-0 gap-0 no-underline text-white hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
          disabled={previous.disabled}
          onClick={previous.onClick}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          {previous.label}
        </button>
      ) : (
        <div className="w-5 h-5" />
      )}
      <button
        className="btn btn-primary btn-sm text-white gap-0"
        disabled={next.disabled}
        onClick={next.onClick}
      >
        {next.label}
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
