/* The public half of the configuration, safe to read in components. These are
   the only environment values that reach the browser; the CMS key and the
   webhook secret stay server-side (see server/utils/config.js). */

function required(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example.`);
  }
  return value;
}

export function useSite() {
  const { siteUrl, allowIndexing, signupUrl, loginUrl } = useRuntimeConfig().public;

  return {
    siteUrl: required("NUXT_PUBLIC_SITE_URL", siteUrl),
    signupUrl: required("NUXT_PUBLIC_SIGNUP_URL", signupUrl),
    loginUrl: required("NUXT_PUBLIC_LOGIN_URL", loginUrl),
    /* Site-wide noindex. The site isn't ready to be indexed yet, so every page
       ships `noindex, nofollow` until NUXT_PUBLIC_ALLOW_INDEXING is exactly
       "true". Flip that one env var to let search engines back in. */
    noIndex: allowIndexing !== "true",
  };
}
