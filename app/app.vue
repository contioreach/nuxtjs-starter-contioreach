<script setup>
const site = useSite();

/* Defaults for every route, including ones that build their own head and the
   404 page. */
useHead({
  titleTemplate: (title) => title || "Nuxt Headless CMS Example | ContioReach",
});

useSeoMeta({
  description:
    "An open-source Nuxt 4 blog powered by a headless CMS — ISR, on-demand revalidation, category archives, JSON-LD and sitemaps included.",
  robots: site.noIndex ? "noindex, nofollow" : "index, follow",
});
</script>

<template>
  <SiteHeader />
  <main class="flex-1">
    <NuxtPage />
  </main>
  <SiteFooter />
</template>
