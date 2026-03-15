"use client";

import {
  ScaleIcon,
  ShieldCheckIcon,
  PaperClipIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  scale: ScaleIcon,
  shield: ShieldCheckIcon,
  paperclip: PaperClipIcon,
  document: DocumentTextIcon,
};

interface Props {
  title: string;
  description: string;
  icon: keyof typeof ICONS;
}

export const PlaceholderTab = ({ title, description, icon }: Props) => {
  const Icon = ICONS[icon] || DocumentTextIcon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-base-200 border border-base-300 mb-6">
        <Icon className="w-8 h-8 text-base-content/30" />
      </div>
      <h2 className="text-xl font-bold text-base-content mb-2">{title}</h2>
      <p className="text-sm text-base-content/50 text-center max-w-md leading-relaxed">
        {description}
      </p>
      <div className="mt-6 px-4 py-2 rounded-full bg-base-200 border border-base-300 text-xs font-semibold text-base-content/40 uppercase tracking-wider">
        Coming Soon
      </div>
    </div>
  );
};
