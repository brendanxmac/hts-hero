import { VerticalAnchor } from "../enums/style";
import { classNames } from "../utilities/style";

interface Props {
  anchor: VerticalAnchor;
}

export const GreenGlow = ({ anchor }: Props) => {
  return (
    <div
      className="-z-10 absolute flex justify-center items-center h-full w-full
    "
    >
      <div
        className={classNames(
          anchor === VerticalAnchor.TOP
            ? `top-0 rounded-br-full rounded-bl-full`
            : `bottom-0 rounded-tl-full rounded-tr-full`,
          "absolute h-48 w-full bg-[#40C969] blur-3xl"
        )}
      ></div>
    </div>
  );
};
