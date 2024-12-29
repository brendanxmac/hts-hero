import { InformationLabel } from "./InformationLabel";

interface Props {
  description: string;
}

export const ProductDescriptionHeader = ({ description }: Props) => {
  return (
    <div className="w-full max-w-4xl px-2 flex flex-col gap-2 rounded-md">
      <InformationLabel value="Product Description" />
      <h3 className="font-bold text-white text-lg md:text-xl lg:text-2xl ">
        {description}
      </h3>
    </div>
  );
};
