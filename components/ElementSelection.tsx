import { HtsElement } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { TertiaryInformation } from "./TertiaryInformation";
import { Loader } from "../interfaces/ui";
import { Element } from "./Element";
interface Props {
  loading: Loader;
  elements: HtsElement[];
}

export const ElementSelection = ({ loading, elements }: Props) => {
  const { isLoading, text } = loading;
  return (
    <div className="w-full flex flex-col gap-2">
      <TertiaryInformation label="Elements" value="" />
      <div className="flex flex-col gap-2 bg-base-300 rounded-md p-4">
        {isLoading && <LoadingIndicator text={text} />}
        {elements.map((element) => (
          <Element
            key={element.uuid}
            element={element}
            breadcrumbs={[]}
            setBreadcrumbs={() => {}}
            summaryOnly={true}
          />
        ))}
      </div>
    </div>
  );
};
