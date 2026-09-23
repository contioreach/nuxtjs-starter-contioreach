import { API_ENDPOINTS, CACHE_CONFIG, EMPTY_META } from "~~/shared/constants";

/* Every read goes through here. Nitro's $fetch is uncached by default, so
   caching is explicit: each exported reader is wrapped in defineCachedFunction
   with a `group` that doubles as a cache tag, which is what the publish webhook
   (server/api/revalidate/all.post.js) drops. */
async function apiRequest(endpoint) {
  const { baseUrl } = cmsConfig();

  const data = await $fetch(`${baseUrl}${endpoint}`, {
    headers: apiHeaders(),
    // Surface the CMS's own status instead of a generic 500.
    onResponseError({ response }) {
      throw createError({
        statusCode: response.status,
        statusMessage: `CMS request failed: ${response.status} ${response.statusText}`,
      });
    },
  });

  if (!data?.success) {
    throw createError({
      statusCode: 502,
      statusMessage: data?.error?.message || "CMS request failed",
    });
  }

  return data;
}

function query(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/* One wrapper so every reader gets the same one-hour window and the same
   stale-while-revalidate behaviour: once the window lapses the stale value is
   served and the refresh happens behind it, so no visitor waits on the CMS. */
function cachedReader(group, name, fn) {
  return defineCachedFunction(fn, {
    group,
    name,
    maxAge: CACHE_CONFIG.REVALIDATE_TIME,
    swr: true,
    getKey: (params = {}) => JSON.stringify(params) || "default",
  });
}

export const getBlogs = cachedReader(CACHE_CONFIG.TAGS.BLOGS, "list", (params = {}) =>
  apiRequest(
    API_ENDPOINTS.BLOGS +
      query({
        page: params.page,
        limit: params.limit,
        category: params.category,
        author: params.author,
        tags: params.tags,
        search: params.search,
        minimal: params.minimal,
      }),
  ),
);

// minimal=false so the detail page gets the full HTML body.
export const getBlogBySlug = cachedReader(CACHE_CONFIG.TAGS.BLOGS, "by-slug", (slug) =>
  apiRequest(API_ENDPOINTS.BLOGS + query({ slug, minimal: "false" })),
);

export const getCategories = cachedReader(CACHE_CONFIG.TAGS.CATEGORIES, "list", (params = {}) =>
  apiRequest(
    API_ENDPOINTS.CATEGORIES +
      query({ page: params.page, limit: params.limit, id: params.id, slug: params.slug }),
  ),
);

export const getAuthors = cachedReader(CACHE_CONFIG.TAGS.AUTHORS, "list", (params = {}) =>
  apiRequest(
    API_ENDPOINTS.AUTHORS +
      query({ page: params.page, limit: params.limit, id: params.id, slug: params.slug }),
  ),
);

export const getTags = cachedReader(CACHE_CONFIG.TAGS.TAGS, "list", (params = {}) =>
  apiRequest(
    API_ENDPOINTS.TAGS +
      query({ page: params.page, limit: params.limit, id: params.id, slug: params.slug }),
  ),
);

export function getBlogsByCategory(categorySlug, params = {}) {
  return getBlogs({ ...params, category: categorySlug });
}

/* ---- transforms ----
   Components never see the API's shape. Swapping in Contentful, Sanity or
   Strapi is these two functions plus apiRequest above. */

export function transformBlogForDisplay(blog) {
  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    description: blog.description,
    coverImage: blog.coverImage,
    content: blog.content,
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    primaryKeyword: blog.primaryKeyword,
    readingTime: blog.readingTime ? `${blog.readingTime} min read` : null,
    author: blog.authors?.[0] || null,
    authors: blog.authors || [],
    tags: blog.tags || [],
    categories: blog.categories || [],
    category: blog.categories?.[0]?.name || "Uncategorized",
    categorySlug: blog.categories?.[0]?.slug || null,
  };
}

export function transformBlogsForDisplay(blogs) {
  return (blogs || []).map(transformBlogForDisplay);
}

/* ---- helpers for the sitemap ---- */

export async function getAllBlogSlugs() {
  try {
    const response = await getBlogs({ minimal: "true", limit: 1000 });
    return response.data.map((blog) => ({ slug: blog.slug }));
  } catch (error) {
    console.error("Error fetching blog slugs:", error);
    return [];
  }
}

export async function getAllCategorySlugs() {
  try {
    const response = await getCategories({ limit: 100 });
    return response.data.map((category) => ({ slug: category.slug }));
  } catch (error) {
    console.error("Error fetching category slugs:", error);
    return [];
  }
}

/* Fetch a page of posts plus the category list in one call site, with the
   error handling every listing page needs. A CMS outage renders an empty
   state; it never takes the page down. */
export async function loadListing({ page = 1, limit = 12, category } = {}) {
  const [postsResult, categoriesResult] = await Promise.allSettled([
    category
      ? getBlogsByCategory(category, { page, limit, minimal: "true" })
      : getBlogs({ page, limit, minimal: "true" }),
    getCategories({ limit: 100 }),
  ]);

  let posts = [];
  let meta = { ...EMPTY_META, page, limit };

  if (postsResult.status === "fulfilled" && postsResult.value.success) {
    posts = transformBlogsForDisplay(postsResult.value.data);
    meta = postsResult.value.meta || meta;
  } else if (postsResult.status === "rejected") {
    console.error("API Error:", postsResult.reason);
  }

  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value.data || [] : [];

  return { posts, meta, categories };
}
