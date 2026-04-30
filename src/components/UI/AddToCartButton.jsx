import { useCart } from '../../context/CartContext';
import { useState } from 'react';

export default function AddToCartButton({ product, disabled }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    // Sécu si le stock passe à 0 sans que le parent n'ait re-render
    if (disabled || (product.Stock ?? 0) <= 0) return;

    addToCart(product);
    setAdded(true);

    // Feedback visuel temporaire pour laisser l'utilisateur ré-ajouter plus tard
    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <button 
      onClick={handleClick}
      disabled={disabled || (product.Stock ?? 0) <= 0}
      className={`
        flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl 
        font-black text-[10px] uppercase tracking-widest 
        transition-all duration-300 active:scale-95 shadow-lg

        ${added 
          ? 'bg-green-500 text-white scale-105 shadow-green-900/30' 
          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}

        ${(disabled || (product.Stock ?? 0) <= 0) && 
          'opacity-50 bg-slate-700 hover:bg-slate-700 cursor-not-allowed shadow-none'}
      `}
    >
      {added ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" />
          </svg>
          Ajouté
        </>
      ) : (
        "Ajouter"
      )}
    </button>
  );
}