import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import LoginForm from './LoginForm';

export default function AuthGuard({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial pour éviter le flash de contenu protégé au refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listener pour sync l'état local dès que Supabase détecte un changement
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // On bloque le rendu tant que l'API n'a pas confirmé le statut auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  // Redirection forcée vers le login si le token est manquant ou expiré
  if (!session) {
    return <LoginForm />
  }

  return <>{children}</>
}