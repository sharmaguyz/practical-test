"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
interface CartContextType {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCart: () => void;
  decrementCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState<number>(0);
  useEffect(() => {
    const stored = localStorage.getItem('cartCount');
    if (stored) setCartCount(parseInt(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('cartCount', cartCount.toString());
  }, [cartCount]);

  const incrementCart = () => setCartCount((prev) => prev + 1);
  const decrementCart = () => setCartCount((prev) => Math.max(prev - 1, 0));

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, incrementCart, decrementCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
