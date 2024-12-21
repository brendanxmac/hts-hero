import { InformationLabel } from "./InformationLabel";

interface Props {
  description: string;
}

export const ProductDescriptionHeader = ({ description }: Props) => {
  return (
    <div className="w-full max-w-2xl px-2 flex flex-col gap-2 rounded-md">
      <InformationLabel value="Product Description" />
      <h3 className="font-bold text-white text-xl md:text-2xl lg:text-3xl ">
        {description}
      </h3>
    </div>
  );
};
