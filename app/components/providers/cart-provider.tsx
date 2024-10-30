import { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "~/lib/type";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateItem: (index: number, item: CartItem) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  calculateItemPrice: (item: CartItem) => number;
  calculateTotal: () => number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const storedItems = JSON.parse(localStorage.getItem("cart") || "[]");
      setItems(storedItems);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const addItem = (item: CartItem) => {
    const existingItemIndex = items.findIndex(
      (existingItem) =>
        existingItem.slug === item.slug &&
        existingItem.options.sizeId === item.options.sizeId &&
        existingItem.options.borderId === item.options.borderId &&
        existingItem.options.toppingId === item.options.toppingId,
    );

    if (existingItemIndex !== -1) {
      // Item exists with same options, update quantity
      const newItems = [...items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + item.quantity,
      };
      setItems(newItems);
      localStorage.setItem("cart", JSON.stringify(newItems));
    } else {
      // New item or different options, add to cart
      const newItems = [...items, item];
      setItems(newItems);
      localStorage.setItem("cart", JSON.stringify(newItems));
    }
  };

  const updateItem = (index: number, item: CartItem) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  const calculateItemPrice = (item: CartItem) => {
    const total =
      (item.options.sizePrice || 0) +
      (item.options.borderPrice || 0) +
      (item.options.toppingPrice || 0);
    return total * item.quantity;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  };

  const value = {
    items,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    calculateItemPrice,
    calculateTotal,
    itemCount: items.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
