import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "@/lib/Content"; // Corrected path
import { Product } from "@/lib/types"; // Corrected path
import { getProductImageUrl } from "@/lib/supabaseStorage"; // Corrected path
import Navbar from "@/components/Navbar"; // Corrected path
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button"; // Corrected path
import { useCart } from "../contexts/CartContext"; // Corrected path
import { useToast } from "@/hooks/use-toast"; // Corrected path

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
  
      try {
        setLoading(true);
        const data = await getProductById(id); // Keep only one call
  
        if (data) {
          console.log("Product data:", data);
          // Process the image URL properly
          const imageUrl = data.image_url || ''; // data.image does not exist on Product type
          console.log("Image URL:", imageUrl);
  
          setProduct({
            ...data,
            image_url: imageUrl // Ensure product state uses the processed URL
          });
          // Initialize total price based on fetched product price and initial quantity (1)
          // Ensure data.price is not null/undefined before using it
          setTotalPrice(data.price ? data.price * quantity : 0); 
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to fetch product");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProduct();
  }, [id]); // Remove quantity from dependency array to avoid infinite loops // Removed quantity from dependency array as it's initialized to 1

  useEffect(() => {
    // Update total price whenever quantity or product changes
    if (product) {
      setTotalPrice(product.price * quantity);
    }
  }, [quantity, product]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
      // No need to setTotalPrice here, the useEffect handles it
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Correctly construct a CartItem if needed elsewhere,
      // though addToCart takes product and quantity separately.
      // const cartItem: CartItem = { 
      //   ...product, // Spread product properties
      //   quantity 
      // };
      
      // Pass the product and quantity separately as required by the addToCart function
      addToCart(product, quantity);
      
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 pt-32 pb-20">
        <Link
          to="/products"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <img
                src={getProductImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(
                    `Failed to load image for ${product.name}:`,
                    product.image_url
                  );
                  e.currentTarget.src = "/placeholder.svg"; 
                }}
              />
            </div>

            {product.popular && (
              <div className="absolute top-4 left-4 bg-cake-pink/90 text-white text-sm font-medium px-3 py-1 rounded-full">
                Popular
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {product.name}
            </h1>

            <div className="mb-6">
              <p className="text-2xl font-semibold text-cake-pink">
                R{totalPrice.toFixed(2)}
              </p>
            </div>

            <div className="prose prose-sm max-w-none mb-8 text-muted-foreground">
              <p>{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="text-sm font-medium block mb-2">
                Quantity:
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 rounded-l-md flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-16 h-10 text-center border-y border-input focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 rounded-r-md flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full bg-cake-pink hover:bg-cake-pink/90 mb-4"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>

            {/* Additional Info */}
            <div className="border-t pt-6 mt-8">
              <h3 className="font-semibold mb-3">Additional Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Made fresh to order in Durban, South Africa</li>
                <li>Delivery options available (R150 flat rate)</li>
                <li>
                  Customization options available - contact us for details
                </li>
                <li>Allow 48 hours for preparation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
