import { SectionLabel } from "./SectionLabel";

interface Props {
  description: string;
}

export const ProductDescriptionHeader = ({ description }: Props) => {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-2 rounded-md">
      <SectionLabel value="Product Description" />
      <h3 className="font-bold text-white text-2xl lg:text-3xl ">
        {description}
      </h3>
    </div>
  );
};
