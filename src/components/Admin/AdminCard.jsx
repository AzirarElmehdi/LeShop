import { calculateFinalPrice } from '../../utils/priceEngine'

export default function AdminCard({ product, onEdit, onDelete, globalSales = [] }) {

  // Sécu sur le typage pour éviter les erreurs d'affichage si la DB renvoie null
  const stockQty = Number(product.Stock ?? 0);

  // Centralisation du calcul via le priceengine
  const { finalPrice, hasDiscount, details } = calculateFinalPrice(product, globalSales);

  return (
    <div className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-600/40 transition-all duration-500 shadow-xl flex flex-col">
      
      {/* Badges promos (item / category-brand / global) */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          
          {details.itemDisc > 0 && (
            <span className="bg-red-600 text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter">
              Item -{details.itemDisc}%
            </span>
          )}

          {details.eventDisc > 0 && (
            <span className="bg-blue-600 text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter">
              {details.specificType} -{details.eventDisc}%
            </span>
          )}

          {details.globalDisc > 0 && (
            <span className="bg-amber-500 text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter text-slate-950">
              Store -{details.globalDisc}%
            </span>
          )}

        </div>
      )}

      {/* Boutons admin (edit/delete) */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-[-5px] group-hover:translate-y-0 z-10">
        <button 
          onClick={() => onEdit(product)} 
          className="p-2 bg-slate-800/90 hover:bg-blue-600 rounded-xl backdrop-blur-sm text-[10px] transition-colors shadow-lg"
        >
          ✏️
        </button>

        <button 
          onClick={() => onDelete(product.id)} 
          className="p-2 bg-slate-800/90 hover:bg-red-600 rounded-xl backdrop-blur-sm text-[10px] transition-colors shadow-lg"
        >
          🗑️
        </button>
      </div>

      <div className="h-44 overflow-hidden bg-slate-800 relative">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out" 
        />
        {/* Overlay pour assurer le contraste des badges promo sur les images claires */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent opacity-60" />
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        
        <h3 className="font-bold text-white text-sm mb-3 truncate tracking-tight">
          {product.name}
        </h3>

        {/* Prix + ancien prix si promo */}
        <div className="flex items-end gap-2 mb-5">
          <p className="text-blue-400 font-black text-xl leading-none">
            {finalPrice} €
          </p>

          {hasDiscount && (
            <span className="text-slate-600 line-through text-[11px] mb-0.5 font-medium italic opacity-50">
              {product.price}€
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-slate-800/40 mt-auto">
          
          <span className="text-[7px] uppercase font-black tracking-[0.2em] bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full border border-slate-700/30">
            {product.category || 'N/A'}
          </span>

          {product.brand && (
            <span className="text-[7px] uppercase font-black tracking-[0.2em] bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">
              {product.brand}
            </span>
          )}
          
          {/* Alertes de stock : Priorité au Sold out pour éviter les commandes fantômes */}
          {stockQty <= 0 ? (
            <span className="ml-auto text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
              SOLD OUT
            </span>
          ) : stockQty <= 10 ? (
            <span className="ml-auto text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Plus que {stockQty} !
            </span>
          ) : null}

        </div>
      </div>
    </div>
  )
}