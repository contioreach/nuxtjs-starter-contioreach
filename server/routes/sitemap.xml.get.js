function url(loc, lastmod, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
}

export default defineEventHandler(async (event) => {
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const [posts, categories] = await Promise.all([getAllBlogSlugs(), getAllCategorySlugs()]);
  const now = new Date().toISOString();

  const entries = [
    url(`${siteUrl}/`, now, 1),
    url(`${siteUrl}/blog`, now, 0.9),
    ...categories.map((category) => url(`${siteUrl}/blog/category/${category.slug}`, now, 0.7)),
    ...posts.map((post) => url(`${siteUrl}/blog/${post.slug}`, now, 0.8)),
  ];

  setHeader(event, "content-type", "application/xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
});
