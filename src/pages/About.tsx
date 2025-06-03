import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="relative">
          {/* Floating decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-cake-pink/40 backdrop-blur-sm opacity-50 animate-float"></div>
          <div className="absolute top-2/3 left-1/4 w-24 h-24 rounded-full bg-cake-yellow/40 backdrop-blur-sm opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 relative">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-montserrat">About Cake A Day</h1>
              <p className="text-lg text-gray-600">
                Welcome to Cake A Day, your premier cake destination in Durban! We're passionate about creating the
                freshest, most delightful cakes for every occasion.
              </p>
              <p className="text-lg text-gray-600">
                At Cake A Day, we believe in the magic of freshly baked cakes. Every day, our skilled bakers craft
                exquisite cakes using only the finest ingredients, ensuring that each bite is a moment of pure joy.
              </p>
              <p className="text-lg text-gray-600">
                What sets us apart is our cake design feature, where you can describe the cake of your dreams, or upload
                an image, and our talented team will bring it to life. Whether it's a birthday, wedding, or for any special occasion.
              </p>
              <div className="pt-6">
                <Link to="/products">
                  <Button className="bg-cake-pink hover:bg-cake-pink/90 text-white font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                    Explore Our Cakes
                  </Button>
                </Link>
              </div>
              {/* Second floating circle positioned below the button */}
              <div className="absolute -bottom-20 right-2 w-40 h-40 rounded-full bg-cake-purple/40 backdrop-blur-sm opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
            <div className="relative">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cake-pink/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse z-10"></div>
              <img
                src="/lovable-uploads/flower cake.jpg"
                alt="Beautiful Flower Cake"
                className="rounded-lg shadow-2xl relative z-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;