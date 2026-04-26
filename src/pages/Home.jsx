import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
      
      if (error) {
        console.error('Erreur fetch:', error)
      } else {
        setProducts(data)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  if (loading) return <div className="flex justify-center mt-20">Chargement du catalogue...</div>

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold italic text-white">AZ<span className="text-blue-500 underline">Methods</span> Shop</h1>
        <nav>
          <a href="/admin" className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition">
            Espace Admin
          </a>
        </nav>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col hover:border-blue-500/50 transition-all group">
            <div className="h-48 w-full overflow-hidden rounded-xl mb-4 bg-slate-800">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-400">{product.price}€</span>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}