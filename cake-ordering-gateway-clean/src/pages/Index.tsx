import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import CakeCard from '@/components/CakeCard';
import Navbar from '@/components/Navbar';
// Define Product type locally since it's not exported from '@/lib/types'
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  popular: boolean;
  created_at: string;
  updated_at: string;
  is_vegan: boolean;
  embedding: any;
  options: any;
}
import Logo from '@/components/Logo';

// Define Category type since it's not in the provided types.ts snippet
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

const featuredProducts: Product[] = [
  {
    id: 1, // Changed from string to number to match the type definition
    name: 'Rainbow Birthday Cake',
    description: 'A colorful layered cake perfect for birthdays, with rainbow frosting and decorative toppings.',
    price: 300,
    category: 'cakes',
    image_url: '/lovable-uploads/rainbow birthday cake.jpg', // Removed 'image' property as it's not in the Product type
    popular: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_vegan: false,
    embedding: null, // Added missing properties from Product type
    options: null
  },
  {
    id: 2, // Changed from string to number
    name: 'Gold & Black Cake',
    description: 'Elegant gold and black number cake for milestone birthdays with luxurious decorations.',
    price: 400,
    category: 'cakes',
    image_url: '/lovable-uploads/gold and black cake.jpg',
    popular: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_vegan: false,
    embedding: null,
    options: null
  },
  {
    id: 3, // Changed from string to number
    name: 'Baby Blue Shower Cake',
    description: 'Delicate blue cake with cloud decorations, perfect for baby showers.',
    price: 350,
    category: 'cakes',
    image_url: '/lovable-uploads/blue cake.jpg',
    popular: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_vegan: false,
    embedding: null,
    options: null
  },
  {
    id: 4, // Changed from string to number
    name: 'Custom Number Cake',
    description: 'Shaped cake in any number you need for birthdays or anniversaries.',
    price: 350,
    category: 'cakes',
    image_url: '/lovable-uploads/custom numbers cake.jpg',
    popular: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_vegan: false,
    embedding: null,
    options: null
  }
];

const categories: Category[] = [
  {
    id: 'cakes',
    name: 'Cakes',
    slug: 'cakes',
    description: 'From custom birthdays to elegant weddings - our signature cakes for every occasion',
    image: 'public/lovable-uploads/Bible cake.jpg'
  },
  {
    id: 'cupcakes',
    name: 'Cupcakes',
    slug: 'cupcakes',
    description: 'Delightful individual treats in a variety of flavors and decorations',
    image: 'public/lovable-uploads/cupcakes.jpg'
  },
  {
    id: 'tarts',
    name: 'Tarts & Pies',
    slug: 'tarts',
    description: 'Sweet and savory tarts and pies made with the freshest ingredients',
    image: 'public/lovable-uploads/tarts and pies.jpg'
  }
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />
      <Hero />

      {/* AI Cake Design Section */}
      <section className="py-20 bg-gradient-to-r from-cake-lightpurple/10 to-cake-pink/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Design Your Favorite Sweet Treats</h2>
              <p className="text-lg mb-4">
                Create your own cake and get it delivered to you within 48 hours.
              </p>
              <Link to="/design-cake">
                <Button size="lg" variant="outline" className="border-cake-pink text-cake-pink hover:bg-cake-pink/10 font-semibold px-8">
                  Design Cake
                </Button>
              </Link>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <video 
                className="w-full h-auto object-cover" 
                autoPlay 
                loop 
                muted 
                playsInline
                controls
              >
                <source src="/lovable-uploads/Cake video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Cakes</h2>
              <p className="text-muted-foreground max-w-2xl">
                Our most popular creations that bring smiles to every celebration.
              </p>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-cake-pink hover:text-cake-pink/80 transition-colors">
              <span className="mr-2">View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <CakeCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-10 md:hidden">
            <Link to="/products">
              <Button variant="outline" className="border-cake-pink text-cake-pink hover:bg-cake-pink/10">
                View All Cakes <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <CategorySection categories={categories} />
      
      {/* Subscription Tiers */}
      <section className="py-20 bg-gradient-to-b from-transparent to-cake-lightpurple/20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Cake Plan</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select the perfect subscription tier for your cake needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-card p-8 rounded-2xl text-center hover-lift">
              <h3 className="text-xl font-bold mb-3">Basic</h3>
              <ul className="text-left space-y-2 mb-6">
                <li>✓ Choose your cake</li>
                <li>✓ Order your cake</li>
                <li>✓ Get your cake delivered</li>
                <li className="text-sm text-muted-foreground">(Free delivery excluded)</li>
              </ul>
              <p className="text-2xl font-bold text-cake-pink mb-4">Free</p>
              <Link to="/everyday-cake-plan">
                <Button variant="outline" className="w-full">Select Plan</Button>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-card p-8 rounded-2xl text-center hover-lift">
              <h3 className="text-xl font-bold mb-3">Standard</h3>
              <ul className="text-left space-y-2 mb-6">
                <li>✓ Choose your cake</li>
                <li>✓ 1 Box of sweet treats p/m</li>
                <li>✓ Order your cake</li>
                <li>✓ Free delivery</li>
              </ul>
              <p className="text-2xl font-bold text-cake-pink mb-4">R150 pm</p>
              <Link to="/cake-lovers-plan">
                <Button variant="outline" className="w-full">Select Plan</Button>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-card p-8 rounded-2xl text-center hover-lift">
              <h3 className="text-xl font-bold mb-3">Premium</h3>
              <ul className="text-left space-y-2 mb-6">
                <li>✓ Choose your cake combo</li>
                <li>✓ 2 Boxes of sweets treats p/m</li>
                <li>✓ Order your cake combo</li>
                <li>✓ Free delivery</li>
              </ul>
              <p className="text-2xl font-bold text-cake-pink mb-4">R350 pm</p>
              <Link to="/super-cake-lovers-plan">
                <Button variant="outline" className="w-full">Select Plan</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
{/* CTA Section */}
<section className="py-20 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-cake-purple/30 to-cake-pink/30 z-0"></div>
  
  <div className="container relative z-10 mx-auto px-4 md:px-8">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order Your Perfect Cake?</h2>
      <p className="text-lg mb-8">
        Join our satisfied customers and make your next celebration extra special with our handcrafted cakes
      </p>
      <Link to="/products">
        <Button size="lg" className="bg-cake-pink hover:bg-cake-pink/90 text-foreground font-semibold px-8 mb-4">
          Order Now <ArrowRight size={16} className="ml-2" />
        </Button>
      </Link>
    </div>
  </div>
        
        {/* Floating decoration */}
        <div className="absolute -bottom-5 -right-5 w-40 h-40 rounded-full bg-cake-yellow/10 backdrop-blur-sm"></div>
        <div className="absolute top-10 -left-10 w-32 h-32 rounded-full bg-cake-purple/10 backdrop-blur-sm"></div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-card py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" showText={true} className="mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Bringing sweetness to your special moments in Durban, South Africa.
              </p>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Cake A Day. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-cake-pink">Home</Link></li>
                <li><Link to="/products" className="text-muted-foreground hover:text-cake-pink">Products</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-cake-pink">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-cake-pink">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><Link to="/products?category=cakes" className="text-muted-foreground hover:text-cake-pink">Cakes</Link></li>
                <li><Link to="/products?category=cupcakes" className="text-muted-foreground hover:text-cake-pink">Cupcakes</Link></li>
                <li><Link to="/products?category=tarts" className="text-muted-foreground hover:text-cake-pink">Tarts & Pies</Link></li>
                <li><Link to="/products?category=specials" className="text-muted-foreground hover:text-cake-pink">Specials</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Durban, South Africa</li>
                <li>Phone: +27 73 599 9972</li>
                <li>Email: info@cakeaday.co.za</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
