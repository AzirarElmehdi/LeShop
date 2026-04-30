import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Encodage de la query pour éviter les bugs d'URL
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative group w-full">
      <input
        type="text"
        placeholder="Rechercher un produit, une marque..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-slate-900/60 border border-slate-800 p-2.5 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm group-hover:bg-slate-900/80 text-white placeholder-slate-500"
      />
      
    </form>
  );
}