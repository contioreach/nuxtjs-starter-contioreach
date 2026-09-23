export default defineEventHandler((event) => {
  const { siteUrl, allowIndexing } = useRuntimeConfig().public;
  setHeader(event, "content-type", "text/plain; charset=utf-8");

  /* Belt and braces with the per-page `noindex` tags: while the site is closed
     off, crawlers are turned away at the door too. */
  if (allowIndexing !== "true") {
    return "User-agent: *\nDisallow: /\n";
  }

  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
});
