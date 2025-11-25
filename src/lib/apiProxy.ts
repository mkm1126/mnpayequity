import { supabase } from './supabase';

/**
 * Proxy API requests through Supabase Edge Function to avoid CORS issues
 * This is useful when users are behind corporate firewalls or have strict security policies
 */
export async function proxyApiRequest(path: string, query?: string, options?: RequestInit) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const params = new URLSearchParams({
    path,
    ...(query && { query }),
  });

  const url = `${supabaseUrl}/functions/v1/proxy-api-request?${params}`;

  const response = await fetch(url, {
    method: options?.method || 'GET',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body,
  });

  if (!response.ok) {
    throw new Error(`API proxy request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Alternative: Use Supabase client with proper configuration
 * This ensures all requests go through Supabase's infrastructure
 */
export function getSupabaseClient() {
  return supabase;
}
