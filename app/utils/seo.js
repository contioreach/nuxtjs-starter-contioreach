/* The one place a page's head is assembled: canonical, robots, Open Graph,
   Twitter card and keywords, from the same arguments on every route.

   `input` may be a plain object or a getter returning one. Article and archive
   pages pass a getter, because Vue Router reuses the same component when you
   navigate from one post to the next — a snapshot taken at setup would leave
   the previous article's canonical and title in the head. */
export function useSeo(input) {
  const site = useSite();
  const options = computed(() => toValue(input) || {});

  const url = computed(() => `${site.siteUrl}${options.value.path || "/"}`);
  const ogImage = computed(() => options.value.image || `${site.siteUrl}/og-default.png`);
  /* Site-wide noindex while NUXT_PUBLIC_ALLOW_INDEXING is off; individual
     pages (a missing post, say) can still opt out on their own. */
  const blocked = computed(() => options.value.noIndex || site.noIndex);
  const keywords = computed(() => (options.value.keywords || []).filter(Boolean).join(", "));

  useHead({
    link: computed(() => [{ rel: "canonical", href: url.value }]),
    meta: computed(() => (keywords.value ? [{ name: "keywords", content: keywords.value }] : [])),
  });

  useSeoMeta({
    title: () => options.value.title,
    description: () => options.value.description,
    robots: () => (blocked.value ? "noindex, nofollow" : "index, follow"),
    ogTitle: () => options.value.title,
    ogDescription: () => options.value.description,
    ogUrl: () => url.value,
    ogType: () => options.value.type || "website",
    ogSiteName: "ContioReach",
    ogImage: () => ogImage.value,
    ogImageAlt: () => options.value.alt || options.value.title,
    articlePublishedTime: () => options.value.publishedTime || null,
    articleModifiedTime: () => options.value.modifiedTime || null,
    twitterCard: "summary_large_image",
    twitterTitle: () => options.value.title,
    twitterDescription: () => options.value.description,
    twitterImage: () => ogImage.value,
  });
}

/* Structured data we generate ourselves, so the JSON is safe to inline.
   Accepts an object or a getter, for the same reason as useSeo. */
export function useJsonLd(data) {
  useHead({
    script: computed(() => {
      const value = toValue(data);
      return value ? [{ type: "application/ld+json", innerHTML: JSON.stringify(value) }] : [];
    }),
  });
}
