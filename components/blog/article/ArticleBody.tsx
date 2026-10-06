import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "../mdx/mdxComponents";

// A post's MDX, rendered on the server at build time. Spacing between blocks lives here, so
// the markdown components stay free of margins.
export async function ArticleBody({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });
  return <div className="flex min-w-0 flex-col gap-5 [&>h2]:mt-9 [&>h3]:mt-4">{content}</div>;
}
