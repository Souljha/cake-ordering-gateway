import React from 'react';
import Navbar from '@/components/Navbar';
import SubscriptionForm from '@/components/SubscriptionForm';

const SuperCakeLoversPlan: React.FC = () => {
  const planFeatures = [
    'Choose your cake combo',
    'Design your cake combo',
    'Order your cake combo',
    'Free delivery'
  ];

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Super Cake Lovers Plan</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Subscribe to our ultimate plan with cake combos and free delivery
              </p>
            </div>
            
            <SubscriptionForm 
              planName="Super Cake Lovers" 
              planPrice="R350 pm" 
              planFeatures={planFeatures} 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuperCakeLoversPlan;