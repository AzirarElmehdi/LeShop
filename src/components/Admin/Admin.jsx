import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminCard from './AdminCard'

export default function Admin() {
  const [inventory, setInventory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Marketing Engine State
  const [campaigns, setCampaigns] = useState([]) 
  const [formCampaign, setFormCampaign] = useState({ type: 'all', target: '', value: 0 })

  const [form, setForm] = useState({ 
    name: '', price: '', category: '', brand: '', imageUrl: '', discount: 0 
  })

  useEffect(() => { 
    fetchInventory() 
    fetchShopSettings() 
  }, [])

  async function fetchInventory() {
    const { data } = await supabase.from('products').select('*')
    setInventory(data || [])
  }

  async function fetchShopSettings() {
    const { data, error } = await supabase.from('shop_settings').select('*')
    if (data && !error) setCampaigns(data)
  }



  const handleDeployRule = async () => {
    if (formCampaign.value <= 0) return alert("Please set a valid percentage")
    
    setIsSyncing(true)
    // On s'assure d'envoyer les noms de colonnes EXACTS de ta table SQL
    const { data, error } = await supabase
      .from('shop_settings')
      .insert([{
        campaign_type: formCampaign.type,
        campaign_target: formCampaign.target || '',
        campaign_value: parseInt(formCampaign.value)
      }])
      .select()

    if (!error) {
      setCampaigns([...campaigns, data[0]])
      setFormCampaign({ type: 'all', target: '', value: 0 })
      alert("🚀 Campaign deployed!")
    } else {
      console.error("Deploy error:", error)
      alert("Failed to deploy. Check Supabase Policies.")
    }
    setIsSyncing(false)
  }

  const deleteRule = async (id) => {
    // On cible la règle par son rule_id généré par Supabase.
    const { error } = await supabase
      .from('shop_settings')
      .delete()
      .eq('rule_id', id)

    if (!error) {
      setCampaigns(prev => prev.filter(c => c.rule_id !== id))
    } else {
      console.error("Delete rule error:", error)
    }
  }

  const handleKillSwitch = async () => {
    if(!window.confirm("Nuclear Option: Wipe ALL marketing rules?")) return
    const { error } = await supabase.from('shop_settings').delete().neq('rule_id', '00000000-0000-0000-0000-000000000000') 
    if (!error) {
      setCampaigns([])
      alert("Sales engine halted. Full reset complete.")
    }
  }

  // --- LOGIQUE PRODUITS ---

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    const payload = { 
      name: form.name, 
      price: parseFloat(form.price), 
      category: form.category, 
      brand: form.brand, 
      image_url: form.imageUrl,
      discount: parseInt(form.discount || 0)
    }

    if (editingId) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editingId).select()
      if (!error) {
        setInventory(inventory.map(item => item.id === editingId ? data[0] : item))
        setEditingId(null)
      }
    } else {
      const { data, error } = await supabase.from('products').insert([payload]).select()
      if (!error) setInventory([...inventory, data[0]])
    }
    resetForm()
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion?")) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) setInventory(inventory.filter(item => item.id !== id))
  }

  const openEditMode = (product) => {
    setEditingId(product.id)
    setForm({ 
      name: product.name, price: product.price, category: product.category, 
      brand: product.brand, imageUrl: product.image_url, discount: product.discount || 0 
    })
    setIsSidebarOpen(true)
  }

  const resetForm = () => {
    setForm({ name: '', price: '', category: '', brand: '', imageUrl: '', discount: 0 })
    setEditingId(null)
  }

  const filteredInventory = inventory.filter(item => 
    [item.name, item.category, item.brand].some(field => 
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="flex min-h-screen bg-slate-950 text-white selection:bg-blue-600/30 font-sans">
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-slate-900 border-r border-slate-800 overflow-hidden sticky top-0 h-screen z-20`}>
        <div className="p-6 w-80 relative h-full flex flex-col">
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-4 p-2 text-slate-500 hover:text-white transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
          </button>

          <h2 className="text-xl font-black mb-10 tracking-tighter italic text-white">AZ<span className="text-blue-500 underline decoration-2">Methods</span> <span className="text-[9px] not-italic text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded ml-1">Portal</span></h2>
          
          <div className="flex-1 overflow-y-auto space-y-12 pr-2 custom-scrollbar">
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventory Management</p>
              <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none focus:border-blue-600" required />
              
              <div className="flex gap-2">
                <input type="number" placeholder="MSRP" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-1/2 bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none" required />
                <input type="number" placeholder="Disc %" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="w-1/2 bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm outline-none" />
              </div>

              <div className="flex gap-2">
                <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-1/2 bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm" />
                <input placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-1/2 bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm" />
              </div>

              <input placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full bg-slate-800/40 border border-slate-700 p-2.5 rounded-xl text-sm" required />
              
              <button className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl ${editingId ? 'bg-orange-600 shadow-orange-900/20' : 'bg-blue-600 shadow-blue-900/20 hover:bg-blue-500'}`}>
                {editingId ? 'Confirm Updates' : 'Commit to Shop'}
              </button>
            </form>

            <div className="pt-8 border-t border-slate-800/60">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Sales Engine</p>
                <button onClick={handleKillSwitch} className="text-[8px] text-slate-500 hover:text-red-500 font-black transition-colors uppercase">Kill All</button>
              </div>

              <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 mb-4 shadow-inner">
                <select 
                  value={formCampaign.type}
                  onChange={e => setFormCampaign({...formCampaign, type: e.target.value, target: ''})}
                  className="w-full bg-slate-800/50 border border-slate-700 p-2 rounded-lg text-[10px] outline-none text-white focus:border-blue-500"
                >
                  <option value="all">EVERYTHING</option>
                  <option value="category">BY CATEGORY</option>
                  <option value="brand">BY BRAND</option>
                </select>
                
                {formCampaign.type !== 'all' && (
                  <input 
                    placeholder={`Spec ${formCampaign.type}...`} 
                    value={formCampaign.target}
                    className="w-full bg-slate-800/50 border border-slate-700 p-2 rounded-lg text-[10px] outline-none focus:border-blue-500" 
                    onChange={e => setFormCampaign({...formCampaign, target: e.target.value})} 
                  />
                )}

                <div className="flex gap-2">
                  <input type="number" placeholder="%" value={formCampaign.value} className="w-16 bg-slate-800/50 border border-slate-700 p-2 rounded-lg text-[10px] text-center outline-none" onChange={e => setFormCampaign({...formCampaign, value: e.target.value})} />
                  <button 
                    onClick={handleDeployRule}
                    disabled={isSyncing}
                    className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    Deploy
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {campaigns.map(c => (
                  <div key={c.rule_id} className="flex justify-between items-center bg-slate-800/30 p-2 rounded-xl border border-slate-700/50 animate-in fade-in slide-in-from-right-2">
                    <p className="text-[9px] font-bold">
                      <span className="text-blue-400">-{c.campaign_value}%</span> on {c.campaign_type === 'all' ? 'Store' : c.campaign_target}
                    </p>
                    <button onClick={() => deleteRule(c.rule_id)} className="text-slate-500 hover:text-red-500 px-1 transition-colors">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 relative">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="fixed top-6 left-6 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white z-30 shadow-2xl transition-all hover:scale-110">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        )}

        <div className="max-w-6xl mx-auto">
          <header className={`flex justify-between items-center mb-12 transition-all duration-300 ${!isSidebarOpen ? 'pl-16' : 'pl-0'}`}>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest italic">Live Inventory Index</p>
              <p className="text-lg font-black text-blue-500/90">{inventory.length} <span className="text-[10px] font-light text-slate-400 uppercase tracking-tight">Active Units</span></p>
            </div>
            
            <div className="relative group">
              <input 
                placeholder="Asset Lookup..." 
                className="bg-slate-900/40 border border-slate-800 p-2.5 pl-10 rounded-2xl outline-none focus:border-blue-600 transition-all text-sm w-48 sm:w-64 focus:w-80 group-hover:bg-slate-900/60"
                onChange={e => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3.5 top-3.5 text-slate-600 text-xs font-mono">#</span>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventory.map(item => (
              <AdminCard 
                key={item.id} 
                product={item} 
                onEdit={openEditMode} 
                onDelete={handleDelete} 
                globalSales={campaigns}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}