<script setup>
import { POSTS_PER_PAGE } from "~~/shared/constants";

const route = useRoute();
const site = useSite();
const slug = computed(() => route.params.slug);
const currentPage = computed(() => Math.max(1, Number.parseInt(route.query.page, 10) || 1));

const { data: category, error } = await useFetch(() => `/api/categories/${slug.value}`, {
  watch: [slug],
});

if (error.value || !category.value) {
  throw createError({ statusCode: 404, statusMessage: "Category not found", fatal: true });
}

const { data } = await useFetch("/api/listing", {
  query: { page: currentPage, limit: POSTS_PER_PAGE, category: slug },
  watch: [currentPage, slug],
  default: () => ({ posts: [], meta: {}, categories: [] }),
});

const name = computed(() => category.value.name);
const description = computed(
  () =>
    category.value.description ||
    `Expert insights, strategies, and guides on ${name.value.toLowerCase()}. Browse every ${name.value.toLowerCase()} article on the ContioReach blog.`,
);

useSeo(() => ({
  title: `${name.value} Articles | ContioReach Blog`,
  description: description.value,
  path: `/blog/category/${slug.value}`,
  alt: `${name.value} articles on the ContioReach blog`,
  keywords: [name.value.toLowerCase(), slug.value, "headless cms", "content marketing", "blog"],
}));

// Built from the loaded category so the crumb uses its display name.
useJsonLd(() =>
  breadcrumbSchema(
    [
      { name: "Blog", path: "/blog" },
      { name: name.value, path: `/blog/category/${slug.value}` },
    ],
    site.siteUrl,
  ),
);
</script>

<template>
  <div>
    <BlogHero
      :eyebrow="name"
      :paragraph="
        category.description ||
        `Expert insights, strategies, and guides on ${name.toLowerCase()}, plus what we're learning building ContioReach.`
      "
      :stat="data.meta?.total ? `${data.meta.total} articles in this category` : null"
    >
      <template #heading>
        Everything on
        <span
          class="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent"
        >
          {{ name }}
        </span>
      </template>
    </BlogHero>

    <div class="mx-auto max-w-7xl space-y-12 px-6 py-14">
      <CategoryPills :categories="data.categories" :active="slug" />
      <BlogListing :posts="data.posts" :feature-first="currentPage === 1" />
      <Pagination :meta="data.meta" :base-path="`/blog/category/${slug}`" />
    </div>

    <CTASection />
  </div>
</template>
