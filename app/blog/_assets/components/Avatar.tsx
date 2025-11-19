import Link from "next/link";
import Image from "next/image";
import { ArticleI } from "../content";

// This is the author avatar that appears in the article page and in <CardArticle /> component
const Avatar = ({
  article,
  isLink = true,
}: {
  article: ArticleI;
  isLink?: boolean;
}) => {
  const content = (
    <>
      <span itemProp="author">
        <Image
          src={article.author.avatar}
          // alt={`Avatar of ${article.author.name}`}
          alt=""
          className="w-7 h-7 rounded-full object-cover object-center"
          width={28}
          height={28}
        />
      </span>
      <span className={isLink ? "group-hover:underline" : ""}>
        {article.author.name}
      </span>
    </>
  );

  if (!isLink) {
    return <span className="inline-flex items-center gap-2">{content}</span>;
  }

  return (
    <Link
      href={`/blog/author/${article.author.slug}`}
      className="inline-flex items-center gap-2 group"
      rel="author"
    >
      {content}
    </Link>
  );
};

export default Avatar;
