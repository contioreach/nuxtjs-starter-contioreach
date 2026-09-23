<script setup>
import { REPO_URL } from "~~/shared/constants";

useSeo({
  title: "Nuxt Headless CMS Example | ContioReach",
  description:
    "An open-source Nuxt 4 blog powered by a headless CMS — ISR, on-demand revalidation webhooks, category archives, JSON-LD and sitemaps included.",
  path: "/",
  keywords: [
    "headless cms nuxt example",
    "nuxt headless cms",
    "nuxt 4 blog",
    "incremental static regeneration",
    "on-demand revalidation",
  ],
});

// Seven newest posts: one featured card plus two rows.
const { data } = await useFetch("/api/listing", {
  query: { page: 1, limit: 7 },
  default: () => ({ posts: [], categories: [] }),
});
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-white/10">
      <Aurora />
      <div class="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center sm:pt-32">
        <Eyebrow>Open-source example</Eyebrow>

        <h1 class="mt-6 text-5xl leading-[1.03] font-semibold text-balance text-white sm:text-7xl">
          Nuxt ×
          <span
            class="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent"
          >
            headless CMS
          </span>
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-zinc-400">
          A complete blog on Nuxt 4, with every post on this site fetched from the ContioReach
          headless CMS. Incremental static regeneration, instant publishing over a webhook, and the
          SEO work already done.
        </p>

        <!-- The copy-paste starting point: the first thing a developer who
             arrived from a search result is looking for. -->
        <div
          class="mx-auto mt-9 flex max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
        >
          <span aria-hidden="true" class="font-mono text-sm text-zinc-600">$</span>
          <code class="overflow-x-auto font-mono text-sm whitespace-nowrap text-zinc-200">
            npx degit contioreach/nuxtjs-starter-contioreach my-blog
          </code>
        </div>

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <a
            :href="REPO_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            View on GitHub
          </a>
          <NuxtLink
            to="/blog"
            class="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50"
          >
            See the live blog →
          </NuxtLink>
        </div>

        <p class="mt-6 font-mono text-xs text-zinc-600">
          Nuxt 4 · Vue 3 · Nitro · Tailwind CSS v4 · MIT
        </p>
      </div>
    </section>

    <FeatureGrid />

    <section class="mx-auto max-w-7xl border-t border-white/10 px-6 py-16 sm:py-24">
      <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-3xl font-semibold text-white sm:text-4xl">Live from the CMS</h2>
          <p class="mt-2 max-w-xl text-zinc-400">
            Not fixtures — these are real posts served through the code in this repo.
          </p>
        </div>
        <NuxtLink
          to="/blog"
          class="rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:text-white"
        >
          View all articles →
        </NuxtLink>
      </div>

      <div class="mb-10">
        <CategoryPills :categories="data.categories" />
      </div>

      <BlogListing :posts="data.posts" />
    </section>

    <CTASection />
  </div>
</template>
