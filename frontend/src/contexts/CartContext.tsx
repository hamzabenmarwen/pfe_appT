import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Plat, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (plat: Plat, quantity?: number) => void;
  removeFromCart: (platId: string) => void;
  updateQuantity: (platId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'traiteur_cart';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return [];
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

  const addToCart = useCallback((plat: Plat, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.plat.id === plat.id);
      let newItems;
      
      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.plat.id === plat.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prevItems, { plat, quantity }];
      }
      
      saveCartToStorage(newItems);
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((platId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.plat.id !== platId);
      saveCartToStorage(newItems);
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((platId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(platId);
      return;
    }
    
    setItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.plat.id === platId ? { ...item, quantity } : item
      );
      saveCartToStorage(newItems);
      return newItems;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCartToStorage([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.plat.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
