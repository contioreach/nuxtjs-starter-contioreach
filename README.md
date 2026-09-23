# Nuxt Headless CMS Starter

A complete, production-shaped blog built with **Nuxt 4** and a **headless CMS**, using [ContioReach](https://contioreach.com) as the content backend.

Not a toy. It ships the things a real content site actually needs and most examples skip: cached CMS reads with tag-style invalidation, an on-demand revalidation webhook, category archives, pagination, a table of contents generated from the article body, full SEO metadata, JSON-LD, and a sitemap.

```bash
npx degit contioreach/nuxtjs-starter-contioreach my-blog
cd my-blog && npm install
cp .env.example .env   # add your API key
npm run dev
```

> Looking for another stack? See the [Next.js](https://github.com/contioreach/nextjs-starter-contioreach) example.

---

## What's in the box

| Feature | Where |
| --- | --- |
| Blog index with pagination | [`app/pages/blog/index.vue`](app/pages/blog/index.vue) |
| Article page | [`app/pages/blog/[slug].vue`](app/pages/blog/%5Bslug%5D.vue) |
| Category archives | [`app/pages/blog/category/[slug].vue`](app/pages/blog/category/%5Bslug%5D.vue) |
| CMS client with cached reads + tag-style groups | [`server/utils/cms.js`](server/utils/cms.js) |
| On-demand revalidation webhook | [`server/api/revalidate/all.post.js`](server/api/revalidate/all.post.js) |
| Table of contents + stable heading anchors | [`shared/content.js`](shared/content.js) |
| Metadata, Open Graph, JSON-LD | [`app/utils/seo.js`](app/utils/seo.js), [`app/utils/schema.js`](app/utils/schema.js) |
| Sitemap and robots | [`server/routes/sitemap.xml.get.js`](server/routes/sitemap.xml.get.js), [`server/routes/robots.txt.get.js`](server/routes/robots.txt.get.js) |
| Article typography (raw CMS HTML) | [`app/assets/css/main.css`](app/assets/css/main.css) |

Styling is Tailwind CSS v4. No UI library, no content module, no database — the CMS is the only backend.

---

## 1. Environment variables

Copy the template and fill it in:

```bash
cp .env.example .env
```

```env
CMS_API_URL=https://cms-api.contioreach.com
CMS_API_KEY=cms_xxxxxxxxxxxxxxxxxxxxxxxx
REVALIDATION_SECRET=revalidate_xxxxxxxxxxxx
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_ALLOW_INDEXING=false
NUXT_PUBLIC_SIGNUP_URL=https://app.contioreach.com/signup
NUXT_PUBLIC_LOGIN_URL=https://app.contioreach.com/login
```

Get `CMS_API_KEY` and `REVALIDATION_SECRET` from your ContioReach workspace settings (the free plan is enough).

Every variable is declared once, in `runtimeConfig` ([`nuxt.config.js`](nuxt.config.js)), and validated in exactly one place per side of the boundary — [`server/utils/config.js`](server/utils/config.js) for the server, [`app/utils/site.js`](app/utils/site.js) for the four public values. Both throw a named error rather than letting the site quietly 401 or point its canonicals at the wrong origin.

`CMS_API_KEY` and `REVALIDATION_SECRET` live outside `runtimeConfig.public`, so they stay on the server and never reach the browser payload.

---

## 2. Fetching content

Components never touch the CMS. They call the app's own endpoints with `useFetch`, and those endpoints are the only thing that knows the API's shape:

```
app/pages/*.vue  →  /api/listing            →  server/utils/cms.js  →  ContioReach
                    /api/posts/[slug]
                    /api/categories/[slug]
```

That indirection is what keeps the API key server-side while still letting a client-side navigation fetch data — and it is where the transform layer sits, so swapping in Contentful, Sanity or Strapi is `apiRequest` plus two `transform*` functions, without touching a component.

`/api/posts/[slug]` also returns the article body already prepared: heading anchors added and the table of contents built from that same pass, so the two cannot drift and the browser never re-parses the article.

---

## 3. Caching and revalidation

Two layers, and it's worth being precise about which does what:

**Cached CMS reads.** Every reader in [`server/utils/cms.js`](server/utils/cms.js) is wrapped in `defineCachedFunction` with a one-hour window and `swr: true`, so once the window lapses the stale value is served while the refresh happens behind it — no visitor waits on the CMS. Each reader declares a `group`, which is where the cache tags went: keys are namespaced `<group>:<name>:<key>`, so one group can be dropped without touching the others. This works identically wherever you deploy.

**Rendered-page ISR.** The `routeRules` in [`nuxt.config.js`](nuxt.config.js) declare `isr: 3600`. On Vercel, Netlify or Cloudflare that caches the rendered HTML and rebuilds it in the background. On a plain Node server it is a no-op — Nitro leaves route caching to the platform there, so the cached readers above are what keeps the site off the CMS.

**The webhook.** `POST /api/revalidate/all` is what your CMS calls on publish. It checks the shared secret, then drops each group's keys and the rendered-route group:

```bash
curl -X POST https://your-site.com/api/revalidate/all \
  -H 'content-type: application/json' \
  -d '{"secret":"revalidate_xxx","post":{"slug":"my-post"}}'
```

The secret is accepted in the body or as an `X-API-Key` header; anything else gets a 401. Point your ContioReach workspace's publish webhook at that URL and posts go live without a redeploy.

One caveat worth knowing before you scale out: Nitro's cache defaults to in-process memory, so a webhook that lands on one instance only invalidates that instance. Before running more than one, give the cache a shared driver:

```js
// nuxt.config.js
nitro: {
  storage: { cache: { driver: "redis", url: process.env.REDIS_URL } },
}
```

On Vercel and Netlify, purging the platform's own ISR cache additionally requires that platform's API — the webhook above clears what Nitro owns.

---

## 4. SEO

- Canonical, Open Graph, Twitter card, robots and keywords are assembled by one composable, [`useSeo`](app/utils/seo.js), called the same way on every route. It takes a getter on the article and archive pages, because Vue Router reuses the component between posts and a snapshot would leave the previous article's canonical in the head.
- `BlogPosting` and `BreadcrumbList` JSON-LD from [`app/utils/schema.js`](app/utils/schema.js).
- Posts fall back to `/og-default.png` when they have no cover image — drop your own into `public/` before launch.
- `/sitemap.xml` is generated from the CMS on request; `/robots.txt` follows the same switch as the meta tags.
- **Indexing is off by default.** Until `NUXT_PUBLIC_ALLOW_INDEXING` is exactly `"true"`, every page ships `noindex, nofollow` and `robots.txt` disallows everything — so a demo deployment can't compete with your posts' canonical home. Flip that one variable on your real domain.

---

## 5. Project structure

```
app/
  assets/css/main.css      Tailwind entry + article typography for raw CMS HTML
  components/blog/         Cards, listing, hero, TOC, share bar, article detail
  components/layout/       Header and footer
  pages/                   /, /blog, /blog/[slug], /blog/category/[slug]
  utils/                   site config, formatting, SEO, JSON-LD schemas
server/
  api/                     listing, posts, categories, revalidation webhook
  routes/                  sitemap.xml, robots.txt
  utils/                   validated config, the CMS client and its cache
shared/
  constants.js             values that don't vary by environment
  content.js               article body prep — anchors + table of contents
```

---

## 6. Deploying

`npm run build` produces a Nitro server in `.output`; `node .output/server/index.mjs` runs it. Nitro also builds for Vercel, Netlify, Cloudflare and others with no code changes — see [Nuxt deployment](https://nuxt.com/docs/getting-started/deployment). Set the same environment variables there, with `NUXT_PUBLIC_SITE_URL` pointing at your real domain, and point the CMS publish webhook at `https://your-domain/api/revalidate/all`.

---

## License

MIT — see [LICENSE](LICENSE). Clone it, strip it back, rebrand it, ship it.
