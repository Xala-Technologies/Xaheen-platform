
import React, { useState, useCallback } from 'react';

interface ButtonProps {
  readonly title: string;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary';
}

export const Button = ({ 
  title, 
  onClick, 
  variant = 'primary' 
}: ButtonProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = useCallback(() => {
    setIsLoading(true);
    onClick?.();
    setTimeout(() => setIsLoading(false), 1000);
  }, [onClick]);

  try {
    return (
      <button
        onClick={handleClick}
        className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={title}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : title}
      </button>
    );
  } catch (error) {
    console.error('Button error:', error);
    return <div className="text-red-500">Error rendering button</div>;
  }
};
