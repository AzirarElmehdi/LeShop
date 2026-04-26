import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { calculateFinalPrice } from '../utils/priceEngine' // 👈 N'oublie pas de vérifier le chemin !

export default function Home() {
  const [products, setProducts] = useState([])
  const [campaigns, setCampaigns] = useState([]) // 👈 On stocke les promos ici
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStoreData = async () => {
      // 1. Fetch des produits
      const { data: prodData } = await supabase.from('products').select('*')
      if (prodData) setProducts(prodData)

      // 2. Fetch des règles marketing actives
      const { data: shopData } = await supabase.from('shop_settings').select('*')
      if (shopData) setCampaigns(shopData)

      setLoading(false)
    }
    
    fetchStoreData()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 text-blue-500 font-bold italic tracking-widest">
      CHARGEMENT DU CATALOGUE...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <div className="max-w-6xl mx-auto p-8">
        
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-black italic text-white tracking-tighter">AZ<span className="text-blue-500 underline decoration-2">Methods</span> <span className="text-sm not-italic text-slate-500 uppercase tracking-widest">Shop</span></h1>
          <nav>
            <a href="/admin" className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl transition-all">
              Portal Admin
            </a>
          </nav>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            // 👈 Ici on fait mouliner notre Cerveau des prix pour chaque produit !
            const { finalPrice, hasDiscount, details } = calculateFinalPrice(product, campaigns);

            return (
              <div key={product.id} className="group relative bg-slate-900/40 border border-slate-800 p-4 rounded-3xl flex flex-col hover:border-blue-500/40 transition-all duration-500 shadow-xl">
                
                {/* 🏷️ BADGES DE PROMO DYNAMIQUES */}
                {hasDiscount && (
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5">
                    {details.itemDisc > 0 && <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest">OFFRE -{details.itemDisc}%</span>}
                    {details.eventDisc > 0 && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest">{details.specificType} -{details.eventDisc}%</span>}
                    {details.globalDisc > 0 && <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest">STORE -{details.globalDisc}%</span>}
                  </div>
                )}

                <div className="h-48 w-full overflow-hidden rounded-2xl mb-5 bg-slate-800 relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-60" />
                </div>
                
                <h3 className="text-sm font-bold text-white mb-2 truncate">{product.name}</h3>
                
                {/* Les petits tags de marque et catégorie */}
                <div className="flex gap-2 mb-4">
                  <span className="text-[7px] uppercase font-black tracking-[0.2em] bg-slate-800 text-slate-500 px-2 py-1 rounded-full">{product.category}</span>
                  {product.brand && <span className="text-[7px] uppercase font-black tracking-[0.2em] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">{product.brand}</span>}
                </div>

                <div className="mt-auto flex justify-between items-end border-t border-slate-800/50 pt-4">
                  <div>
                    <span className="text-2xl font-black text-blue-400 leading-none">{finalPrice} €</span>
                    {hasDiscount && (
                      <span className="block text-slate-600 line-through text-xs mt-1 font-medium italic">{product.price}€</span>
                    )}
                  </div>
                  <button className="bg-slate-800 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-blue-900/20 active:scale-95">
                    Ajouter
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}