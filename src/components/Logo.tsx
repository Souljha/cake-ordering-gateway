import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  textClassName = '',
  size = 'md',
  showText = false
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/lovable-uploads/68760ac8-ff16-4532-815c-85929b52d119.png" 
        alt="Cake A Day Logo" 
        className={`${sizeClasses[size]} transition-transform hover:scale-105`}
      />
      {showText && (
        <span className={`font-montserrat font-semibold text-foreground ${
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-2xl' : 
          size === 'lg' ? 'text-4xl' : 'text-5xl'
        } ${textClassName}`}>
          Cake<span className="text-cake-pink">A</span>Day
        </span>
      )}
    </Link>
  );
};

export default Logo;