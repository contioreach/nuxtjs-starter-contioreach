/* Every environment variable is read in exactly one place. A missing one fails
   the request loudly instead of quietly shipping a site that 401s against the
   CMS or points its canonicals at the wrong origin. */

function required(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example.`);
  }
  return value;
}

export function cmsConfig() {
  const runtime = useRuntimeConfig();
  return {
    baseUrl: required("CMS_API_URL", runtime.cmsApiUrl),
    apiKey: required("CMS_API_KEY", runtime.cmsApiKey),
  };
}

/* Optional until you set the webhook up — while it is empty the webhook
   rejects every call, so the site still runs on a fresh clone. */
export function revalidationSecret() {
  return useRuntimeConfig().revalidationSecret || "";
}

export function apiHeaders() {
  return {
    "Content-Type": "application/json",
    "X-API-Key": cmsConfig().apiKey,
  };
}
