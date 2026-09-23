<script setup>
/* What this example actually demonstrates — the reason a developer landed here
   from a search result. Each item points at the file that implements it. */
const features = [
  {
    title: "ISR + cached CMS reads",
    body: "Pages are served from Nitro's ISR cache on a one-hour window, and every CMS read is cached under a group that plays the part of a cache tag.",
    file: "server/utils/cms.js",
  },
  {
    title: "On-demand revalidation",
    body: "A signed webhook from the CMS drops those groups and the rendered pages built from them, so a published post goes live immediately without a redeploy.",
    file: "server/api/revalidate/all.post.js",
  },
  {
    title: "Server-rendered article body",
    body: "CMS HTML gets stable heading anchors and a table of contents in one server-side pass, instead of being parsed twice in the browser.",
    file: "shared/content.js",
  },
  {
    title: "Pagination and archives",
    body: "A real ?page=N listing plus category archives, both served from the ISR cache and revalidated by the same webhook.",
    file: "app/pages/blog/category/[slug].vue",
  },
  {
    title: "SEO, done properly",
    body: "Canonicals, Open Graph, BlogPosting and BreadcrumbList JSON-LD, a generated sitemap, and a single switch that gates indexing.",
    file: "app/utils/seo.js",
  },
  {
    title: "One CMS boundary",
    body: "Two functions stand between your components and the API. Swap in Contentful, Sanity or Strapi without touching a component.",
    file: "server/utils/cms.js",
  },
];
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16 sm:py-20">
    <h2 class="text-3xl font-semibold text-white sm:text-4xl">What this example demonstrates</h2>
    <p class="mt-2 max-w-2xl text-zinc-400">
      The parts most headless CMS tutorials leave out — and where to find each one in the repo.
    </p>

    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20"
      >
        <h3 class="font-semibold text-white">{{ feature.title }}</h3>
        <p class="mt-2.5 text-sm leading-relaxed text-zinc-400">{{ feature.body }}</p>
        <code class="mt-4 block font-mono text-xs break-all text-cyan-300/80">{{ feature.file }}</code>
      </div>
    </div>
  </section>
</template>
