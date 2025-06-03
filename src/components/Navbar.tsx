import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Greeting from '@/components/Greeting';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '@/contexts/CartContext'; // Added missing import

const NavLink = ({ to, children, isScrolled, current }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      current === to
        ? 'text-cake-pink'
        : isScrolled
        ? 'text-foreground hover:text-cake-pink'
        : 'text-white hover:text-white/80'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children }) => (
  <Link
    to={to}
    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
  >
    {children}
  </Link>
);

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { getCartItemCount } = useCart(); // Get cart item count function

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Logo 
            size="lg"
            textClassName={isScrolled ? '' : 'md:text-white'} 
            showText={false}
          />

          {/* Mobile Greeting - Added between logo and menu button */}
          <div className="md:hidden flex-1 mx-2">
            <Greeting />
          </div>

          {/* Desktop Greeting */}
          <div className="hidden md:block">
            <Greeting />
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" isScrolled={isScrolled} current={location.pathname}>Home</NavLink>
            <NavLink to="/products" isScrolled={isScrolled} current={location.pathname}>Products</NavLink>
            <NavLink to="/about" isScrolled={isScrolled} current={location.pathname}>About</NavLink>
            <NavLink to="/contact" isScrolled={isScrolled} current={location.pathname}>Contact</NavLink>
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className={`relative ${!isScrolled ? 'text-white hover:bg-white/20' : ''}`}>
                <ShoppingCart size={20} />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cake-pink text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={!isScrolled ? 'text-white hover:bg-white/20' : ''}>
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer w-full">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/signin">
                <Button className="bg-cake-pink hover:bg-cake-pink/90 text-foreground font-medium">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <button 
            className="md:hidden" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? 
              <X size={24} className={isScrolled ? 'text-foreground' : 'text-white'} /> : 
              <Menu size={24} className={isScrolled ? 'text-foreground' : 'text-white'} />
            }
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background animate-slide-up">
          <div className="pt-2 pb-4 px-4 space-y-1">
            <MobileNavLink to="/">Home</MobileNavLink>
            <MobileNavLink to="/products">Products</MobileNavLink>
            <MobileNavLink to="/about">About</MobileNavLink>
            <MobileNavLink to="/contact">Contact</MobileNavLink>
            
            {/* Added My Profile and My Orders links for mobile */}
            {user && (
              <>
                <MobileNavLink to="/profile">My Profile</MobileNavLink>
                <MobileNavLink to="/orders">My Orders</MobileNavLink>
              </>
            )}
            
            <div className="flex justify-between mt-4 pt-4 border-t">
              <Link to="/cart" className="flex items-center gap-2 px-3 py-2 rounded-md text-foreground relative">
                <ShoppingCart size={20} />
                <span>Cart</span>
                {getCartItemCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-cake-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
              {user ? (
                <Button 
                  onClick={signOut}
                  variant="destructive"
                  className="text-foreground"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/signin">
                  <Button className="bg-cake-pink hover:bg-cake-pink/90 text-foreground">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;