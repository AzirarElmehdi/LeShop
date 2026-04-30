import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { calculateFinalPrice } from '../utils/priceEngine';
import { Link } from 'react-router-dom';

export default function Cart() {
  // campaigns récupérées pour le calcul dynamique des prix en front
  const { cart, addToCart, decreaseQty, removeFromCart, totalPrice, campaigns } = useCart();

  // Early return pour éviter de charger le reste du layout si c'est vide
  if (cart.length === 0) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-white space-y-6">
          <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800 shadow-inner">
            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter">Ton panier est vide</h2>
          <Link to="/" className="bg-slate-900 border border-slate-800 hover:border-blue-500 px-8 py-3 rounded-2xl text-[10px] text-slate-300 hover:text-white font-black uppercase tracking-[0.2em] transition-all active:scale-95">
            Retour à la boutique
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-8 text-white">
        
        <header className="mb-10 flex items-end justify-between border-b border-slate-800 pb-6">
           <h1 className="text-4xl font-black italic tracking-tighter">Panier</h1>
           <span className="text-slate-500 font-mono text-sm">{cart.length} Unité(s)</span>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1 space-y-4">
            {cart.map(item => {
              // Sécurité sur le stock pour éviter les incohérences si la data est mal castée
              const stock = item.Stock ?? 0;
              const isMax = item.qty >= stock;
              
              // On force le recalcul en direct via le moteur pour rester synchro avec le shop
              const { finalPrice, hasDiscount } = calculateFinalPrice(item, campaigns);
              const lineTotal = (parseFloat(finalPrice) * item.qty).toFixed(2);

              return (
                <div key={item.id} className="group relative flex flex-col sm:flex-row items-center gap-6 bg-slate-900/40 p-4 rounded-3xl border border-slate-800 hover:border-blue-500/30 transition-all overflow-hidden shadow-lg">
                  
                  {/* Image */}
                  <div className="w-full sm:w-28 h-28 bg-slate-800 rounded-2xl overflow-hidden shrink-0 relative">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  </div>

                  {/* Info Produit */}
                  <div className="flex-1 w-full">
                    <h2 className="font-bold text-lg truncate">{item.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-blue-400 font-black">{finalPrice}€</span>
                      {hasDiscount && <span className="text-slate-500 line-through text-xs italic">{item.price}€</span>}
                    </div>
                    {isMax && <p className="text-orange-400 text-[9px] uppercase tracking-widest font-bold mt-2">Stock max atteint</p>}
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                    
                    {/* On bloque l'ajout dès que la limite de stock physique est atteinte */}
                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                      <button onClick={() => decreaseQty(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-bold">-</button>
                      <span className="w-8 text-center font-black text-sm">{item.qty}</span>
                      <button onClick={() => addToCart(item)} disabled={isMax} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors font-bold ${isMax ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>+</button>
                    </div>

                    <div className="hidden sm:block w-20 text-right">
                      <p className="font-black text-lg text-white">{lineTotal}€</p>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full lg:w-80 shrink-0">
            {/* Le sticky évite de perdre le CTA de vue sur les longs paniers */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl sticky top-28 shadow-xl">
              <h3 className="font-black text-xl mb-6 italic tracking-tighter">Résumé</h3>
              
              <div className="space-y-4 text-sm text-slate-400 mb-6">
                <div className="flex justify-between items-center">
                  <span>Sous-total</span>
                  <span className="font-medium text-white">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Frais de livraison</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Gratuit</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 flex justify-between items-end mb-8">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Total TTC</span>
                <span className="text-3xl text-blue-500 font-black leading-none">{totalPrice.toFixed(2)}€</span>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                Commander
              </button>
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
}