import React from 'react';
import { Button, type ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface BankIDButtonProps extends Omit<ButtonProps, 'variant' | 'children'> {
  readonly mode?: 'login' | 'sign' | 'register';
  readonly testEnvironment?: boolean;
}

export function BankIDButton({ 
  mode = 'login', 
  testEnvironment = false,
  className,
  ...props 
}: BankIDButtonProps): JSX.Element {
  const modeText = {
    login: 'Logg inn med BankID',
    sign: 'Signer med BankID',
    register: 'Registrer med BankID'
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn(
        "relative bg-white hover:bg-gray-50 border-2 border-[#0067C5] text-[#0067C5] font-semibold shadow-md hover:shadow-lg transition-all duration-200",
        "min-w-[280px]",
        testEnvironment && "border-orange-500 text-orange-600",
        className
      )}
      aria-label={`${modeText[mode]}${testEnvironment ? ' (Test environment)' : ''}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        {/* BankID Logo */}
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="32" height="32" rx="4" fill={testEnvironment ? "#FF6B35" : "#0067C5"}/>
          <path 
            d="M8 12H12V16H8V12Z" 
            fill="white"
          />
          <path 
            d="M14 8H18V12H14V8Z" 
            fill="white"
          />
          <path 
            d="M20 12H24V16H20V12Z" 
            fill="white"
          />
          <path 
            d="M14 20H18V24H14V20Z" 
            fill="white"
          />
          <path 
            d="M12 16H20V20H12V16Z" 
            fill="white"
          />
        </svg>
        
        <span className="flex-1 text-left">
          {modeText[mode]}
        </span>
        
        {testEnvironment && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            TEST
          </span>
        )}
      </div>
    </Button>
  );
}

// Helper component for BankID status indicator
interface BankIDStatusProps {
  readonly status: 'idle' | 'pending' | 'authenticating' | 'success' | 'error';
  readonly message?: string;
}

export function BankIDStatus({ status, message }: BankIDStatusProps): JSX.Element {
  const statusConfig = {
    idle: { color: 'text-gray-500', icon: '⏸️', text: 'Ready for authentication' },
    pending: { color: 'text-blue-600', icon: '⏳', text: 'Opening BankID...' },
    authenticating: { color: 'text-blue-600', icon: '🔐', text: 'Authenticating...' },
    success: { color: 'text-green-600', icon: '✅', text: 'Authentication successful' },
    error: { color: 'text-red-600', icon: '❌', text: 'Authentication failed' }
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2 p-3 rounded-lg bg-gray-50", config.color)}>
      <span className="text-xl" aria-hidden="true">{config.icon}</span>
      <span className="text-sm font-medium">{message || config.text}</span>
    </div>
  );
}