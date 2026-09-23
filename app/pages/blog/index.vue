<script setup>
import { POSTS_PER_PAGE } from "~~/shared/constants";

const route = useRoute();
const site = useSite();

const currentPage = computed(() => Math.max(1, Number.parseInt(route.query.page, 10) || 1));

/* `watch` on the page number keeps ?page=N a real navigation: the listing
   refetches on the server for a fresh load and on the client for a link. */
const { data } = await useFetch("/api/listing", {
  query: { page: currentPage, limit: POSTS_PER_PAGE },
  watch: [currentPage],
  default: () => ({ posts: [], meta: {}, categories: [] }),
});

useSeo({
  title: "Blog | Headless CMS, SEO & Content Strategy | ContioReach",
  description:
    "Practical guides on headless CMS, SEO, AI search, blogging, and the workflows behind content that gets discovered, read, and cited.",
  path: "/blog",
  alt: "The ContioReach blog",
  keywords: [
    "headless cms blog",
    "content marketing",
    "seo tips",
    "ai search optimization",
    "blogging workflow",
    "content strategy",
  ],
});

useJsonLd(breadcrumbSchema([{ name: "Blog", path: "/blog" }], site.siteUrl));
</script>

<template>
  <div>
    <BlogHero
      paragraph="Headless CMS, SEO, AI search, and the workflows behind content that gets discovered, read, and cited."
      :stat="data.meta?.total ? `${data.meta.total} articles and counting` : null"
    >
      <template #heading>
        Writing about the craft of
        <span
          class="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent"
        >
          publishing well
        </span>
      </template>
    </BlogHero>

    <div class="mx-auto max-w-7xl space-y-12 px-6 py-14">
      <CategoryPills :categories="data.categories" />
      <BlogListing :posts="data.posts" :feature-first="currentPage === 1" />
      <Pagination :meta="data.meta" base-path="/blog" />
    </div>

    <CTASection />
  </div>
</template>
