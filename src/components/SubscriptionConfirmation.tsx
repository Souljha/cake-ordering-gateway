import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { CheckCircle } from 'lucide-react';

interface SubscriptionConfirmationState {
    subscriptionId: string;
    subscriptionDate: string;
    planName: string;
    planPrice: string;
    planFeatures: string[];
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
      preferredDeliveryDay: string;
      specialInstructions: string;
      paymentMethod: string;
    };
  }

  const SubscriptionConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as SubscriptionConfirmationState;
  
    // If no subscription data is available, redirect to home
    if (!state || !state.subscriptionId) {
      React.useEffect(() => {
        navigate('/');
      }, [navigate]);
      return null;
    }
  
    const { 
      subscriptionId, 
      subscriptionDate, 
      planName, 
      planPrice, 
      planFeatures, 
      customerInfo 
    } = state;
  
    const getDeliveryDayText = (day: string) => {
      return day.charAt(0).toUpperCase() + day.slice(1);
    };
  

    return (
        <div className="min-h-screen bg-background page-transition">
          <Navbar />
          
          <section className="pt-32 pb-20">
            <div className="container mx-auto px-4 md:px-8">
            </div>
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Subscription Confirmed!</h1>
                  <p className="text-muted-foreground text-lg">
                    Thank you for subscribing to our {planName} plan. We're excited to have you as a member!
                  </p>
                </div>
                
                <div className="bg-white dark:bg-card p-6 md:p-8 rounded-lg shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row justify-between mb-6 pb-6 border-b">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Subscription #{subscriptionId}</h2>
                      <p className="text-muted-foreground">Started on {subscriptionDate}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Plan Details</h3>
                    <div className="mb-4">
                      <p className="font-medium text-lg">{planName}</p>
                      <p className="text-cake-pink font-medium">{planPrice}</p>
                    </div>
                    
                    <h4 className="font-medium mb-2">Features:</h4>
                    <ul className="space-y-1 mb-4">
                      {planFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                      <div className="space-y-1">
                        <p className="font-medium">{customerInfo.firstName} {customerInfo.lastName}</p>
                        <p>{customerInfo.address}</p>
                        <p>{customerInfo.city}, {customerInfo.postalCode}</p>
                        <p>{customerInfo.phone}</p>
                        <p>{customerInfo.email}</p>
                      </div>
                    </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Plan Features</h3>
              <ul className="space-y-1">
                {planFeatures.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-cake-pink mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Your first cake delivery will be scheduled according to your preferred delivery day.
                We'll send you an email with more details shortly.
              </p>
              
              <Button 
                onClick={() => navigate('/')}
                className="bg-cake-pink hover:bg-cake-pink/90"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionConfirmation;
