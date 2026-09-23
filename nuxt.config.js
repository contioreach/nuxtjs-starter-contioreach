import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  /* Components are auto-imported by bare filename — <BlogCard />, not
     <BlogBlogCard /> — so the folders group by area without leaking into the
     template. */
  components: [{ path: "~/components", pathPrefix: false }],
  vite: { plugins: [tailwindcss()] },

  /* Every environment-dependent value is declared here and read back through
     useRuntimeConfig(). Keys outside `public` stay on the server and are never
     serialised into the payload the browser receives. They are validated once,
     at startup, in server/utils/config.js. */
  runtimeConfig: {
    cmsApiUrl: process.env.CMS_API_URL,
    cmsApiKey: process.env.CMS_API_KEY,
    revalidationSecret: process.env.REVALIDATION_SECRET,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      allowIndexing: process.env.NUXT_PUBLIC_ALLOW_INDEXING,
      signupUrl: process.env.NUXT_PUBLIC_SIGNUP_URL,
      loginUrl: process.env.NUXT_PUBLIC_LOGIN_URL,
    },
  },

  /* Nitro's own vocabulary for what the Next example does with ISR. On a
     platform that supports it (Vercel, Netlify, Cloudflare) `isr` serves a
     cached render and rebuilds it in the background once the window lapses.
     On a plain Node server it is a no-op — there the caching that matters is
     the cached CMS readers in server/utils/cms.js, which hold the same
     one-hour window wherever this runs. The publish webhook
     (server/api/revalidate/all.post.js) cuts both windows short. */
  routeRules: {
    "/": { isr: 3600 },
    "/blog": { isr: 3600 },
    "/blog/**": { isr: 3600 },
    "/sitemap.xml": { isr: 3600 },
    "/robots.txt": { isr: 3600 },
    // Never cache the webhook itself.
    "/api/revalidate/**": { isr: false, cache: false },
  },

  nitro: {
    /* Cached CMS reads live in Nitro's `cache` mount, which defaults to
       in-process memory. That is fine for one instance; point it at Redis or
       Cloudflare KV before you run several, so a webhook that lands on one
       node invalidates all of them:

         storage: { cache: { driver: "redis", url: process.env.REDIS_URL } }
    */
    prerender: {
      crawlLinks: false,
      routes: ["/", "/blog"],
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "en", class: "h-full antialiased" },
      bodyAttrs: {
        class: "flex min-h-full flex-col bg-zinc-950 font-sans text-zinc-100 selection:bg-fuchsia-500/30",
      },
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap",
        },
      ],
    },
  },
});
