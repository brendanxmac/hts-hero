import { DocumentTextIcon } from "@heroicons/react/16/solid";

interface Button {
  label: string;
  onClick: () => void;
}

interface Props {
  title: string;
  text?: string;
  large?: boolean;
  active: boolean;
  icon?: JSX.Element;
  button?: Button;
  showButton?: boolean;
}

export const TextNavigationStep = ({
  title,
  text,
  active,
  icon,
  button,
}: Props) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${
        active
          ? "bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/40 shadow-lg shadow-primary/10"
          : "bg-base-100 border border-base-content/10 hover:border-primary/30 hover:shadow-md"
      }`}
      onClick={() => {
        button?.onClick();
      }}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <div className="relative z-10 p-3">
        <div className="flex items-center gap-2 mb-1">
          {icon || <DocumentTextIcon className="w-3.5 h-3.5 text-primary/70" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
            {title}
          </span>
        </div>
        {text && (
          <p className="text-sm text-base-content leading-relaxed line-clamp-3">
            {text}
          </p>
        )}
        {!text && (
          <p className="text-sm text-base-content/40 italic">
            No description yet
          </p>
        )}
      </div>
    </div>
  );
};
