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

export function revalidationSecret() {
  return required("REVALIDATION_SECRET", useRuntimeConfig().revalidationSecret);
}

export function apiHeaders() {
  return {
    "Content-Type": "application/json",
    "X-API-Key": cmsConfig().apiKey,
  };
}
