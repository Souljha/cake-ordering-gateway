import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SubscriptionFormProps {
  planName: string;
  planPrice: string;
  planFeatures: string[];
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ planName, planPrice, planFeatures }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    alert(`Thank you for subscribing to the ${planName} plan!`);
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-lg p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">{planName} Plan</h2>
          <p className="text-xl font-bold text-cake-pink mb-6">{planPrice}</p>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Plan Features:</h3>
            <ul className="space-y-2">
              {planFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-cake-pink mr-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 bg-cake-lightpurple/10 rounded-lg mb-6">
            <p className="text-sm">
              By subscribing to our {planName} plan, you'll enjoy all these benefits and make your cake ordering experience even sweeter!
            </p>
          </div>
        </div>
        
        <div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" required />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Your email address" required />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Your phone number" required />
              </div>
              
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I agree to the terms and conditions and privacy policy
                </Label>
              </div>
              
              <Button type="submit" className="w-full bg-cake-pink hover:bg-cake-pink/90">
                Subscribe Now
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;