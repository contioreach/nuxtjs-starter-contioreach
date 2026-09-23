<script setup>
defineProps({ error: { type: Object, default: () => ({}) } });

// A 404 should never be indexed, whatever the site-wide switch says.
useSeo({
  title: "Page not found | ContioReach",
  description: "The page you were looking for could not be found.",
  path: "/404",
  noIndex: true,
});
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="relative flex flex-1 items-center overflow-hidden">
      <Aurora />
      <div class="relative mx-auto max-w-xl px-6 py-32 text-center">
        <p class="font-mono text-sm text-zinc-500">{{ error?.statusCode || 500 }}</p>
        <h1 class="mt-4 text-4xl font-semibold text-balance text-white sm:text-5xl">
          {{ error?.statusCode === 404 ? "We couldn't find that page" : "Something went wrong" }}
        </h1>
        <p class="mx-auto mt-5 max-w-md leading-relaxed text-pretty text-zinc-400">
          {{
            error?.statusCode === 404
              ? "The article may have been moved or unpublished. The blog index is a good place to pick up again."
              : "The page failed to render. Try again in a moment."
          }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <NuxtLink
            to="/blog"
            class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Browse the blog
          </NuxtLink>
          <button
            type="button"
            class="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50"
            @click="clearError({ redirect: '/' })"
          >
            Back home
          </button>
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
