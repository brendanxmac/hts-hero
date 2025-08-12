export interface BulletPoint {
  title: string;
  description?: string;
}

export enum FeatureStatus {
  COVERED = "covered",
  COMING_SOON = "coming-soon",
}

interface Props {
  feature: BulletPoint;
  type: FeatureStatus;
}

export const FeatureOverview = ({ feature, type }: Props) => {
  const { title, description } = feature;
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
          type === FeatureStatus.COVERED ? "bg-success" : "bg-warning"
        }`}
      ></div>
      <div>
        <h3 className="font-medium text-base-content">{title}</h3>
        {description && (
          <p className="text-sm text-base-content/60">{description}</p>
        )}
      </div>
    </div>
  );
};
