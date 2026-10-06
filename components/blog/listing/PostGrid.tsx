import type { PostMeta } from "@/libs/blog/types";
import { PostCard } from "./PostCard";

export function PostGrid({ posts, showCategory = true }: { posts: PostMeta[]; showCategory?: boolean }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} showCategory={showCategory} />
      ))}
    </div>
  );
}
