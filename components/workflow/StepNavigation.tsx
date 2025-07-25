import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";

interface Step {
  label: string;
  fill?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

interface StepNavigationProps {
  next?: Step;
  previous?: Step;
}

export const StepNavigation = ({ next, previous }: StepNavigationProps) => {
  return (
    <div className="max-w-3xl mx-auto py-4 flex items-center justify-between">
      {previous ? (
        <button
          className={
            previous && previous.fill
              ? "btn btn-primary btn-sm text-white gap-0"
              : "btn btn-link btn-sm btn-primary gap-0 no-underline text-white hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
          }
          disabled={!previous || previous.disabled}
          onClick={previous?.onClick}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          {previous?.label || "Back"}
        </button>
      ) : (
        <div></div>
      )}

      {next ? (
        <button
          className={
            next && next.fill
              ? "btn btn-primary btn-sm text-white gap-0"
              : "btn btn-link btn-sm btn-primary gap-0 no-underline text-white hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
          }
          disabled={!next || next.disabled}
          onClick={next?.onClick}
        >
          {next?.label || "Next"}
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      ) : (
        <div></div>
      )}
    </div>
  );
};
