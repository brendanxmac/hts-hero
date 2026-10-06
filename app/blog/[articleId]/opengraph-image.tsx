import { categoryBySlug } from "@/libs/blog/catalog";
import { getPost, getPosts } from "@/libs/blog/posts";
import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero blog post";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ articleId: post.slug }));
}

export default function Image({ params }: { params: { articleId: string } }) {
  const post = getPost(params.articleId);
  return socialImage({
    kicker: (post && categoryBySlug(post.category)?.title) ?? "HTS Hero Blog",
    title: post?.title ?? "HTS Hero Blog",
    footer: "htshero.com/blog",
  });
}
