import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)

    // On envoie les données vers la table 'products' de Supabase
    const { error } = await supabase
      .from('products')
      .insert([
        { 
          name, 
          price: parseFloat(price), 
          category, 
          image_url: imageUrl 
        }
      ])

    setLoading(false)

    if (error) {
      console.error(error)
      alert('Erreur : ' + error.message)
    } else {
      alert('Produit ajouté mon gaté !')
      // On vide le formulaire
      setName('')
      setPrice('')
      setCategory('')
      setImageUrl('')
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto bg-slate-900 rounded-3xl mt-10 border border-slate-800 shadow-2xl">
      <h1 className="text-2xl font-bold mb-6 text-blue-400 text-center">Ajouter un Composant</h1>
      
      <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-slate-400 ml-1">Nom du produit</label>
          <input 
            className="w-full p-3 mt-1 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 text-white" 
            placeholder="ex: NVIDIA RTX 5090" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400 ml-1">Prix (€)</label>
          <input 
            className="w-full p-3 mt-1 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 text-white" 
            type="number" 
            step="0.01" 
            placeholder="1999.99" 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400 ml-1">Catégorie</label>
          <input 
            className="w-full p-3 mt-1 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 text-white" 
            placeholder="ex: GPU, CPU, RAM" 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400 ml-1">URL de l'image</label>
          <input 
            className="w-full p-3 mt-1 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 text-white" 
            placeholder="https://image-url.com/gpu.png" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
          />
        </div>
        
        <button 
          disabled={loading} 
          className="mt-4 bg-blue-600 p-4 rounded-xl font-bold text-white hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
        >
          {loading ? 'Connexion à Supabase...' : 'Ajouter au Catalogue'}
        </button>
      </form>
    </div>
  )
}