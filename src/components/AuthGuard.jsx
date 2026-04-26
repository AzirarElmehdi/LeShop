import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import LoginForm from '../pages/LoginForm'

export default function AuthGuard({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Vérifie la session actuelle au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. Écoute les changements d'état (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  // Si pas de session, on affiche le formulaire de Login au lieu de la page Admin
  if (!session) {
    return <LoginForm />
  }

  // Si session ok, on affiche la page demandée (Admin)
  return <>{children}</>
}