// A heading's anchor id. The table of contents (built from the MDX source) and the rendered <h2>
// (built from its text) both use this, so their links always match.
export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// The text of a markdown heading line, without inline formatting or links
const plainText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();

// Every "## " heading in an MDX body, skipping fenced code blocks
export const extractHeadings = (body: string) => {
  const headings: { id: string; text: string }[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^## (.+)$/.exec(line);
    if (match) {
      const text = plainText(match[1]);
      headings.push({ id: headingId(text), text });
    }
  }
  return headings;
};
