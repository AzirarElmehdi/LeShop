import { useState } from 'react';

// 👈 On ajoute 'onAdd' dans les paramètres
export default function AddToCartButton({ product, onAdd }) {
  const [isAdded, setIsAdded] = useState(false);
  
  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock || isAdded) return;

    setIsAdded(true);
    
    // 👈 On prévient la page Home qu'un produit a été ajouté pour le compteur !
    if (onAdd) onAdd(); 

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  if (isOutOfStock) {
    return (
      <button disabled className="bg-slate-900/50 text-slate-500 border border-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
        Rupture
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ease-out overflow-hidden min-w-[100px] flex justify-center items-center
        ${isAdded 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
          : 'bg-slate-800 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-900/20 active:scale-95'
        }
      `}
    >
      {isAdded ? (
        <span className="flex items-center gap-1 animate-in zoom-in-50 duration-300">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Ajouté
        </span>
      ) : (
        <span>Ajouter</span>
      )}
    </button>
  );
}