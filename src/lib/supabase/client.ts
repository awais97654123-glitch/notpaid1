import { createBrowserClient } from '@supabase/ssr';

export function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  if (cleaned.endsWith('/rest/v1/')) {
    cleaned = cleaned.replace('/rest/v1/', '');
  } else if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.replace('/rest/v1', '');
  }
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseUrl.includes('mock')) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
