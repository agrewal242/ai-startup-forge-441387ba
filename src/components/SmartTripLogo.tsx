import React from 'react';

interface SmartTripLogoProps {
  className?: string;
  size?: number;
}

export const SmartTripLogo: React.FC<SmartTripLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Location Pin Base */}
      <path
        d="M50 10C36.2 10 25 21.2 25 35C25 52.5 50 75 50 75C50 75 75 52.5 75 35C75 21.2 63.8 10 50 10Z"
        fill="url(#skyBlue)"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Airplane Tail integrated into pin */}
      <path
        d="M50 20L62 38L50 45L38 38L50 20Z"
        fill="url(#sunsetOrange)"
      />
      
      {/* Inner circle for pin center */}
      <circle
        cx="50"
        cy="35"
        r="8"
        fill="white"
        stroke="url(#navyBlue)"
        strokeWidth="2"
      />
      
      {/* AI Circuit Pattern - Bottom Left */}
      <g opacity="0.8">
        <circle cx="35" cy="50" r="2" fill="url(#sunsetOrange)" />
        <line x1="35" y1="50" x2="35" y2="58" stroke="url(#sunsetOrange)" strokeWidth="1.5" />
        <line x1="35" y1="50" x2="42" y2="50" stroke="url(#sunsetOrange)" strokeWidth="1.5" />
        <circle cx="35" cy="58" r="2" fill="url(#sunsetOrange)" />
        <circle cx="42" cy="50" r="2" fill="url(#sunsetOrange)" />
      </g>
      
      {/* AI Circuit Pattern - Bottom Right */}
      <g opacity="0.8">
        <circle cx="65" cy="50" r="2" fill="url(#skyBlue)" />
        <line x1="65" y1="50" x2="65" y2="58" stroke="url(#skyBlue)" strokeWidth="1.5" />
        <line x1="65" y1="50" x2="58" y2="50" stroke="url(#skyBlue)" strokeWidth="1.5" />
        <circle cx="65" cy="58" r="2" fill="url(#skyBlue)" />
        <circle cx="58" cy="50" r="2" fill="url(#skyBlue)" />
      </g>
      
      {/* AI Circuit Pattern - Top connections */}
      <g opacity="0.6">
        <line x1="42" y1="30" x2="48" y2="30" stroke="url(#sunsetOrange)" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="52" y1="30" x2="58" y2="30" stroke="url(#skyBlue)" strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="42" cy="30" r="1.5" fill="url(#sunsetOrange)" />
        <circle cx="58" cy="30" r="1.5" fill="url(#skyBlue)" />
      </g>
      
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="skyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FA3FF" />
          <stop offset="100%" stopColor="#3B8FE6" />
        </linearGradient>
        
        <linearGradient id="sunsetOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8A5C" />
          <stop offset="100%" stopColor="#FF7043" />
        </linearGradient>
        
        <linearGradient id="navyBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0E1B3C" />
          <stop offset="100%" stopColor="#1A2F5A" />
        </linearGradient>
      </defs>
    </svg>
  );
};
