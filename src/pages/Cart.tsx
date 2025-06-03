import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useCart } from '../contexts/CartContext'; // Adjust the import path as necessary
import { getProductImageUrl } from '@/lib/supabaseStorage';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, deliveryFee } = useCart();

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate('/products')} 
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Continue Shopping
            </button>
          </div>
          
          <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
          
          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center p-4 mb-4 bg-white dark:bg-card rounded-lg shadow-sm">
                    <div className="w-24 h-24 mr-4">
                      <img 
                        src={getProductImageUrl(item.image_url)} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">R{item.price.toFixed(2)} each</p>
                    </div>
                    
                    <div className="flex items-center">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border rounded-md"
                      >
                        -
                      </button>
                      <span className="mx-3">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border rounded-md"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="ml-6 text-right">
                      <p className="font-medium">R{(item.price * item.quantity).toFixed(2)}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p>R{cartTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Delivery</p>
                      <p>R{deliveryFee.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <p>Total</p>
                      <p className="text-cake-pink">R{(cartTotal + deliveryFee).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 bg-cake-pink hover:bg-cake-pink/90"
                    onClick={handleProceedToCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button 
                onClick={() => navigate('/products')}
                className="bg-cake-pink hover:bg-cake-pink/90"
              >
                Browse Products
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CartPage;