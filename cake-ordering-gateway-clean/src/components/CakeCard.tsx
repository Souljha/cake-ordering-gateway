import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/lib/types';
import { getProductImageUrl } from '@/lib/supabaseStorage';

interface CakeCardProps {
  product: Product;
}

const CakeCard: React.FC<CakeCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Use the imported function to get the proper image URL
    const loadImageUrl = async () => {
      try {
        if (product.image_url) {
          const url = await getProductImageUrl(product.image_url);
          setImageUrl(url);
        }
      } catch (error) {
        console.error("Error loading image URL:", error);
      }
    };
    
    loadImageUrl();
  }, [product.image_url]);
  
  const handleAddToCart = () => {
    // Pass the entire product object and quantity as separate parameters
    // This matches the expected signature of addToCart(product: Product, quantity: number)
    addToCart(product, 1);
  };

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/images/placeholder-cake.jpg";
  };

  return (
    <div className="bg-white dark:bg-card rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block relative pt-[75%]"> {/* 4:3 aspect ratio container */}
        <img 
          src={imageUrl || "/images/placeholder-cake.jpg"} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105"
          onError={handleImageError}
        />
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-lg mb-1 hover:text-cake-pink transition-colors">{product.name}</h3>
        </Link>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="font-semibold text-cake-pink">R{product.price.toFixed(2)}</span>
          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="bg-cake-pink hover:bg-cake-pink/90"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CakeCard;