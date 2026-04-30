import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useShop } from '../../context/ShopContext'
import AdminCard from './AdminCard'
import Layout from '../layout/Layout' 

const ITEMS_PER_PAGE = 24;

export default function Admin() {
  // --- SHOP CONTEXT ---
  const { campaigns, setCampaigns, stores, setStores } = useShop()

  // --- STATES GLOBAUX ---
  const [currentView, setCurrentView] = useState('inventory') 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // --- DATA ---
  const [inventory, setInventory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // --- FORMS PRODUITS & PROMOS ---
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', category: '', brand: '', imageUrl: '', discount: '', stock: '' })
  const [formCampaign, setFormCampaign] = useState({ type: 'all', target: '', value: '' })
  
  // --- FORMS STORES ---
  const [editingStoreId, setEditingStoreId] = useState(null)
  const [formStore, setFormStore] = useState({ name: '', logo_url: '' })

  // --- FORM BUILDER ---
  const [selectedProductForBuilder, setSelectedProductForBuilder] = useState('')
  const [formBuilder, setFormBuilder] = useState({ description_longue: '', images_secondaires: '' })

  // --- INIT : uniquement les produits maintenant ---
  useEffect(() => { 
    const fetchInitialData = async () => {
      try {
        // Tri par stock ascendant pour identifier les ruptures de stock
        const { data: prodData } = await supabase.from('products').select('*').order('Stock', { ascending: true })
        if (prodData) setInventory(prodData)
      } finally { setIsLoading(false) }
    }
    fetchInitialData() 
  }, [])

  // Mapping automatique des données pour éviter de tout resaisir en mode builder
  useEffect(() => {
    if (selectedProductForBuilder) {
      const prod = inventory.find(p => p.id == selectedProductForBuilder)
      if (prod) {
        setFormBuilder({
          description_longue: prod.description_longue || '',
          images_secondaires: prod.images_secondaires ? prod.images_secondaires.join(', ') : ''
        })
      }
    }
  }, [selectedProductForBuilder, inventory])

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    // Cast forcé des types pour éviter les erreurs de schéma Supabase
    const payload = { ...form, price: parseFloat(form.price), discount: parseInt(form.discount || 0), Stock: parseInt(form.stock || 0) }
    if (editingId) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editingId).select()
      if (!error) setInventory(inventory.map(item => item.id === editingId ? data[0] : item))
    } else {
      const { data, error } = await supabase.from('products').insert([payload]).select()
      if (!error) setInventory([data[0], ...inventory])
    }
    setEditingId(null); setForm({ name: '', price: '', category: '', brand: '', imageUrl: '', discount: '', stock: '' })
  }

  const handleBuilderSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProductForBuilder) return alert("Choisis un produit !")
    // Parsing de la string pour transformer les URLs en array propre pour la DB
    const imgArray = formBuilder.images_secondaires.split(',').map(u => u.trim()).filter(u => u !== "")
    const { data, error } = await supabase.from('products')
      .update({ description_longue: formBuilder.description_longue, images_secondaires: imgArray })
      .eq('id', selectedProductForBuilder).select()
    if (!error) {
      setInventory(inventory.map(p => p.id == selectedProductForBuilder ? data[0] : p))
      alert("✅ Page produit générée !")
    }
  }

  const handleDeployRule = async () => {
    setIsSyncing(true)
    // Insertion des règles de campagne globales pour le priceEngine
    const { data, error } = await supabase.from('shop_settings').insert([{ campaign_type: formCampaign.type, campaign_target: formCampaign.target || '', campaign_value: parseInt(formCampaign.value) }]).select()
    if (!error) { setCampaigns([...campaigns, data[0]]); setFormCampaign({ type: 'all', target: '', value: '' }) }
    setIsSyncing(false)
  }

  const handleStoreSubmit = async (e) => {
    e.preventDefault()
    const payload = { name: formStore.name.trim(), logo_url: formStore.logo_url.trim() }
    if (editingStoreId) {
      const { data, error } = await supabase.from('stores').update(payload).eq('id', editingStoreId).select()
      if (!error) setStores(stores.map(s => s.id === editingStoreId ? data[0] : s))
    } else {
      const { data, error } = await supabase.from('stores').insert([payload]).select()
      if (!error) setStores([...stores, data[0]])
    }
    setFormStore({ name: '', logo_url: '' }); setEditingStoreId(null)
  }

  const openEditMode = (product) => {
    setEditingId(product.id)
    setForm({ name: product.name, price: product.price, category: product.category, brand: product.brand, imageUrl: product.image_url, discount: product.discount || '', stock: product.Stock || '' })
    setCurrentView('inventory')
    setIsSidebarOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ?")) return
    await supabase.from('products').delete().eq('id', id)
    setInventory(prev => prev.filter(p => p.id !== id))
  }

  if (isLoading) return <Layout><div className="p-20 text-white">Syncing...</div></Layout>

  return (
    <Layout>
      <div className="flex min-h-screen bg-slate-950 text-white font-sans">
        
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-slate-900 border-r border-slate-800 overflow-hidden sticky top-0 h-screen z-20`}>
          <div className="p-6 w-80 relative h-full flex flex-col">
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-4 p-2 text-slate-500 hover:text-white"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg></button>
            <h2 className="text-xl font-black mb-8 italic">AZ<span className="text-blue-500">Methods</span> PORTAL</h2>
            
            <div className="flex bg-slate-950 p-1 rounded-xl mb-8 border border-slate-800 shrink-0">
              <button onClick={() => setCurrentView('inventory')} className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all ${currentView === 'inventory' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Produits</button>
              <button onClick={() => setCurrentView('builder')} className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all ${currentView === 'builder' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Builder</button>
              <button onClick={() => setCurrentView('stores')} className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all ${currentView === 'stores' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Stores</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 pr-2 custom-scrollbar">
              
              {currentView === 'inventory' && (
                <>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventaire</p>
                    <input placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none" required />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Prix" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-1/2 bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none" required />
                      <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-1/2 bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none" required />
                    </div>
                    <select value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none text-white">
                      <option value="">Marque...</option>
                      {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <input placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none" required />
                    <button className="w-full py-3 rounded-2xl font-black text-[10px] uppercase bg-blue-600 shadow-xl shadow-blue-900/20">Enregistrer</button>
                  </form>

                  <div className="pt-8 border-t border-slate-800/60">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">Promotions</p>
                    <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                      <select value={formCampaign.type} onChange={e => setFormCampaign({...formCampaign, type: e.target.value, target: ''})} className="w-full bg-slate-800/50 border border-slate-700 p-2 rounded-lg text-[10px] outline-none text-white">
                        <option value="all">TOUT LE SITE</option>
                        <option value="category">PAR CATÉGORIE</option>
                        <option value="brand">PAR MARQUE</option>
                      </select>
                      {formCampaign.type !== 'all' && <input placeholder={`Cible ${formCampaign.type}...`} value={formCampaign.target} onChange={e => setFormCampaign({...formCampaign, target: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 p-2 rounded-lg text-[10px] outline-none focus:border-blue-500" />}
                      <div className="flex gap-2">
                        <input type="number" placeholder="%" value={formCampaign.value} onChange={e => setFormCampaign({...formCampaign, value: e.target.value})} className="w-16 bg-slate-800/50 border border-slate-700 p-2 rounded-lg text-[10px] text-center outline-none" />
                        <button onClick={handleDeployRule} disabled={isSyncing} className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase rounded-lg hover:bg-blue-600 hover:text-white transition-all">Déployer</button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentView === 'builder' && (
                <form onSubmit={handleBuilderSubmit} className="space-y-4">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest italic">Page Builder</p>
                  <select value={selectedProductForBuilder} onChange={e => setSelectedProductForBuilder(e.target.value)} className="w-full bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm text-white">
                    <option value="">Choisir produit...</option>
                    {inventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <textarea placeholder="Description détaillée (Amazon Style)..." value={formBuilder.description_longue} onChange={e => setFormBuilder({...formBuilder, description_longue: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-3 rounded-xl text-xs h-48 outline-none focus:border-blue-500" />
                  <textarea placeholder="Galerie URLs (url1, url2...)" value={formBuilder.images_secondaires} onChange={e => setFormBuilder({...formBuilder, images_secondaires: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-3 rounded-xl text-[10px] h-24 outline-none focus:border-blue-500" />
                  <button className="w-full py-4 rounded-3xl font-black text-[10px] uppercase bg-blue-600 shadow-xl shadow-blue-900/30">Générer Page Perso</button>
                </form>
              )}

              {currentView === 'stores' && (
                <form onSubmit={handleStoreSubmit} className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gérer les Stores</p>
                  <input placeholder="Nom Store" value={formStore.name} onChange={e => setFormStore({...formStore, name: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none" required />
                  <input placeholder="Logo URL" value={formStore.logo_url} onChange={e => setFormStore({...formStore, logo_url: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none" />
                  <button className="w-full py-3 rounded-2xl font-black text-[10px] uppercase bg-blue-600">Enregistrer</button>
                </form>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 relative overflow-y-auto">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="absolute top-6 left-6 p-2.5 bg-slate-900 border border-slate-800 rounded-xl z-30 shadow-2xl transition-all hover:scale-110">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          
          <div className="max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-12">
              <h1 className="text-2xl font-black italic tracking-tighter">DATA <span className="text-blue-500">CENTER</span></h1>
              <input placeholder="Filtrer..." className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl outline-none focus:border-blue-600 text-sm w-64" onChange={e => setSearchQuery(e.target.value)} />
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                <AdminCard key={item.id} product={item} onEdit={openEditMode} onDelete={handleDelete} globalSales={campaigns} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}