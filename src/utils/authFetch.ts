import { supabase } from "./supabase";

// Authenticated fetch — automatically adds the Supabase access token
// Use this for all API calls to authenticated routes
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = supabase
    ? (await supabase.auth.getSession()).data.session
    : null;

  const headers = new Headers(options.headers);

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetch(url, { ...options, headers });
}
