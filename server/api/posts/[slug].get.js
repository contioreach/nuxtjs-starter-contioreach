import { prepareContent } from "~~/shared/content";

async function getRelated(categorySlug, currentId) {
  if (!categorySlug) return [];
  try {
    // Fetch 4 so the current post can be dropped and 3 still remain.
    const response = await getBlogsByCategory(categorySlug, { page: 1, limit: 4, minimal: "true" });
    if (!response.success) return [];
    return transformBlogsForDisplay(response.data)
      .filter((blog) => blog.id !== currentId)
      .slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch related blogs:", error);
    return [];
  }
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  let post = null;
  try {
    const response = await getBlogBySlug(slug);
    // The API returns a list even when queried by slug.
    const blog = Array.isArray(response.data) ? response.data[0] : response.data;
    if (response.success && blog) post = transformBlogForDisplay(blog);
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }

  if (!post) {
    throw createError({ statusCode: 404, statusMessage: "Blog post not found" });
  }

  /* The body is prepared here rather than in the component: one pass on the
     server produces both the anchored HTML and the TOC, and the client gets
     them ready to render. */
  const { html, toc } = prepareContent(post.content);
  const related = await getRelated(post.categorySlug, post.id);

  // The raw body is dropped — the prepared html replaces it, and shipping both
  // would double the payload for no gain.
  const { content, ...rest } = post;
  return { post: { ...rest, html, toc }, related };
});
