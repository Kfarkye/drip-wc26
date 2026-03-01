import { createClient } from '@supabase/supabase-js'

const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim()

const isKeyValid = supabaseAnonKey && supabaseAnonKey.length > 20 && !supabaseAnonKey.startsWith('Missing')
const hasConfig = !!(supabaseUrl && isKeyValid)

const clientUrl = hasConfig ? supabaseUrl : 'http://localhost'
const clientKey = hasConfig ? supabaseAnonKey : 'public-anon-key-not-set'

export const supabase = createClient(clientUrl, clientKey)
export const isSupabaseConfigured = () => hasConfig
