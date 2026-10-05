import { CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

export const FeatureList = ({ features }: { features: string[] }) => (
  <ul className="flex flex-col gap-2.5">
    {features.map((feature) => (
      <li key={feature} className={`${ui.bodySm} flex gap-2.5`}>
        <CheckIcon className="mt-px h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span>{feature}</span>
      </li>
    ))}
  </ul>
);
