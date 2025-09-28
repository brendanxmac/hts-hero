import Link from "next/link";
import { categoryType } from "../content";

// This is the category badge that appears in the article page and in <CardArticle /> component
const Category = ({
  category,
  extraStyle,
}: {
  category: categoryType;
  extraStyle?: string;
}) => {
  return (
    <Link
      href={`/blog/category/${category.slug}`}
      className={`badge badge-sm badge-primary font-bold md:badge-md hover:badge-primary ${
        extraStyle ? extraStyle : ""
      }`}
      rel="tag"
    >
      {category.titleShort}
    </Link>
  );
};

export default Category;
