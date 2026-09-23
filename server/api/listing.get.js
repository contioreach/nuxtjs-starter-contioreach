import { POSTS_PER_PAGE } from "~~/shared/constants";

/* One endpoint behind every listing surface: the home page, /blog and the
   category archives. The pages call it through useAsyncData, so the same code
   path serves the server render and a client-side navigation — and the CMS key
   never leaves the server either way. */
export default defineEventHandler(async (event) => {
  const { page, limit, category } = getQuery(event);

  return loadListing({
    page: Math.max(1, Number.parseInt(page, 10) || 1),
    limit: Math.min(50, Number.parseInt(limit, 10) || POSTS_PER_PAGE),
    category: category || undefined,
  });
});
