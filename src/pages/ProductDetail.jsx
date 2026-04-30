import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout/Layout'
import AddToCartButton from '../components/UI/AddToCartButton'

export default function ProductDetail() {
  const { id } = useParams() // Capte l'ID dans l'URL
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      // .single() pour récupérer l'objet directement au lieu d'un array de résultats
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) setProduct(data)
    }
    fetchProduct()
  }, [id])

  // Sécurité pour éviter les erreurs de lecture de propriétés sur un state initial à null
  if (!product) return <Layout><div className="p-20 text-white">Chargement...</div></Layout>

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-8 text-white font-sans">
        
        {/* IMAGE + PRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-slate-900 rounded-[40px] border border-slate-800 overflow-hidden shadow-2xl">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-10" />
          </div>

          <div className="flex flex-col justify-center space-y-8">
            {/* Le query param permet de pré-filtrer la home si l'utilisateur veut voir plus de produits de la marque */}
            <Link to={`/?brand=${product.brand}`} className="w-fit bg-blue-600/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              Boutique Officielle {product.brand}
            </Link>
            <h1 className="text-5xl font-black italic tracking-tighter leading-none">{product.name}</h1>
            <p className="text-4xl font-black text-white">{product.price}€</p>
            
            <AddToCartButton product={product} /> 
          </div>
        </div>

        {/* DESCRIPTION & GALERIE */}
        <div className="border-t border-slate-800 pt-16">
          <h2 className="text-xl font-black italic mb-8 border-l-4 border-blue-600 pl-4 uppercase tracking-widest">Fiche Détaillée</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* whitespace-pre-wrap pour respecter les sauts de ligne du textarea dans le dashboard admin */}
            <div className="lg:col-span-2 prose prose-invert max-w-none text-slate-400 leading-relaxed whitespace-pre-wrap">
              {product.description_longue || "Aucune description détaillée n'a été configurée pour ce produit."}
            </div>

            {/* Images Secondaires */}
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Galerie Photos</p>
               <div className="grid grid-cols-2 gap-4">
                 {product.images_secondaires?.map((img, i) => (
                   <img key={i} src={img} alt={`${product.name} - photo ${i + 1}`} className="rounded-2xl border border-slate-800 hover:border-blue-500 transition-all cursor-pointer aspect-square object-cover" />
                 ))}
               </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}