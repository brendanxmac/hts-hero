import { HorizontalAlignment, VerticalAnchor } from "../enums/style";

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

export const getTextAlignmentStyle = (alignment: HorizontalAlignment) => {
  switch (alignment) {
    case HorizontalAlignment.LEFT:
      return "items-start";
    case HorizontalAlignment.RIGHT:
      return "items-end";
    case HorizontalAlignment.CENTER:
      return "items-center";
    default:
      return "";
  }
};

export const getVerticalAnchorStyle = (alignment: VerticalAnchor) => {
  switch (alignment) {
    case VerticalAnchor.TOP:
      return "top-0";
    case VerticalAnchor.BOTTOM:
      return "bottom-0";
    default:
      return "";
  }
};
