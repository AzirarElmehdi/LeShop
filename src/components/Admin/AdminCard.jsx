export default function AdminCard({ product, onEdit, onDelete, globalSales = [] }) {
  
  const itemDisc = product.discount || 0;
  
  // SCAN DES RÈGLES GLOBALES
  // On cherche une règle spécifique.
  const specificRule = globalSales.find(rule => 
    (rule.campaign_type === 'category' && rule.campaign_target?.toLowerCase() === product.category?.toLowerCase()) ||
    (rule.campaign_type === 'brand' && rule.campaign_target?.toLowerCase() === product.brand?.toLowerCase())
  );

  // On cherche la règle "EVERYTHING".
  const storewideRule = globalSales.find(rule => rule.campaign_type === 'all');

  const eventDisc = specificRule ? specificRule.campaign_value : 0;
  const globalDisc = storewideRule ? storewideRule.campaign_value : 0;
  
  // CALCUL SUCCESSIF 
  const afterItem = product.price * (1 - itemDisc / 100);
  const afterEvent = afterItem * (1 - eventDisc / 100);
  const finalPrice = (afterEvent * (1 - globalDisc / 100)).toFixed(2);

  const hasAnySale = itemDisc > 0 || eventDisc > 0 || globalDisc > 0;

  return (
    <div className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-600/40 transition-all duration-500 shadow-xl">
      
      {/* BADGES PROMO */}
      {hasAnySale && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          {itemDisc > 0 && (
            <span className="bg-red-600 text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter">
              Item -{itemDisc}%
            </span>
          )}
          {eventDisc > 0 && (
            <span className="bg-blue-600 text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter">
              {specificRule.campaign_type} -{eventDisc}%
            </span>
          )}
          {globalDisc > 0 && (
            <span className="bg-amber-500 text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter text-slate-950">
              Store -{globalDisc}%
            </span>
          )}
        </div>
      )}

      {/* ADMIN CONTROLS */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-[-5px] group-hover:translate-y-0 z-10">
        <button onClick={() => onEdit(product)} className="p-2 bg-slate-800/90 hover:bg-blue-600 rounded-xl backdrop-blur-sm text-[10px] transition-colors">✏️</button>
        <button onClick={() => onDelete(product.id)} className="p-2 bg-slate-800/90 hover:bg-red-600 rounded-xl backdrop-blur-sm text-[10px] transition-colors">🗑️</button>
      </div>

      <div className="h-44 overflow-hidden bg-slate-800 relative">
        <img src={product.image_url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent opacity-60" />
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-white text-sm mb-3 truncate tracking-tight">{product.name}</h3>

        <div className="flex items-end gap-2 mb-5">
          <p className="text-blue-400 font-black text-xl leading-none">{finalPrice} €</p>
          {hasAnySale && (
            <span className="text-slate-600 line-through text-[11px] mb-0.5 font-medium italic opacity-50">
              {product.price}€
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-800/40">
          <span className="text-[7px] uppercase font-black tracking-[0.2em] bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full border border-slate-700/30">
            {product.category || 'N/A'}
          </span>
          {product.brand && (
            <span className="text-[7px] uppercase font-black tracking-[0.2em] bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">
              {product.brand}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}