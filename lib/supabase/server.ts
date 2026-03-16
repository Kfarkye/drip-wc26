import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const resolveServerConfig = () => {
    const url = (
        process.env.SUPABASE_URL
        || process.env.NEXT_PUBLIC_SUPABASE_URL
        || ''
    ).trim();
    const key = (
        process.env.SUPABASE_SERVICE_ROLE_KEY
        || process.env.SUPABASE_ANON_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || ''
    ).trim();

    if (!url || !key) return null;
    return { key, url };
};

export function createServerSupabaseClient(): SupabaseClient | null {
    const config = resolveServerConfig();
    if (!config) return null;
    return createClient(config.url, config.key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
