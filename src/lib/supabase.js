import { createClient } from '@supabase/supabase-js'

// On récupère les variables d'environnement de ton fichier .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// On crée le "client" Supabase qui nous permettra de faire nos requêtes
export const supabase = createClient(supabaseUrl, supabaseAnonKey)