import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryDate: string;
  deliveryTime: string;
  specialInstructions: string;
  paymentMethod: string;
}

interface OrderConfirmationState {
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerInfo: CustomerInfo;
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderConfirmationState;

  // If no order data is available, redirect to home
  if (!state || !state.orderNumber) {
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  const { 
    orderNumber, 
    orderDate, 
    items, 
    subtotal, 
    deliveryFee, 
    total, 
    customerInfo 
  } = state;

  const getDeliveryTimeText = (time: string) => {
    switch (time) {
      case 'morning': return 'Morning (8AM - 12PM)';
      case 'afternoon': return 'Afternoon (12PM - 4PM)';
      case 'evening': return 'Evening (4PM - 8PM)';
      default: return time;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground text-lg">
                Thank you for your order. We've received your request and are getting started on your delicious cakes!
              </p>
            </div>
            
            <div className="bg-white dark:bg-card p-6 md:p-8 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row justify-between mb-6 pb-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Order #{orderNumber}</h2>
                  <p className="text-muted-foreground">Placed on {orderDate}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Order Confirmed
                  </span>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name} × {item.quantity}</p>
                      </div>
                      <p>R{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>R{subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Delivery</p>
                    <p>R{deliveryFee.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p className="text-cake-pink">R{total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Delivery Information</h3>
                  <div className="space-y-1">
                    <p className="font-medium">{customerInfo.firstName} {customerInfo.lastName}</p>
                    <p>{customerInfo.address}</p>
                    <p>{customerInfo.city}, {customerInfo.postalCode}</p>
                    <p>{customerInfo.phone}</p>
                    <p>{customerInfo.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Delivery Details</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">Date:</span> {formatDate(customerInfo.deliveryDate)}</p>
                    <p><span className="font-medium">Time:</span> {getDeliveryTimeText(customerInfo.deliveryTime)}</p>
                    {customerInfo.specialInstructions && (
                      <>
                        <p className="font-medium mt-2">Special Instructions:</p>
                        <p className="text-muted-foreground">{customerInfo.specialInstructions}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                <p>
                  <span className="font-medium">Payment Method:</span>{' '}
                  {customerInfo.paymentMethod === 'creditCard' 
                    ? 'Credit/Debit Card' 
                    : customerInfo.paymentMethod === 'paypal' 
                      ? 'PayPal' 
                      : 'Bitcoin'}
                </p>
                <p className="text-muted-foreground mt-1">
                  A receipt has been sent to your email address.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="md:w-auto"
              >
                Continue Shopping
              </Button>
              <Button 
                className="bg-cake-pink hover:bg-cake-pink/90 md:w-auto"
                onClick={() => window.print()}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderConfirmation;