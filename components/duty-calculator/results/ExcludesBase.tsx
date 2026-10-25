// Next to a duty total whose base rate can't be calculated ("The rate applicable to each garment
// in the ensemble…", "3 percent of the fair retail value"): the total leaves the base duty out
export const EXCLUDES_BASE_HELP =
  "Part of the base rate can't be calculated, so this total leaves it out. Open the code in the calculator to see why.";

export const ExcludesBase = ({ className = "" }: { className?: string }) => (
  <span className={`text-xs font-medium text-warning ${className}`} title={EXCLUDES_BASE_HELP}>
    Excludes base duty
  </span>
);
