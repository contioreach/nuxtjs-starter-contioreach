import { CACHE_CONFIG } from "~~/shared/constants";

/* Publish webhook from ContioReach. Fired when a post is published, scheduled,
   deleted, or a published post is edited. Body: { secret, post }; the same
   secret is also accepted as the X-API-Key header.

   Nitro has no revalidateTag, so the same job is done against the cache
   storage directly: every cached reader in server/utils/cms.js is registered
   under a group that plays the part of a tag, and its keys are namespaced
   `<group>:<name>:<key>`. Dropping one group's keys invalidates exactly those
   reads and leaves the rest warm. */

/* Rendered responses, when the deployment target caches them (see the note on
   `isr` in nuxt.config.js). Harmless where it caches nothing. */
const ROUTE_CACHE_GROUP = "nitro/routes";

/* `storage.clear(base)` does not remove namespaced keys on every driver, so
   the keys are listed and removed explicitly — which behaves the same on
   memory, filesystem, Redis and KV. */
async function purge(cache, prefix) {
  const keys = await cache.getKeys(prefix);
  await Promise.all(keys.map((key) => cache.removeItem(key, { removeMeta: true })));
  return keys.length;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}));
    const secret = body?.secret || getHeader(event, "x-api-key");

    if (secret !== revalidationSecret()) {
      setResponseStatus(event, 401);
      return { error: "Invalid token" };
    }

    const cache = useStorage("cache");
    const tags = Object.values(CACHE_CONFIG.TAGS);

    const purged = await Promise.all([
      ...tags.map((tag) => purge(cache, tag)),
      purge(cache, ROUTE_CACHE_GROUP),
    ]);
    const entries = purged.reduce((total, count) => total + count, 0);

    console.log("Blog cache revalidated", {
      slug: body?.post?.slug ?? null,
      entries,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: "All blog cache revalidated successfully",
      revalidated: { tags, routes: ROUTE_CACHE_GROUP, entries },
    };
  } catch (error) {
    console.error("Full revalidation error:", error);
    setResponseStatus(event, 500);
    return {
      success: false,
      error: "Failed to revalidate blog cache",
      details: error.message,
    };
  }
});
