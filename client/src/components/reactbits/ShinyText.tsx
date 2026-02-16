import React, { type CSSProperties, type ReactNode } from 'react';

export interface ShinyTextProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
  speed?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function ShinyText({
  children,
  className = '',
  shimmerWidth = 150,
  speed = 3,
  disabled = false,
  style: externalStyle,
}: ShinyTextProps) {
  const style: CSSProperties = disabled
    ? {}
    : {
        backgroundImage: `linear-gradient(
          120deg,
          currentColor 0%,
          currentColor 35%,
          rgba(255, 255, 255, 0.95) 48%,
          rgba(255, 255, 255, 1) 50%,
          rgba(255, 255, 255, 0.95) 52%,
          currentColor 65%,
          currentColor 100%
        )`,
        backgroundSize: `${shimmerWidth}% 100%`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundRepeat: 'no-repeat',
        animation: `shiny-text-slide ${speed}s ease-in-out infinite`,
      };

  return (
    <>
      <style>{`
        @keyframes shiny-text-slide {
          0% { background-position: -100% 0; }
          40% { background-position: 200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <span className={className} style={{ ...style, ...externalStyle }}>
        {children}
      </span>
    </>
  );
}
