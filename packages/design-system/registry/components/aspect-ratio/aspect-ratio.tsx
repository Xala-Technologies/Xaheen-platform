import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { tokens } from '../../core/universal-tokens';

const aspectRatioVariants = cva(
  'relative w-full overflow-hidden',
  {
    variants: {
      ratio: {
        square: 'aspect-square',
        video: 'aspect-video',
        '4/3': 'aspect-[4/3]',
        '3/2': 'aspect-[3/2]',
        '16/10': 'aspect-[16/10]',
        '21/9': 'aspect-[21/9]',
        '1/2': 'aspect-[1/2]',
        '2/3': 'aspect-[2/3]',
        '3/4': 'aspect-[3/4]',
        '9/16': 'aspect-[9/16]',
        portrait: 'aspect-[3/4]',
        landscape: 'aspect-[4/3]',
        ultrawide: 'aspect-[21/9]',
        golden: 'aspect-[1.618/1]',
      },
      rounded: {
        none: '',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
      border: {
        none: '',
        thin: 'border border-gray-200',
        medium: 'border-2 border-gray-200',
        thick: 'border-4 border-gray-200',
        accent: 'border-2 border-blue-200',
      },
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
      },
    },
    defaultVariants: {
      ratio: 'square',
      rounded: 'md',
      border: 'none',
      shadow: 'none',
    },
  }
);

interface AspectRatioProps extends VariantProps<typeof aspectRatioVariants> {
  readonly children: React.ReactNode;
  readonly customRatio?: number;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onResize?: (dimensions: { width: number; height: number }) => void;
  readonly maintainObjectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export const AspectRatio = ({
  children,
  ratio,
  customRatio,
  rounded,
  border,
  shadow,
  className,
  style,
  onResize,
  maintainObjectFit,
}: AspectRatioProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newDimensions = {
        width: rect.width,
        height: rect.height,
      };
      setDimensions(newDimensions);
      onResize?.(newDimensions);
    }
  }, [onResize]);

  useEffect(() => {
    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  const containerStyle: React.CSSProperties = {
    ...style,
    ...(customRatio && {
      aspectRatio: `${customRatio}`,
    }),
  };

  const childStyle: React.CSSProperties = maintainObjectFit
    ? {
        width: '100%',
        height: '100%',
        objectFit: maintainObjectFit,
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={aspectRatioVariants({
        ratio: customRatio ? undefined : ratio,
        rounded,
        border,
        shadow,
        className,
      })}
      style={containerStyle}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Apply object-fit styles to img, video, iframe elements
            if (
              maintainObjectFit &&
              (child.type === 'img' || child.type === 'video' || child.type === 'iframe')
            ) {
              return React.cloneElement(child, {
                style: { ...child.props.style, ...childStyle },
              });
            }
          }
          return child;
        })}
      </div>
    </div>
  );
};

interface ResponsiveAspectRatioProps {
  readonly children: React.ReactNode;
  readonly ratios: {
    readonly sm?: AspectRatioProps['ratio'] | number;
    readonly md?: AspectRatioProps['ratio'] | number;
    readonly lg?: AspectRatioProps['ratio'] | number;
    readonly xl?: AspectRatioProps['ratio'] | number;
  };
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const ResponsiveAspectRatio = ({
  children,
  ratios,
  className,
  style,
}: ResponsiveAspectRatioProps): JSX.Element => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1280 && ratios.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= 1024 && ratios.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= 768 && ratios.md) {
        setCurrentBreakpoint('md');
      } else if (ratios.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('md');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, [ratios]);

  const currentRatio = ratios[currentBreakpoint];
  const isCustomRatio = typeof currentRatio === 'number';

  return (
    <AspectRatio
      ratio={isCustomRatio ? undefined : (currentRatio as AspectRatioProps['ratio'])}
      customRatio={isCustomRatio ? (currentRatio as number) : undefined}
      className={className}
      style={style}
    >
      {children}
    </AspectRatio>
  );
};

interface MediaAspectRatioProps extends Omit<AspectRatioProps, 'children'> {
  readonly src: string;
  readonly alt?: string;
  readonly type?: 'image' | 'video';
  readonly poster?: string;
  readonly controls?: boolean;
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly muted?: boolean;
  readonly loading?: 'lazy' | 'eager';
  readonly placeholder?: React.ReactNode;
  readonly fallback?: React.ReactNode;
  readonly onLoad?: () => void;
  readonly onError?: (error: Event) => void;
}

export const MediaAspectRatio = ({
  src,
  alt,
  type = 'image',
  poster,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  loading = 'lazy',
  placeholder,
  fallback,
  onLoad,
  onError,
  maintainObjectFit = 'cover',
  ...aspectRatioProps
}: MediaAspectRatioProps): JSX.Element => {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const handleLoad = useCallback(() => {
    setMediaLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    setMediaError(true);
    onError?.(error.nativeEvent);
  }, [onError]);

  const renderMedia = (): React.ReactNode => {
    if (mediaError && fallback) {
      return fallback;
    }

    if (type === 'video') {
      return (
        <video
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          onLoadedData={handleLoad}
          onError={handleError}
          className="w-full h-full"
          style={{
            objectFit: maintainObjectFit,
          }}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <img
        src={src}
        alt={alt || ''}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full"
        style={{
          objectFit: maintainObjectFit,
        }}
      />
    );
  };

  return (
    <AspectRatio {...aspectRatioProps} maintainObjectFit={undefined}>
      {!mediaLoaded && !mediaError && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {placeholder}
        </div>
      )}
      {renderMedia()}
    </AspectRatio>
  );
};

interface PlaceholderAspectRatioProps extends AspectRatioProps {
  readonly icon?: React.ReactNode;
  readonly text?: string;
  readonly backgroundColor?: string;
  readonly textColor?: string;
}

export const PlaceholderAspectRatio = ({
  icon,
  text = 'Content placeholder',
  backgroundColor = 'bg-gray-100',
  textColor = 'text-gray-500',
  children,
  ...aspectRatioProps
}: PlaceholderAspectRatioProps): JSX.Element => {
  const defaultIcon = (
    <svg
      className="h-12 w-12 mx-auto text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <AspectRatio {...aspectRatioProps}>
      <div className={`flex flex-col items-center justify-center h-full ${backgroundColor}`}>
        {icon || defaultIcon}
        {text && (
          <p className={`mt-2 text-sm text-center ${textColor}`}>
            {text}
          </p>
        )}
        {children}
      </div>
    </AspectRatio>
  );
};

// Common aspect ratio presets
export const AspectRatioPresets = {
  Square: (props: Omit<AspectRatioProps, 'ratio'>) => (
    <AspectRatio {...props} ratio="square" />
  ),
  Video: (props: Omit<AspectRatioProps, 'ratio'>) => (
    <AspectRatio {...props} ratio="video" />
  ),
  Portrait: (props: Omit<AspectRatioProps, 'ratio'>) => (
    <AspectRatio {...props} ratio="portrait" />
  ),
  Landscape: (props: Omit<AspectRatioProps, 'ratio'>) => (
    <AspectRatio {...props} ratio="landscape" />
  ),
  Golden: (props: Omit<AspectRatioProps, 'ratio'>) => (
    <AspectRatio {...props} ratio="golden" />
  ),
  Ultrawide: (props: Omit<AspectRatioProps, 'ratio'>) => (
    <AspectRatio {...props} ratio="ultrawide" />
  ),
};

// Utility function to calculate aspect ratio from dimensions
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

// Utility function to get dimensions from aspect ratio and width
export const getDimensionsFromRatio = (
  ratio: number,
  width: number
): { width: number; height: number } => {
  return {
    width,
    height: width / ratio,
  };
};

// Utility function to get common aspect ratios
export const getCommonRatios = () => ({
  square: 1,
  video: 16 / 9,
  portrait: 3 / 4,
  landscape: 4 / 3,
  ultrawide: 21 / 9,
  golden: 1.618,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
  '16:10': 16 / 10,
  '21:9': 21 / 9,
  '1:2': 1 / 2,
  '2:3': 2 / 3,
  '9:16': 9 / 16,
});