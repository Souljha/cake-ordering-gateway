import React, { useState, useEffect } from "react";
import { searchProducts, fetchFilteredProducts } from "@/lib/supabaseClient";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { Filter, Search, X } from "lucide-react";
import CakeCard from "@/components/CakeCard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database } from "@/lib/types";
import { getProductImageUrl } from "@/lib/supabaseStorage";

// Define the Product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  popular?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
  is_vegan?: boolean;
}
// Define the fetchProducts function
const fetchProducts = async (
  category: string | null = null
): Promise<Product[]> => {
  let query = supabase.from("products" as any).select("*");

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Ensure consistent image field naming
  return (data || []).map((product) => {
    const baseProduct = product as Record<string, any>;
    return {
      ...baseProduct,
      image_url: baseProduct.image_url || "", // Prefer image_url, fallback to empty string
    };
  }) as unknown as Product[];
};

const categories = [
  { value: "all", label: "All Products" },
  { value: "cakes", label: "Cakes" },
  { value: "cupcakes", label: "Cupcakes" },
  { value: "tarts", label: "Tarts" },
  { value: "pies", label: "Pies" },
  { value: "loaves", label: "Loaves" },
  { value: "specials", label: "Specials" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-100", label: "Under R100" },
  { value: "100-300", label: "R100 - R300" },
  { value: "300-500", label: "R300 - R500" },
  { value: "500+", label: "R500 & Above" },
];

const dietaryOptions = [
  { value: "all", label: "All" },
  { value: "vegan", label: "Vegan" },
];

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
      try {
        setIsLoading(true);
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get("category") || "all";
        const priceParam = params.get("price") || "all";
        const dietaryParam = params.get("dietary") || "all";
        const searchParam = params.get("search") || "";

        let data = await fetchProducts(
          categoryParam !== "all" ? categoryParam : null
        );

        // Format product images
        data = formatProductImages(data);

        // Filter by price range if selected
        if (priceParam !== "all") {
          const range = getPriceRange(priceParam);
          if (range) {
            data = data.filter(
              (product) =>
                product.price >= range.min &&
                (range.max === Infinity
                  ? product.price >= range.min
                  : product.price <= range.max)
            );
          }
        }

        // Filter by dietary preference if selected
        if (dietaryParam === "vegan") {
          data = data.filter((product) => product.is_vegan);
        }

        // Filter by search query if provided
        if (searchParam) {
          const searchLower = searchParam.toLowerCase();
          data = data.filter(
            (product) =>
              product.name.toLowerCase().includes(searchLower) ||
              product.description.toLowerCase().includes(searchLower)
          );
        }

        setProducts(data);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [location.search]); // Re-run when the URL search params change // Only re-run when the URL search params change

  // Update filters based on URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    const categoryParam = params.get("category");
    const priceParam = params.get("price");
    const dietaryParam = params.get("dietary");

    if (isLoading) return;

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (priceParam) setSelectedPriceRange(priceParam);
    if (dietaryParam) setSelectedDietary(dietaryParam);

    // Update active filters
    const newActiveFilters: string[] = [];
    if (searchParam) newActiveFilters.push(`Search: ${searchParam}`);
    if (categoryParam && categoryParam !== "all") {
      newActiveFilters.push(
        `Category: ${categories.find((c) => c.value === categoryParam)?.label}`
      );
    }
    if (priceParam && priceParam !== "all") {
      newActiveFilters.push(
        `Price: ${priceRanges.find((p) => p.value === priceParam)?.label}`
      );
    }
    if (dietaryParam === "vegan") {
      newActiveFilters.push("Dietary: Vegan");
    }

    setActiveFilters(newActiveFilters);
  }, [location.search, isLoading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const results = await searchProducts(searchQuery);
      // Map the results to match the Product interface
      // Assuming searchProducts returns items compatible with BaseProduct structure
      // which should have image_url. If it returns 'image', mapping is needed.
      // For now, let's assume it's compatible or searchProducts handles it.
      setProducts(results as unknown as Product[]);
      updateFilters({ search: searchQuery });
    } catch (error) {
      console.error("Error searching products:", error);
      setError("Failed to search products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams(location.search);

    // Update or add new params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value);
      } else {
        urlParams.delete(key);
      }
    });

    navigate({
      pathname: location.pathname,
      search: urlParams.toString(),
    });
  };

  const clearFilter = (filter: string) => {
    if (filter.startsWith("Search:")) {
      setSearchQuery("");
      updateFilters({ search: "" });
    } else if (filter.startsWith("Category:")) {
      setSelectedCategory("all");
      updateFilters({ category: "all" });
    } else if (filter.startsWith("Price:")) {
      setSelectedPriceRange("all");
      updateFilters({ price: "all" });
    } else if (filter.startsWith("Dietary:")) {
      setSelectedDietary("all");
      updateFilters({ dietary: "all" });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setSelectedDietary("all");
    navigate("/products");
  };

  // Update the getImageUrl function to use the correct bucket name and handle CORS
  const getImageUrl = (product: Product): string => {
    const imageUrl = product.image_url || "";

    if (!imageUrl) {
      return "/images/placeholder-cake.jpg";
    }

    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http")) {
      // Optional: Add download=true for Supabase URLs if needed for CORS,
      // but getProductImageUrl from supabaseStorage might already handle this.
      return getProductImageUrl(imageUrl);
    }

    // If it's a local path (e.g., /images/local-cake.jpg), return as is
    if (imageUrl.startsWith("/")) {
      return imageUrl;
    }

    // Assuming it's a relative path for Supabase storage that needs constructing
    // This logic might be better placed in or use a utility like getProductImageUrl from supabaseStorage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const bucketName = "product-images"; // Ensure this is your bucket
      const cleanImagePath = imageUrl.replace(/^\/+/, "");
      return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanImagePath}`;
    }

    return imageUrl; // Fallback
  };

  // Update the formatProductImages function
  const formatProductImages = (products: Product[]): Product[] => {
    return products.map((product) => ({
      ...product,
      image_url: getImageUrl(product),
    }));
  };

  // Add this function to your Products.tsx file
  const debugProductImages = (products: Product[]) => {
    console.log("=== DEBUG: PRODUCT IMAGES ===");
    products.forEach((product) => {
      console.log(`Product: ${product.name || "N/A"}`);
      console.log(`- ID: ${product.id}`);
      console.log(`- Raw image URL: ${product.image_url || "none"}`);
      console.log(`- Formatted URL: ${getImageUrl(product)}`);
      console.log("---");
    });
  };

  // Fix the useEffect hook
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get("category") || "all";
        const priceParam = params.get("price") || "all";
        const dietaryParam = params.get("dietary") || "all";
        const searchParam = params.get("search") || "";

        let data = await fetchProducts(
          categoryParam !== "all" ? categoryParam : null
        );

        // Format product images
        data = formatProductImages(data);

        // Debug the formatted products
        debugProductImages(data);

        // Filter by price range if selected
        if (priceParam !== "all") {
          const range = getPriceRange(priceParam);
          if (range) {
            data = data.filter(
              (product) =>
                product.price >= range.min &&
                (range.max === Infinity
                  ? product.price >= range.min
                  : product.price <= range.max)
            );
          }
        }

        // Filter by dietary preference if selected
        if (dietaryParam === "vegan") {
          data = data.filter((product) => product.is_vegan);
        }

        // Filter by search query if provided
        if (searchParam) {
          const searchLower = searchParam.toLowerCase();
          data = data.filter(
            (product) =>
              product.name.toLowerCase().includes(searchLower) ||
              product.description.toLowerCase().includes(searchLower)
          );
        }

        setProducts(data);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [location.search]); // Re-run when the URL search params change

  // Add this function to handle image loading errors
  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    console.log("Image failed to load:", event.currentTarget.src);
    event.currentTarget.src = "/images/placeholder-cake.jpg";
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cake-purple/10 to-transparent z-0"></div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Our Delicious Creations
          </h1>
          <p className="text-muted-foreground text-lg text-center max-w-3xl mx-auto mb-8">
            Browse our extensive collection of handcrafted cakes and sweet
            treats made with love in Durban, South Africa.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for cakes, cupcakes..."
                className="pl-10 h-12 w-full"
                id="search-input"
                name="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-0 top-0 h-full bg-cake-pink hover:bg-cake-pink/90 rounded-l-none"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters - Desktop */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Filters</h3>

                <div className="mb-6">
                  <h4 className="font-medium mb-2">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`category-${category.value}`}
                          name="category"
                          value={category.value}
                          checked={selectedCategory === category.value}
                          onChange={() => {
                            setSelectedCategory(category.value);
                            updateFilters({ category: category.value });
                          }}
                          className="mr-2 accent-cake-pink"
                        />
                        <label
                          htmlFor={`category-${category.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <div key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${range.value}`}
                          name="price"
                          value={range.value}
                          checked={selectedPriceRange === range.value}
                          onChange={() => {
                            setSelectedPriceRange(range.value);
                            updateFilters({ price: range.value });
                          }}
                          className="mr-2 accent-cake-pink"
                        />
                        <label
                          htmlFor={`price-${range.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {range.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-2">Dietary Options</h4>
                  <div className="space-y-2">
                    {dietaryOptions.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`dietary-${option.value}`}
                          name="dietary"
                          value={option.value}
                          checked={selectedDietary === option.value}
                          onChange={() => {
                            setSelectedDietary(option.value);
                            updateFilters({ dietary: option.value });
                          }}
                          className="mr-2 accent-cake-pink"
                        />
                        <label
                          htmlFor={`dietary-${option.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product List */}
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>{error}</div>
            ) : // Products Grid
            products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <CakeCard
                    key={product.id}
                    product={{
                      ...product, // image_url should be correctly set by formatProductImages
                      // Provide default values for required properties
                      popular: product.popular || false,
                      created_at: product.created_at
                        ? product.created_at.toString()
                        : new Date().toISOString(),
                      updated_at: product.updated_at
                        ? product.updated_at.toString()
                        : new Date().toISOString(),
                      is_vegan: product.is_vegan || false,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold mb-2">
                  No Products Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any products matching your filters.
                </p>
                <Button onClick={clearAllFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

function getPriceRange(
  range: string
): { min: number; max: number } | undefined {
  switch (range) {
    case "0-100":
      return { min: 0, max: 100 };
    case "100-300":
      return { min: 100, max: 300 };
    case "300-500":
      return { min: 300, max: 500 };
    case "500+":
      return { min: 500, max: Infinity };
    default:
      return undefined;
  }
}

export default ProductsPage;
