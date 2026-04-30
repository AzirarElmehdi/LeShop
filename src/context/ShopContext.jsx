import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        // Requêtes en parallèle pour éviter le waterfall et charger le shop plus vite
        const [{ data: campaignsData }, { data: storesData }] = await Promise.all([
          supabase.from('shop_settings').select('*'),
          supabase.from('stores').select('*').order('name', { ascending: true })
        ]);

        if (campaignsData) setCampaigns(campaignsData);
        if (storesData) setStores(storesData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, []);

  return (
    <ShopContext.Provider value={{ campaigns, setCampaigns, stores, setStores, isLoading }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);