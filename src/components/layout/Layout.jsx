import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import SearchBar from '../UI/SearchBar';

export default function Layout({ children }) {
  const { cartCount } = useCart();
  const location = useLocation();

  // Check de la route pour adapter les composants affichés (search, bouton admin)
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Header sticky avec blur pour garder la lisibilité sur les images produits au scroll */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-8 py-5 flex justify-between items-center gap-8">
          
          <Link to="/" className="text-2xl font-black italic tracking-tighter hover:opacity-80 transition-opacity shrink-0">
            AZ<span className="text-blue-500 underline decoration-2">Methods</span> <span className="text-[10px] not-italic text-slate-500 uppercase tracking-widest ml-1">Shop</span>
          </Link>

          <div className="flex-1 max-w-md hidden md:block">
            {/* On masque la recherche sur l'admin */}
            {!isAdminPage && <SearchBar />}
          </div>

          <nav className="flex items-center gap-6 shrink-0">
            <Link to="/cart" className="relative text-slate-400 hover:text-white transition-colors group">
              <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              
              {/* Le badge n'est rendu que si cartCount > 0 pour éviter un cercle rouge vide */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Accès portal visible uniquement depuis la partie boutique publique */}
            {!isAdminPage && (
              <Link to="/admin" className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl transition-all">
                Portal Admin
              </Link>
            )}
          </nav>

        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-800 p-6 text-center text-xs font-medium tracking-widest uppercase text-slate-600">
        © 2026 AZMethods - Tous droits réservés
      </footer>
    </div>
  )
}