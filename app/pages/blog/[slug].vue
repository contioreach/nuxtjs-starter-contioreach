<script setup>
const route = useRoute();
const site = useSite();
const slug = computed(() => route.params.slug);

/* The endpoint returns the post with its body already anchored, its table of
   contents, and the related posts — one round trip for the whole page. */
const { data, error } = await useFetch(() => `/api/posts/${slug.value}`, { watch: [slug] });

if (error.value || !data.value?.post) {
  throw createError({
    statusCode: 404,
    statusMessage: "Blog post not found",
    fatal: true,
  });
}

const post = computed(() => data.value.post);

useSeo(() => ({
  title: `${post.value.title} | ContioReach`,
  description: post.value.description || post.value.excerpt,
  path: `/blog/${post.value.slug}`,
  image: post.value.coverImage || undefined,
  alt: post.value.title,
  type: "article",
  publishedTime: post.value.publishedAt,
  modifiedTime: post.value.updatedAt,
  keywords: [
    post.value.category?.toLowerCase(),
    post.value.primaryKeyword,
    ...(post.value.tags?.map((tag) => tag.name?.toLowerCase()) || []),
    "headless cms",
    "content marketing",
    "blog",
  ],
}));

/* Home > Blog > Article — the leaf uses the post's own title rather than the
   SEO title with its site suffix. */
useJsonLd(() =>
  breadcrumbSchema(
    [
      { name: "Blog", path: "/blog" },
      { name: post.value.title, path: `/blog/${post.value.slug}` },
    ],
    site.siteUrl,
  ),
);

useJsonLd(() => blogPostingSchema(post.value, site.siteUrl));
</script>

<template>
  <div>
    <BlogDetail :post="post" :related-blogs="data.related || []" />
    <CTASection />
  </div>
</template>
