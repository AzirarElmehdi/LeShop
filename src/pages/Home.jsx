import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom' // ✨ Import de useSearchParams
import { supabase } from '../lib/supabase'
import { useShop } from '../context/ShopContext' 
import AddToCartButton from '../components/UI/AddToCartButton'
import { calculateFinalPrice } from '../utils/priceEngine'
import Layout from '../components/layout/Layout'

const ITEMS_PER_PAGE = 24;

export default function Home() {
  // RÉCUPÉRATION DES DONNÉES GLOBALES (Fetchées une seule fois par ShopContext)
  const { campaigns, stores } = useShop()

  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const [products, setProducts] = useState([])
  const [selectedStore, setSelectedStore] = useState('Tous')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  
  useEffect(() => {
    const fetchFilteredData = async () => {
      setIsLoading(true) 
      try {
        let query = supabase
          .from('products')
          .select('*')
          .range(0, ITEMS_PER_PAGE - 1)

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`)
        }

        if (selectedStore !== 'Tous') {
          query = query.eq('brand', selectedStore)
        }

        const { data: prodData, error } = await query

        if (error) throw error

        if (prodData) {
          setProducts(prodData)
          setCurrentPage(0) 
          setHasMoreItems(prodData.length === ITEMS_PER_PAGE)
        }
      } catch (error) {
        console.error("Erreur fetch produits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFilteredData()
  }, [searchQuery, selectedStore]) 

  // Gestion de l'infinite scroll : on doit ré-appliquer les filtres actifs pour charger la suite logique
  const handleLoadMore = async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true)
    const nextPage = currentPage + 1
    const from = nextPage * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    try {
      let query = supabase.from('products').select('*').range(from, to)

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }
      if (selectedStore !== 'Tous') {
        query = query.eq('brand', selectedStore)
      }

      const { data, error } = await query
      if (error) throw error

      if (data) {
        setProducts(prev => [...prev, ...data])
        setCurrentPage(nextPage)
        if (data.length < ITEMS_PER_PAGE) setHasMoreItems(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsFetchingMore(false)
    }
  }

  // Bloque le rendu pour éviter les sauts d'interface (layout shift) pendant le fetch initial
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <p className="text-slate-500 font-black tracking-widest uppercase animate-pulse">Chargement du catalogue...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-8">

        {/* BARRE DE FILTRAGE */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-800 pb-8">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Filtrer par Store</p>
            <div className="flex items-center gap-3">
              
              <button
                onClick={() => setSelectedStore('Tous')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  selectedStore === 'Tous' 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                Tout le catalogue
              </button>

              <div className="relative">
                <select
                  value={selectedStore === 'Tous' ? '' : selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value || 'Tous')}
                  className={`appearance-none pl-5 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900/60 border transition-all cursor-pointer outline-none ${
                    selectedStore !== 'Tous' 
                      ? 'border-blue-500 text-blue-400 shadow-lg shadow-blue-900/20' 
                      : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <option value="">Sélectionner une marque</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.name} className="bg-slate-900 text-white">
                      {store.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:ml-auto mt-4 sm:mt-8 flex flex-col items-end">
            {selectedStore !== 'Tous' && (
              <span className="text-[10px] text-slate-500 font-bold italic mb-1">
                Store : <span className="text-blue-500">{selectedStore}</span>
              </span>
            )}
            {/* Feedback UI pour confirmer que le filtrage par URL a bien été pris en compte */}
            {searchQuery && (
              <span className="text-[10px] text-slate-500 font-bold italic">
                Recherche : <span className="text-blue-500">"{searchQuery}"</span>
              </span>
            )}
          </div>
        </div>

        {/* MESSAGE SI AUCUN PRODUIT TROUVÉ */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl font-black italic text-slate-600">Aucun produit trouvé.</p>
            <p className="text-slate-500 mt-2 text-sm">Essaie une autre recherche ou change de store.</p>
          </div>
        )}

        {/* GRILLE PRODUITS (On boucle sur un dataset déjà filtré côté serveur par Supabase) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => {

            const { finalPrice, hasDiscount, details } = calculateFinalPrice(product, campaigns)
            const stock = product.Stock ?? 0
            const isSoldOut = stock <= 0
            const isLowStock = stock > 0 && stock <= 10

            return (
              <div key={product.id} className="relative bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col group hover:border-blue-500/40 transition-all duration-500 shadow-xl">

                {/* PROMOS */}
                {hasDiscount && (
                  <div className="absolute top-6 left-6 flex flex-col gap-1 z-10">
                    {details.itemDisc > 0 && <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">-{details.itemDisc}%</span>}
                    {details.eventDisc > 0 && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">-{details.eventDisc}%</span>}
                    {details.globalDisc > 0 && <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded uppercase">-{details.globalDisc}%</span>}
                  </div>
                )}

                {/* STOCK */}
                {(isSoldOut || isLowStock) && (
                  <div className="absolute top-6 right-6 z-10">
                    {isSoldOut ? (
                      <span className="bg-slate-700/90 text-white text-[9px] font-black px-3 py-1 rounded backdrop-blur-sm">SOLD OUT</span>
                    ) : (
                      <span className="bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.4)]">Plus que {stock}</span>
                    )}
                  </div>
                )}

                {/* IMAGE CLIQUABLE VERS PAGE PERSO */}
                <Link to={`/product/${product.id}`} className="cursor-pointer">
                  <div className="h-48 bg-slate-800 rounded-2xl mb-4 overflow-hidden relative">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60" />
                    
                    {product.brand && (
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-white/10">
                        {product.brand}
                      </span>
                    )}
                  </div>
                </Link>

                {/* NOM CLIQUABLE VERS PAGE PERSO */}
                <Link to={`/product/${product.id}`} className="hover:text-blue-400 transition-colors">
                  <h3 className="text-white text-sm font-bold truncate">{product.name}</h3>
                </Link>

                <div className="mt-auto pt-5 flex justify-between items-end border-t border-slate-800/50">
                  <div>
                    {isSoldOut ? (
                      <button disabled className="bg-slate-800 text-slate-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Indisponible</button>
                    ) : (
                      <AddToCartButton product={product} disabled={isSoldOut} />
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end">
                    {isLowStock && !isSoldOut && <p className="text-orange-400 text-[9px] mb-1 font-black uppercase tracking-wider animate-pulse">🔥 Vite !</p>}
                    <span className="text-2xl text-blue-400 font-black leading-none">{finalPrice}€</span>
                    {hasDiscount && <span className="line-through text-slate-500 text-xs mt-1 font-medium italic opacity-50">{product.price}€</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {hasMoreItems && products.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isFetchingMore}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500 px-8 py-3 rounded-2xl text-[10px] text-slate-300 hover:text-white font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
            >
              {isFetchingMore ? "Chargement..." : "Load More"}
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}