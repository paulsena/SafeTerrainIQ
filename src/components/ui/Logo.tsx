import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function Logo({ size = 48, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Outer App Icon Shape */}
      <rect width="120" height="120" rx="28" fill="var(--color-deep-slate, #1a2d3d)" />
      
      <g transform="translate(15, 15)">
        {/* The Shield Backing */}
        <path 
          d="M45 5 L85 15 V45 C85 70 45 90 45 90 C45 90 5 70 5 45 V15 L45 5Z" 
          fill="var(--color-mid-slate, #243d50)" 
          stroke="var(--color-light-slate, #2d4a5e)" 
          strokeWidth="2"
        />
        
        {/* Topographic Lines representing the Mountain inside the shield */}
        <path d="M5 55 Q 30 35, 45 45 T 85 30" stroke="var(--color-sage, #F97D00)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M15 70 Q 35 50, 50 60 T 75 45" stroke="var(--color-sage, #F97D00)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M25 85 Q 40 65, 55 75 T 65 60" stroke="var(--color-sage, #F97D00)" strokeWidth="4" strokeLinecap="round" fill="none" />
        
        {/* Data/IQ Nodes on the topography */}
        <circle cx="30" cy="45" r="4" fill="#ffffff" />
        <circle cx="50" cy="60" r="4" fill="#ffffff" />
        <circle cx="75" cy="45" r="4" fill="#ffffff" />
        
        {/* Connecting network lines */}
        <path d="M30 45 L50 60 L75 45" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" fill="none"/>
      </g>
    </svg>
  );
}
