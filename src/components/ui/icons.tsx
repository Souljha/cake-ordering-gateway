import React from 'react';

export const PaypalIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M7 11l5-7" />
      <path d="M21 11V6a2 2 0 0 0-2-2h-6.5l-1.5-2H5a2 2 0 0 0-2 2v10" />
      <path d="M3 17a2 2 0 0 0 2 2h6.5l1.5 2H19a2 2 0 0 0 2-2V6" />
    </svg>
  );
};

export const BitcoinIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m3.94.694-.347 1.969M7.116 5.251l-1.254-.221m1.254.221.346-1.97" />
    </svg>
  );
};