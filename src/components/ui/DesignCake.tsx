import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ShoppingCart, Image as ImageIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { uploadProductImage, getProductImageUrl } from "@/lib/supabaseStorage";
import { Product } from "@/lib/types"; // Import Product type

const DesignCake: React.FC = () => {
  const [description, setDescription] = useState("");
  const [detailedInstructions, setDetailedInstructions] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [price, setPrice] = useState(350); // Base price in Rand
  const [size, setSize] = useState("medium");
  const [flavor, setFlavor] = useState("vanilla");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Generate a unique filename
      const fileName = `cake-reference-${Date.now()}-${file.name.replace(
        /\s+/g,
        "-"
      )}`;

      // Use the imported uploadProductImage function instead of direct Supabase calls
      const path = await uploadProductImage(file, fileName);

      if (!path) {
        throw new Error("Failed to upload image");
      }

      // Get the public URL for the uploaded image
      const imageUrl = await getProductImageUrl(path);
      setUploadedImageUrl(imageUrl);

      toast({
        title: "Image Uploaded",
        description: "Your reference image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description:
          "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddToCart = () => {
    if (!uploadedImageUrl) {
      toast({
        title: "No Reference Image",
        description: "Please upload a reference image first.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a brief description of your cake.",
        variant: "destructive",
      });
      return;
    }

    // Create a custom cake product
    const customCake: Product = {
      id: Date.now(), // Use number ID for custom cake
      name: `Custom Cake: ${description.substring(0, 30)}${
        description.length > 30 ? "..." : ""
      }`,
      description: `${description}${
        detailedInstructions
          ? `\n\nAdditional instructions: ${detailedInstructions}`
          : ""
      }`,
      price: price,
      category: "custom-cakes",
      image_url: uploadedImageUrl,
      popular: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_vegan: false, // Default value
      embedding: null,
      options: {
        size: size,
        flavor: flavor,
      },
    };

    addToCart(customCake, 1);

    toast({
      title: "Added to Cart",
      description: "Your custom cake has been added to your cart.",
    });

    // Navigate to cart
    navigate("/cart");
  };

  const updatePrice = (newSize: string) => {
    setSize(newSize);
    // Adjust price based on size
    switch (newSize) {
      case "small":
        setPrice(250);
        break;
      case "medium":
        setPrice(350);
        break;
      case "large":
        setPrice(450);
        break;
      case "extra-large":
        setPrice(550);
        break;
      default:
        setPrice(350);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 text-center">
          Design Your Dream Cake
        </h1>
        <p className="text-center text-muted-foreground mb-10">
          Upload a reference image and describe your perfect cake
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Design Controls */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="design" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="design">Cake Design</TabsTrigger>
                    <TabsTrigger value="options">Cake Options</TabsTrigger>
                  </TabsList>

                  <TabsContent value="design" className="space-y-4 pt-4">
                    <div>
                      <Label
                        htmlFor="description"
                        className="text-base font-medium"
                      >
                        Describe your cake
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the cake you want (e.g., A three-tier wedding cake with white fondant and gold accents)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-24 mt-2"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="instructions"
                        className="text-base font-medium"
                      >
                        Additional instructions (optional)
                      </Label>
                      <Textarea
                        id="instructions"
                        placeholder="Add more specific details about flavors, fillings, allergies, etc."
                        value={detailedInstructions}
                        onChange={(e) =>
                          setDetailedInstructions(e.target.value)
                        }
                        className="h-24 mt-2"
                      />
                    </div>

                    <div className="pt-2">
                      <Label className="text-base font-medium mb-2 block">
                        Upload a reference image
                      </Label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        onClick={handleUploadClick}
                        variant="outline"
                        className="w-full h-20 border-dashed flex flex-col items-center justify-center"
                        disabled={isUploading}
                      >
                        <Upload className="h-6 w-6 mb-2" />
                        {isUploading
                          ? "Uploading..."
                          : "Click to upload a cake image"}
                        <span className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, GIF up to 5MB
                        </span>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="options" className="space-y-6 pt-4">
                    <div>
                      <Label htmlFor="size" className="text-base font-medium">
                        Cake Size
                      </Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {["small", "medium", "large", "extra-large"].map(
                          (sizeOption) => (
                            <Button
                              key={sizeOption}
                              type="button"
                              variant={
                                size === sizeOption ? "default" : "outline"
                              }
                              onClick={() => updatePrice(sizeOption)}
                              className="capitalize"
                            >
                              {sizeOption}
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="flavor" className="text-base font-medium">
                        Cake Flavor
                      </Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[
                          "vanilla",
                          "chocolate",
                          "red velvet",
                          "carrot",
                          "lemon",
                          "marble",
                        ].map((flavorOption) => (
                          <Button
                            key={flavorOption}
                            type="button"
                            variant={
                              flavor === flavorOption ? "default" : "outline"
                            }
                            onClick={() => setFlavor(flavorOption)}
                            className="capitalize"
                          >
                            {flavorOption}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">
                        Price: R{price}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Price varies based on size and complexity
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div>
            <Card className="overflow-hidden h-full flex flex-col">
              <CardContent className="p-0 flex-grow flex flex-col">
                <div className="p-6 bg-muted/50 flex-grow flex flex-col items-center justify-center">
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="h-12 w-12 border-4 border-cake-pink border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-center text-muted-foreground">
                        Uploading your image...
                      </p>
                    </div>
                  ) : uploadedImageUrl ? (
                    <img
                      src={uploadedImageUrl}
                      alt="Reference cake design"
                      className="max-h-[400px] object-contain rounded-md"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="bg-muted rounded-full p-4 inline-flex mb-4">
                        <ImageIcon className="h-8 w-8 text-cake-pink" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Your reference image will appear here
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Upload a photo of a cake you like and our bakers will
                        use it as a reference
                      </p>
                    </div>
                  )}
                </div>

                {uploadedImageUrl && !isUploading && (
                  <div className="p-6 border-t">
                    <Button
                      onClick={handleAddToCart}
                      className="w-full bg-cake-pink hover:bg-cake-pink/90"
                      disabled={!description.trim()}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart - R{price}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-cake-pink/10 rounded-full p-3 inline-flex mb-4">
                <Upload className="h-6 w-6 text-cake-pink" />
              </div>
              <h3 className="text-lg font-medium mb-2">1. Upload</h3>
              <p className="text-muted-foreground">
                Upload a reference image of a cake you like and describe your
                requirements
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-cake-pink/10 rounded-full p-3 inline-flex mb-4">
                <ShoppingCart className="h-6 w-6 text-cake-pink" />
              </div>
              <h3 className="text-lg font-medium mb-2">2. Order</h3>
              <p className="text-muted-foreground">
                Add your custom cake to cart and complete your purchase
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-cake-pink/10 rounded-full p-3 inline-flex mb-4">
                <Send className="h-6 w-6 text-cake-pink" />
              </div>
              <h3 className="text-lg font-medium mb-2">3. Enjoy</h3>
              <p className="text-muted-foreground">
                Our bakers will create your cake exactly as designed and deliver
                it
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCake;
