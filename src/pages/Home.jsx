import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AddToCartButton from '../components/UI/AddToCartButton'
import { calculateFinalPrice } from '../utils/priceEngine'

// Hard limit for pagination to prevent payload bottlenecks on large databases
const ITEMS_PER_PAGE = 24;

export default function Home() {
  // --- Core State ---
  const [products, setProducts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartItemCount, setCartItemCount] = useState(0)

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // --- Initial Mount ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch base catalog with strict range for performance
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .range(0, ITEMS_PER_PAGE - 1)
        
        if (prodError) throw prodError;

        if (prodData) {
          setProducts(prodData)
          if (prodData.length < ITEMS_PER_PAGE) setHasMoreItems(false)
        }

        // Hydrate marketing engine rules
        const { data: shopData } = await supabase.from('shop_settings').select('*')
        if (shopData) setCampaigns(shopData)

      } catch (error) {
        console.error("Failed to initialize storefront:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInitialData()
  }, [])

  // --- Handlers ---
  const handleLoadMore = async () => {
    if (isFetchingMore) return;
    
    setIsFetchingMore(true)
    const nextPage = currentPage + 1
    const fromIndex = nextPage * ITEMS_PER_PAGE
    const toIndex = fromIndex + ITEMS_PER_PAGE - 1

    try {
      const { data: moreData, error } = await supabase
        .from('products')
        .select('*')
        .range(fromIndex, toIndex)

      if (error) throw error;

      if (moreData) {
        setProducts(prev => [...prev, ...moreData])
        setCurrentPage(nextPage)
        
        // Exhausted the database collection
        if (moreData.length < ITEMS_PER_PAGE) setHasMoreItems(false)
      }
    } catch (error) {
      console.error("Pagination fetch failed:", error)
    } finally {
      setIsFetchingMore(false)
    }
  }

  // --- Renders ---

  // Skeleton loader for perceived performance during initial hydration
  if (isLoading) return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <div className="max-w-6xl mx-auto p-8">
        
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-black italic text-white tracking-tighter">AZ<span className="text-blue-500 underline decoration-2">Methods</span> <span className="text-sm not-italic text-slate-500 uppercase tracking-widest">Shop</span></h1>
          <div className="w-8 h-8 bg-slate-800 rounded-full animate-pulse"></div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl flex flex-col h-[380px] animate-pulse">
              <div className="h-48 w-full bg-slate-800 rounded-2xl mb-5"></div>
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-3 bg-slate-800 rounded-full w-12"></div>
                <div className="h-3 bg-slate-800 rounded-full w-16"></div>
              </div>
              <div className="mt-auto flex justify-between items-end border-t border-slate-800/50 pt-4">
                <div className="h-6 bg-slate-800 rounded w-20"></div>
                <div className="h-8 bg-slate-800 rounded-xl w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Main UI
  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <div className="max-w-6xl mx-auto p-8">
        
        {/* Navigation / Header */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-black italic text-white tracking-tighter">AZ<span className="text-blue-500 underline decoration-2">Methods</span> <span className="text-sm not-italic text-slate-500 uppercase tracking-widest">Shop</span></h1>
          
          <nav className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors group">
              <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                  {cartItemCount}
                </span>
              )}
            </button>

            <a href="/admin" className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl transition-all">
              Portal Admin
            </a>
          </nav>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            // Process compound discounts via external engine
            const { finalPrice, hasDiscount, details } = calculateFinalPrice(product, campaigns);

            return (
              <div key={product.id} className="group relative bg-slate-900/40 border border-slate-800 p-4 rounded-3xl flex flex-col hover:border-blue-500/40 transition-all duration-500 shadow-xl">
                
                {/* Dynamic Promo Badges */}
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
                  
                  <AddToCartButton 
                    product={product} 
                    onAdd={() => setCartItemCount(prev => prev + 1)} 
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination Trigger */}
        {hasMoreItems && !isLoading && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={handleLoadMore}
              disabled={isFetchingMore}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:shadow-lg hover:shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isFetchingMore ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div>
                  Loading...
                </>
              ) : (
                "Load More Assets"
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}