import { createContext, useContext, useState, useEffect } from 'react';
import { calculateFinalPrice } from '../utils/priceEngine';
import { useShop } from './ShopContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { campaigns } = useShop();

  // Hydratation du state au boot pour pas perdre la session au refresh
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Persistence : on sync le localStorage dès que le panier est modifié
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);

      if (existing) {
        // Lock de sécurité : on compare avec le stock réel pour pas over-order
        if (existing.qty >= (product.Stock ?? 0)) return prev;
        return prev.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      if ((product.Stock ?? 0) <= 0) return prev;
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const decreaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, qty: item.qty - 1 }
          : item
      ).filter(item => item.qty > 0) // Le filter cleanup l'item s'il tombe à zéro
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const totalPrice = cart.reduce((acc, item) => {
    // Recalcul via le priceEngine pour que les promos globales s'appliquent sur le total
    const { finalPrice } = calculateFinalPrice(item, campaigns);
    return acc + (parseFloat(finalPrice) * item.qty);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      decreaseQty,
      removeFromCart,
      cartCount,
      totalPrice,
      campaigns
    }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() { return useContext(CartContext) };