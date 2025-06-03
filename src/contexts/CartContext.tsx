import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/types'; // Ensure Product is imported

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void; // Changed to number
  updateQuantity: (productId: number, quantity: number) => void; // Changed to number
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  deliveryFee: number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const deliveryFee = 150; // Fixed delivery fee of R150
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedItems = JSON.parse(savedCart) as any[];
        const validatedCartItems: CartItem[] = parsedItems.map((pItem: any) => ({
          // Ensure all Product fields are mapped, providing defaults
          id: pItem.id, // Product.id is number
          name: pItem.name ?? null,
          price: pItem.price ?? null,
          description: pItem.description ?? null,
          image_url: pItem.image_url ?? null,
          category: pItem.category ?? null,
          created_at: pItem.created_at ?? null,
          updated_at: pItem.updated_at ?? null,
          embedding: pItem.embedding ?? null,
          is_vegan: typeof pItem.is_vegan === 'boolean' ? pItem.is_vegan : null,
          options: pItem.options ?? null,
          popular: typeof pItem.popular === 'boolean' ? pItem.popular : null,
          quantity: typeof pItem.quantity === 'number' && pItem.quantity > 0 ? pItem.quantity : 1,
        })).filter((pItem): pItem is CartItem => 
            typeof pItem.id === 'number' && // Validate essential fields
            pItem.name !== null && 
            pItem.price !== null
        );
        setCart(validatedCartItems);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        localStorage.removeItem('cart'); // Clear corrupted cart
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Calculate totals safely
    const total = cart.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return sum + (price * quantity);
    }, 0);
    const count = cart.reduce((sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0), 0);
    
    setCartTotal(total);
    setCartCount(count);
  }, [cart]);
  
  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const currentItem = updatedCart[existingItemIndex];
        const currentQuantity = typeof currentItem.quantity === 'number' ? currentItem.quantity : 0;
        updatedCart[existingItemIndex] = {
          ...currentItem,
          quantity: currentQuantity + quantity
        };
        return updatedCart;
      } else {
        const newCartItem: CartItem = {
          ...product, 
          quantity: quantity,
        };
        return [...prevCart, newCartItem];
      }
    });
  };
  
  const removeFromCart = (productId: number) => { // productId is number
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId: number, quantity: number) => { // productId is number
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0), 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      deliveryFee,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
