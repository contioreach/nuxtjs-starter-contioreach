/* Values that do not vary by environment, shared by the Nuxt app and the Nitro
   server. Anything that *does* vary lives in runtimeConfig (nuxt.config.js),
   validated in server/utils/config.js and read in the app through
   app/utils/site.js. */

// ContioReach Public API.
export const API_ENDPOINTS = {
  BLOGS: "/v1/blogs",
  AUTHORS: "/v1/authors",
  TAGS: "/v1/tags",
  CATEGORIES: "/v1/categories",
};

export const CACHE_CONFIG = {
  REVALIDATE_TIME: 3600, // 1 hour
  /* Nitro has no cache tags, so each "tag" is a cached-function group instead:
     a cached read is stored under `cache:<group>:<name>:<key>`, which means the
     publish webhook can drop one group without touching the others. Same
     granularity as revalidateTag, spelled in Nitro's vocabulary. */
  TAGS: {
    BLOGS: "blogs",
    CATEGORIES: "categories",
    AUTHORS: "authors",
    TAGS: "tags",
  },
};

export const POSTS_PER_PAGE = 12;

// Marketing site link used by the CTA's secondary button.
export const CONTACT_URL = "https://contioreach.com/contact-us";

// This repo is a public example, so the demo UI links back to the source.
export const REPO_URL = "https://github.com/contioreach/nuxtjs-starter-contioreach";
export const CMS_SITE_URL = "https://contioreach.com";

/* The read-only key of the ContioReach demo workspace, and the default in
   .env.example — so a fresh clone renders real posts before you have an
   account. While it is the key in use, every page shows the demo banner
   (app/components/layout/DemoBanner.vue). Replacing it is the only switch. */
export const DEMO_API_KEY = "cms_a77631bccba461401bf5fd25b0402acd163623af5a5fc0ca";

export const EMPTY_META = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};
