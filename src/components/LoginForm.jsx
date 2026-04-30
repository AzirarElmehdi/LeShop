import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    // Verrouillage de l'UI pour éviter les appels API en doublon
    setLoading(true)
    
    // Auth classique par password, on n'utilise pas de Magic Link pour le portail admin
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Feedback d'erreur basique, suffisant pour la phase MVP de l'admin
    if (error) {
      alert("Erreur d'authentification : " + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-8 italic">AZ<span className="text-blue-500 underline">Methods</span> Admin</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Email Admin</label>
            <input 
              type="email"
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Mot de passe</label>
            <input 
              type="password"
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* L'active:scale-95 permet de simuler un clic physique sur mobile/desktop */}
          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}