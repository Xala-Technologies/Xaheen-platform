import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { createPortal } from 'react-dom';
import { tokens } from '../../core/universal-tokens';

const toastVariants = cva(
  'relative flex items-start gap-3 p-4 rounded-xl shadow-lg border pointer-events-auto transition-all duration-300 ease-out max-w-sm w-full',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 text-gray-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
      },
      position: {
        'top-left': 'animate-slide-in-left',
        'top-right': 'animate-slide-in-right',
        'top-center': 'animate-slide-in-down',
        'bottom-left': 'animate-slide-in-left',
        'bottom-right': 'animate-slide-in-right',
        'bottom-center': 'animate-slide-in-up',
      },
      state: {
        entering: 'opacity-0 scale-95',
        entered: 'opacity-100 scale-100',
        exiting: 'opacity-0 scale-95 translate-y-[-8px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top-right',
      state: 'entering',
    },
  }
);

const containerVariants = cva(
  'fixed z-50 flex flex-col gap-2 max-h-screen overflow-hidden pointer-events-none p-4',
  {
    variants: {
      position: {
        'top-left': 'top-0 left-0',
        'top-right': 'top-0 right-0',
        'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
        'bottom-left': 'bottom-0 left-0',
        'bottom-right': 'bottom-0 right-0',
        'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
      },
    },
    defaultVariants: {
      position: 'top-right',
    },
  }
);

interface Toast {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  readonly duration?: number;
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
  readonly onClose?: () => void;
  readonly persistent?: boolean;
}

interface ToastContextValue {
  readonly toasts: readonly Toast[];
  readonly addToast: (toast: Omit<Toast, 'id'>) => string;
  readonly removeToast: (id: string) => void;
  readonly clearAllToasts: () => void;
  readonly position: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  readonly setPosition: (position: ToastContextValue['position']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  readonly children: React.ReactNode;
  readonly position?: ToastContextValue['position'];
  readonly maxToasts?: number;
}

export const ToastProvider = ({ 
  children, 
  position: initialPosition = 'top-right',
  maxToasts = 5 
}: ToastProviderProps): JSX.Element => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<ToastContextValue['position']>(initialPosition);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };

    setToasts(prevToasts => {
      const updatedToasts = [...prevToasts, newToast];
      if (updatedToasts.length > maxToasts) {
        const removed = updatedToasts.splice(0, updatedToasts.length - maxToasts);
        removed.forEach(removedToast => {
          const timer = timersRef.current.get(removedToast.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(removedToast.id);
          }
        });
      }
      return updatedToasts;
    });

    // Auto-remove toast after duration
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    position,
    setPosition,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer = (): JSX.Element => {
  const { toasts, position } = useToast();

  if (toasts.length === 0) return <></>;

  return createPortal(
    <div className={containerVariants({ position })}>
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} position={position} />
      ))}
    </div>,
    document.body
  );
};

interface ToastComponentProps {
  readonly toast: Toast;
  readonly position: ToastContextValue['position'];
}

const ToastComponent = ({ toast, position }: ToastComponentProps): JSX.Element => {
  const { removeToast } = useToast();
  const [state, setState] = useState<'entering' | 'entered' | 'exiting'>('entering');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Enter animation
    timeoutRef.current = setTimeout(() => {
      setState('entered');
    }, 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    setState('exiting');
    setTimeout(() => {
      removeToast(toast.id);
      toast.onClose?.();
    }, 150);
  }, [removeToast, toast.id, toast.onClose]);

  const getIcon = (): JSX.Element => {
    switch (toast.variant) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={toastVariants({ variant: toast.variant, position, state })}
    >
      {getIcon()}
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{toast.title}</div>
        {toast.description && (
          <div className="text-sm opacity-75 mt-1">{toast.description}</div>
        )}
        
        {toast.action && (
          <div className="mt-3">
            <button
              onClick={() => {
                toast.action?.onClick();
                handleClose();
              }}
              className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleClose}
        className="ml-auto flex-shrink-0 h-8 w-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <style jsx>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 300ms ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 300ms ease-out;
        }

        .animate-slide-in-up {
          animation: slide-in-up 300ms ease-out;
        }

        .animate-slide-in-down {
          animation: slide-in-down 300ms ease-out;
        }
      `}</style>
    </div>
  );
};

// Convenience hook for common toast types
export const useToastActions = () => {
  const { addToast } = useToast();

  const success = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, title, description, variant: 'success' });
  }, [addToast]);

  const error = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, title, description, variant: 'error' });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, title, description, variant: 'warning' });
  }, [addToast]);

  const info = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, title, description, variant: 'info' });
  }, [addToast]);

  const promise = useCallback(<T,>(
    promise: Promise<T>,
    {
      loading,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    const toastId = addToast({
      title: loading,
      variant: 'info',
      persistent: true,
    });

    promise
      .then((data) => {
        const message = typeof successMessage === 'function' ? successMessage(data) : successMessage;
        addToast({
          title: message,
          variant: 'success',
        });
      })
      .catch((error) => {
        const message = typeof errorMessage === 'function' ? errorMessage(error) : errorMessage;
        addToast({
          title: message,
          variant: 'error',
        });
      });

    return promise;
  }, [addToast]);

  return { success, error, warning, info, promise };
};