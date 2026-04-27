import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AddToCartButton from '../components/UI/AddToCartButton'
import { calculateFinalPrice } from '../utils/priceEngine'
import Layout from '../components/layout/Layout'

const ITEMS_PER_PAGE = 24;

export default function Home() {

  const [products, setProducts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartItemCount, setCartItemCount] = useState(0)

  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // Initialisation de la DATA
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .range(0, ITEMS_PER_PAGE - 1)

        if (prodData) {
          setProducts(prodData)
          if (prodData.length < ITEMS_PER_PAGE) setHasMoreItems(false)
        }

        const { data: shopData } = await supabase.from('shop_settings').select('*')
        if (shopData) setCampaigns(shopData)

      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Chargé plus de produits
  const handleLoadMore = async () => {
    if (isFetchingMore) return;

    setIsFetchingMore(true)

    const nextPage = currentPage + 1
    const from = nextPage * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .range(from, to)

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

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950" />
  }

  return (
    <Layout>

      <div className="max-w-6xl mx-auto p-8">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-black italic text-white tracking-tighter">
            AZ<span className="text-blue-500 underline decoration-2">Methods</span>
          </h1>

          <div className="relative">
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>
        </header>

        {/* GRILLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {products.map(product => {

            const { finalPrice, hasDiscount, details } =
              calculateFinalPrice(product, campaigns)

            const stock = product.Stock ?? 0
            const isSoldOut = stock <= 0
            const isLowStock = stock > 0 && stock <= 10

            return (
              <div key={product.id} className="relative bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col">

                {/* PROMOS */}
                {hasDiscount && (
                  <div className="absolute top-6 left-6 flex flex-col gap-1">
                    {details.itemDisc > 0 && (
                      <span className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded">
                        -{details.itemDisc}%
                      </span>
                    )}
                    {details.eventDisc > 0 && (
                      <span className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded">
                        -{details.eventDisc}%
                      </span>
                    )}
                    {details.globalDisc > 0 && (
                      <span className="bg-amber-500 text-black text-[8px] px-2 py-0.5 rounded">
                        -{details.globalDisc}%
                      </span>
                    )}
                  </div>
                )}

                {/* STOCK */}
                {(isSoldOut || isLowStock) && (
                  <div className="absolute top-6 right-6">
                    {isSoldOut ? (
                      <span className="bg-slate-700 text-white text-[9px] px-3 py-1 rounded">
                        SOLD OUT
                      </span>
                    ) : (
                      <span className="bg-orange-500 text-white text-[9px] px-3 py-1 rounded animate-pulse">
                        Plus que {stock}
                      </span>
                    )}
                  </div>
                )}

                {/* IMAGE */}
                <div className="h-48 bg-slate-800 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={product.image_url}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-white text-sm font-bold">
                  {product.name}
                </h3>

                <div className="mt-auto pt-4">

                  <span className="text-xl text-blue-400 font-black">
                    {finalPrice}€
                  </span>

                  {hasDiscount && (
                    <span className="line-through text-slate-500 text-xs ml-2">
                      {product.price}€
                    </span>
                  )}

                  {isLowStock && !isSoldOut && (
                    <p className="text-orange-400 text-[10px] mt-1 font-bold">
                      🔥 Dépêche-toi
                    </p>
                  )}

                  <div className="mt-3">
                    {isSoldOut ? (
                      <button disabled className="w-full bg-slate-800 text-slate-500 py-2 rounded-xl text-xs">
                        Indisponible
                      </button>
                    ) : (
                      <AddToCartButton
                        product={product}
                        onAdd={() => setCartItemCount(p => p + 1)}
                      />
                    )}
                  </div>

                </div>
              </div>
            )
          })}
        </div>

        {/* Chargé plus */}
        {hasMoreItems && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isFetchingMore}
              className="bg-slate-800 px-6 py-3 rounded-xl text-xs text-white"
            >
              {isFetchingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}