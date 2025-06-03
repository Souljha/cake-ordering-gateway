
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] overflow-hidden flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cake-purple/30 to-cake-lightpurple/30 z-0"></div>
      
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 mix-blend-multiply"></div>
        <img 
          src="public/lovable-uploads/picnic image.jpg" 
          alt="Delicious cake" 
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-1/4 right-10 w-16 h-16 rounded-full bg-cake-pink/20 backdrop-blur-sm animate-float"></div>
      <div className="absolute bottom-1/4 left-10 w-24 h-24 rounded-full bg-cake-purple/20 backdrop-blur-sm animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 left-1/4 w-12 h-12 rounded-full bg-cake-yellow/20 backdrop-blur-sm animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-8 pt-20">
        <div className="max-w-3xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-montserrat">
            Delightful Cakes for Every Occasion
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Handcrafted with love in Durban, South Africa. Our cakes bring joy to your special moments, 
            one delicious bite at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products">
              <Button size="lg" className="bg-cake-pink hover:bg-cake-pink/90 text-foreground font-semibold px-8">
                Order Now <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10">
                About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
