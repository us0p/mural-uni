// Empty string so all /api/* calls go through the Next.js proxy (see rewrites in next.config.mjs).
// This ensures the auth cookie is set on the same origin that the middleware guards.
export const API_URL = ''
