/* The demo banner's only input: a status, never the key. See getApiKeyStatus
   in server/utils/cms.js. */
export default defineEventHandler(async () => ({ status: await getApiKeyStatus() }));
