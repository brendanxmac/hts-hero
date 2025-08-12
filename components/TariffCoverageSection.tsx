import { Color } from "../enums/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { FeatureOverview, BulletPoint, FeatureStatus } from "./TariffCoverage";

interface Props {
  name: string;
  description: string;
  type: FeatureStatus;
  tariffs?: BulletPoint[];
  capabilities?: BulletPoint[];
}

export const TariffCoverageSection = ({
  name,
  description,
  type,
  tariffs,
  capabilities,
}: Props) => {
  return (
    <div
      className={`bg-base-100 rounded-2xl border-2 border-base-content/50 p-8`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full ${
            type === FeatureStatus.COVERED ? "bg-success" : "bg-warning"
          }`}
        ></div>
        <h2
          className={`text-2xl font-bold text-base-content ${
            type === FeatureStatus.COVERED ? "text-success" : "text-warning"
          }`}
        >
          {name}
        </h2>
      </div>
      <p className="text-base-content mb-6">{description}</p>

      {/* Sections / Content */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <PrimaryLabel value="Tariffs" />
          {tariffs && tariffs.length > 0 ? (
            <div className="gap-3 lg:gap-1 grid grid-cols-1 lg:grid-cols-2 items-start">
              {tariffs.map((tariff) => (
                <FeatureOverview
                  key={tariff.title}
                  feature={tariff}
                  type={type}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              <p className="text-base-content/70">
                Nothing currently, but feel free to{" "}
                <a href="mailto:support@htshero.com" className="text-primary">
                  request a tariff for us to add
                </a>
                .
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <PrimaryLabel value="Capabilities" />
          {capabilities && capabilities.length > 0 ? (
            <div className="gap-3 lg:gap-1 grid grid-cols-1 lg:grid-cols-2 items-start">
              {capabilities.map((capability) => (
                <FeatureOverview
                  key={capability.title}
                  feature={capability}
                  type={type}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              <p className="text-base-content/70">
                Nothing currently, but feel free to{" "}
                <a href="mailto:support@htshero.com" className="text-primary">
                  request a new capability
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
