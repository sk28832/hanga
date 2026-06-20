/** resolve engine base url — public url in prod, api proxy fallback in local dev. */
export function engineBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_HANGA_ENGINE_URL;
  if (publicUrl) return publicUrl.replace(/\/$/, "");

  // server-side fallback for api routes
  if (typeof window === "undefined") {
    const serverUrl = process.env.HANGA_ENGINE_URL;
    if (serverUrl) return serverUrl.replace(/\/$/, "");
    return "http://127.0.0.1:8000";
  }

  // client without public url → use next.js proxy routes
  return "";
}
