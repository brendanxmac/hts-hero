import { ScaleIcon } from "@heroicons/react/24/outline";

interface Props {
  title?: string;
  description: string;
}

export const EmptyState = ({ title, description }: Props) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-base-200 border border-base-300 mb-6">
      <ScaleIcon className="w-8 h-8 text-base-content/30" />
    </div>
    {title && (
      <h2 className="text-lg font-semibold text-base-content mb-1">{title}</h2>
    )}
    <p className="text-sm text-base-content/50 max-w-xl leading-relaxed">
      {description}
    </p>
  </div>
);
