import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "@/components/ui/sonner"; 
import { TooltipProvider } from "@/components/ui/tooltip"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProductDetail from "./pages/ProductDetail";
import Index from "./pages/Index";
import EverydayCakePlan from '@/components/EverydayCake';
import CakeLoversPlan from '@/components/CakeLovers';
import SuperCakeLoversPlan from '@/components/SuperCakeLovers';
import Auth from "./pages/Auth";
import SignIn from "./pages/SignIn"; // Import the SignIn component
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile"; // Import Profile page
import OrdersPage from "./pages/Orders"; // Import Orders page
import { CartProvider } from "./contexts/CartContext";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import DesignCake from "./components/ui/DesignCake"; // Correct casing for import
import { Outlet } from "react-router-dom"; // Import Outlet for nested routes
import { ChatBotButton } from "@/components/ui/ChatBotButton"; // Import ChatBotButton
import AuthCallback from "@/pages/AuthCallback"; // Import AuthCallback for OAuth handling


const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/" element={<Index />} />
            <Route path="/everyday-cake-plan" element={<EverydayCakePlan />} />
            <Route path="/cake-lovers-plan" element={<CakeLoversPlan />} />
            <Route path="/super-cake-lovers-plan" element={<SuperCakeLoversPlan />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signin" element={<SignIn />} /> {/* Add route for SignIn */}
            <Route path="/auth/callback" element={<AuthCallback />} /> 
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/design-cake" element={<DesignCake />} /> {/* Add route for DesignCake */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Outlet />
          <ChatBotButton />
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
