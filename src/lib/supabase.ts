import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase Environment Variables")
}

const globalForSupabase = global as unknown as { supabase: any }

export const supabase = (globalForSupabase.supabase || createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Important for Electron/PWA to avoid URL parsing errors
    }
})) as any

if (process.env.NODE_ENV !== 'production') globalForSupabase.supabase = supabase

export interface Task {
    id: string
    user_id: string
    title: string
    description?: string
    is_completed: boolean
    priority: 'low' | 'medium' | 'high' | 'urgent'
    due_date?: string
    category_id?: string
    created_at: string
    categories?: {
        name: string
        color: string
    }
}

export interface Category {
    id: string
    user_id: string
    name: string
    color: string
}
