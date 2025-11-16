import { Color } from "../enums/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { TertiaryText } from "./TertiaryText";

export interface EmptyResultsConfig {
  iconPath: string;
  title: string;
  descriptions: string[];
  buttonText: string;
  buttonClassName?: string;
  onButtonClick: () => void | Promise<void>;
  buttonIcon?: React.ReactNode;
  maxWidth?: string;
}

interface Props {
  config: EmptyResultsConfig;
}

export const EmptyResults = ({ config }: Props) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3">
    <div className="w-24 h-24 text-neutral-content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={config.iconPath}
        />
      </svg>
    </div>
    <div className="flex flex-col gap-4 items-center">
      <div
        className={`text-center flex flex-col gap-1 items-center ${config.maxWidth || ""}`}
      >
        <PrimaryLabel value={config.title} color={Color.WHITE} />
        {config.descriptions.map((desc, index) => (
          <TertiaryText
            key={index}
            value={desc}
            color={Color.NEUTRAL_CONTENT}
          />
        ))}
      </div>
      <button
        className={config.buttonClassName || "btn btn-primary w-fit"}
        onClick={config.onButtonClick}
      >
        {config.buttonIcon}
        {config.buttonText}
      </button>
    </div>
  </div>
);
