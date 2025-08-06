/**
 * Chart Component - Professional Data Visualization
 * CLAUDE.md Compliant: Professional styling and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// CHART VARIANTS
// =============================================================================

const chartVariants = cva(
  [
    'relative w-full rounded-lg border border-border bg-background',
    'shadow-sm p-6',
    'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2'
  ],
  {
    variants: {
      variant: {
        default: 'bg-background border-border',
        card: 'bg-card border-border shadow-md',
        minimal: 'bg-transparent border-0 shadow-none p-4'
      },
      size: {
        sm: 'p-4 h-48',
        md: 'p-6 h-64',
        lg: 'p-8 h-80',
        xl: 'p-10 h-96'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const chartHeaderVariants = cva([
  'mb-6 pb-2 border-b border-border'
]);

const legendVariants = cva([
  'flex flex-wrap items-center gap-4 mt-4',
  'text-sm text-muted-foreground'
]);

const legendItemVariants = cva([
  'flex items-center gap-2'
]);

const tooltipVariants = cva([
  'absolute z-50 px-3 py-2',
  'bg-popover text-popover-foreground',
  'border border-border rounded-md shadow-lg',
  'text-sm font-medium',
  'pointer-events-none',
  'transform -translate-x-1/2 -translate-y-full',
  'opacity-0 transition-opacity duration-200'
], {
  variants: {
    visible: {
      true: 'opacity-100',
      false: 'opacity-0'
    }
  }
});

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ChartDataPoint {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
  readonly metadata?: Record<string, any>;
}

export interface ChartSeries {
  readonly name: string;
  readonly data: readonly ChartDataPoint[];
  readonly color?: string;
  readonly type?: 'line' | 'bar' | 'area';
}

export interface ChartProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof chartVariants> {
  readonly data?: readonly ChartDataPoint[];
  readonly series?: readonly ChartSeries[];
  readonly type?: 'bar' | 'line' | 'area' | 'pie' | 'donut';
  readonly title?: string;
  readonly description?: string;
  readonly xAxisLabel?: string;
  readonly yAxisLabel?: string;
  readonly showLegend?: boolean;
  readonly showTooltip?: boolean;
  readonly showGrid?: boolean;
  readonly showAxes?: boolean;
  readonly animated?: boolean;
  readonly colors?: readonly string[];
  readonly onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void;
  readonly ariaLabel?: string;
  readonly loading?: boolean;
  readonly error?: string;
  readonly emptyMessage?: string;
}

export interface TooltipData {
  readonly x: number;
  readonly y: number;
  readonly content: string;
  readonly visible: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6b7280'
];

const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const calculateBarWidth = (containerWidth: number, dataLength: number, padding = 0.2): number => {
  const availableWidth = containerWidth - 60; // Account for margins
  const barSpacing = availableWidth / dataLength;
  return Math.max(barSpacing * (1 - padding), 8); // Minimum 8px width
};

const calculateBarHeight = (value: number, maxValue: number, containerHeight: number): number => {
  const chartHeight = containerHeight - 80; // Account for margins and axes
  return Math.max((value / maxValue) * chartHeight, 1); // Minimum 1px height
};

// =============================================================================
// CHART COMPONENTS
// =============================================================================

const ChartHeader: React.FC<{
  readonly title?: string;
  readonly description?: string;
}> = ({ title, description }) => {
  if (!title && !description) return null;
  
  return (
    <div className={chartHeaderVariants()}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

const ChartLegend: React.FC<{
  readonly data: readonly ChartDataPoint[];
  readonly colors: readonly string[];
}> = ({ data, colors }) => (
  <div className={legendVariants()}>
    {data.map((item, index) => (
      <div key={item.label} className={legendItemVariants()}>
        <div
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: item.color || colors[index % colors.length] }}
          aria-hidden="true"
        />
        <span>{item.label}</span>
      </div>
    ))}
  </div>
);

const ChartTooltip: React.FC<TooltipData> = ({ x, y, content, visible }) => (
  <div
    className={cn(tooltipVariants({ visible }))}
    style={{ left: x, top: y }}
    role="tooltip"
    aria-hidden={!visible}
  >
    {content}
  </div>
);

const BarChart: React.FC<{
  readonly data: readonly ChartDataPoint[];
  readonly width: number;
  readonly height: number;
  readonly colors: readonly string[];
  readonly showGrid: boolean;
  readonly showAxes: boolean;
  readonly animated: boolean;
  readonly onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void;
  readonly onTooltip: (tooltip: TooltipData) => void;
}> = ({ 
  data, 
  width, 
  height, 
  colors, 
  showGrid, 
  showAxes, 
  animated,
  onDataPointClick,
  onTooltip 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = calculateBarWidth(width, data.length);
  const chartHeight = height - 80;
  const chartWidth = width - 60;
  
  const handleBarClick = useCallback((dataPoint: ChartDataPoint, index: number) => {
    onDataPointClick?.(dataPoint, index);
  }, [onDataPointClick]);
  
  const handleBarHover = useCallback((event: React.MouseEvent, dataPoint: ChartDataPoint) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${dataPoint.label}: ${formatValue(dataPoint.value)}`,
      visible: true
    });
  }, [onTooltip]);
  
  const handleBarLeave = useCallback(() => {
    onTooltip({ x: 0, y: 0, content: '', visible: false });
  }, [onTooltip]);
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      role="img"
      aria-label="Bar chart"
    >
      {/* Grid lines */}
      {showGrid && (
        <g className="opacity-20">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={30}
              y1={30 + chartHeight * (1 - ratio)}
              x2={30 + chartWidth}
              y2={30 + chartHeight * (1 - ratio)}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </g>
      )}
      
      {/* Y-axis */}
      {showAxes && (
        <g className="text-xs fill-current text-muted-foreground">
          <line x1={30} y1={30} x2={30} y2={30 + chartHeight} stroke="currentColor" strokeWidth="1" />
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <text
              key={ratio}
              x={25}
              y={35 + chartHeight * (1 - ratio)}
              textAnchor="end"
              dominantBaseline="central"
            >
              {formatValue(maxValue * ratio)}
            </text>
          ))}
        </g>
      )}
      
      {/* X-axis */}
      {showAxes && (
        <g className="text-xs fill-current text-muted-foreground">
          <line 
            x1={30} 
            y1={30 + chartHeight} 
            x2={30 + chartWidth} 
            y2={30 + chartHeight} 
            stroke="currentColor" 
            strokeWidth="1" 
          />
        </g>
      )}
      
      {/* Bars */}
      <g>
        {data.map((dataPoint, index) => {
          const barHeight = calculateBarHeight(dataPoint.value, maxValue, height);
          const x = 30 + (chartWidth / data.length) * index + (chartWidth / data.length - barWidth) / 2;
          const y = 30 + chartHeight - barHeight;
          const color = dataPoint.color || colors[index % colors.length];
          
          return (
            <g key={dataPoint.label}>
              <rect
                x={x}
                y={animated ? 30 + chartHeight : y}
                width={barWidth}
                height={animated ? 0 : barHeight}
                fill={color}
                className={cn(
                  'cursor-pointer transition-all duration-500 hover:opacity-80',
                  animated && 'animate-[slideUp_0.8s_ease-out_forwards]'
                )}
                style={{
                  animationDelay: animated ? `${index * 0.1}s` : '0s',
                  animationFillMode: 'forwards'
                }}
                onClick={() => handleBarClick(dataPoint, index)}
                onMouseEnter={(e) => handleBarHover(e, dataPoint)}
                onMouseLeave={handleBarLeave}
                onFocus={(e) => handleBarHover(e, dataPoint)}
                onBlur={handleBarLeave}
                tabIndex={onDataPointClick ? 0 : -1}
                role={onDataPointClick ? 'button' : undefined}
                aria-label={`${dataPoint.label}: ${formatValue(dataPoint.value)}`}
              />
              
              {/* X-axis labels */}
              {showAxes && (
                <text
                  x={x + barWidth / 2}
                  y={35 + chartHeight + 15}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs fill-current text-muted-foreground"
                >
                  {dataPoint.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const PieChart: React.FC<{
  readonly data: readonly ChartDataPoint[];
  readonly width: number;
  readonly height: number;
  readonly colors: readonly string[];
  readonly animated: boolean;
  readonly onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void;
  readonly onTooltip: (tooltip: TooltipData) => void;
}> = ({ 
  data, 
  width, 
  height, 
  colors, 
  animated,
  onDataPointClick,
  onTooltip 
}) => {
  const radius = Math.min(width, height) / 2 - 40;
  const centerX = width / 2;
  const centerY = height / 2;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  let cumulativeAngle = -Math.PI / 2; // Start from top
  
  const handleSliceClick = useCallback((dataPoint: ChartDataPoint, index: number) => {
    onDataPointClick?.(dataPoint, index);
  }, [onDataPointClick]);
  
  const handleSliceHover = useCallback((event: React.MouseEvent, dataPoint: ChartDataPoint) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percentage = ((dataPoint.value / total) * 100).toFixed(1);
    onTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      content: `${dataPoint.label}: ${formatValue(dataPoint.value)} (${percentage}%)`,
      visible: true
    });
  }, [onTooltip, total]);
  
  const handleSliceLeave = useCallback(() => {
    onTooltip({ x: 0, y: 0, content: '', visible: false });
  }, [onTooltip]);
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      role="img"
      aria-label="Pie chart"
    >
      {data.map((dataPoint, index) => {
        const angle = (dataPoint.value / total) * 2 * Math.PI;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArc = angle > Math.PI ? 1 : 0;
        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');
        
        const color = dataPoint.color || colors[index % colors.length];
        
        cumulativeAngle += angle;
        
        return (
          <path
            key={dataPoint.label}
            d={pathData}
            fill={color}
            stroke="white"
            strokeWidth="2"
            className={cn(
              'cursor-pointer transition-all duration-300 hover:opacity-80',
              animated && 'animate-[fadeIn_0.6s_ease-out_forwards]'
            )}
            style={{
              animationDelay: animated ? `${index * 0.1}s` : '0s',
              opacity: animated ? 0 : 1
            }}
            onClick={() => handleSliceClick(dataPoint, index)}
            onMouseEnter={(e) => handleSliceHover(e, dataPoint)}
            onMouseLeave={handleSliceLeave}
            onFocus={(e) => handleSliceHover(e, dataPoint)}
            onBlur={handleSliceLeave}
            tabIndex={onDataPointClick ? 0 : -1}
            role={onDataPointClick ? 'button' : undefined}
            aria-label={`${dataPoint.label}: ${formatValue(dataPoint.value)} (${((dataPoint.value / total) * 100).toFixed(1)}%)`}
          />
        );
      })}
    </svg>
  );
};

// =============================================================================
// MAIN CHART COMPONENT
// =============================================================================

export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(({
  className,
  variant,
  size,
  data = [],
  series,
  type = 'bar',
  title,
  description,
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showAxes = true,
  animated = true,
  colors = DEFAULT_COLORS,
  onDataPointClick,
  ariaLabel,
  loading = false,
  error,
  emptyMessage = 'No data available',
  ...props
}, ref) => {
  const [tooltip, setTooltip] = useState<TooltipData>({
    x: 0,
    y: 0,
    content: '',
    visible: false
  });
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: width - 48, // Account for padding
          height: size === 'sm' ? 192 : size === 'lg' ? 320 : size === 'xl' ? 384 : 256
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    updateDimensions();

    return () => resizeObserver.disconnect();
  }, [size]);

  // Handle tooltip updates
  const handleTooltip = useCallback((tooltipData: TooltipData) => {
    if (!showTooltip) return;
    setTooltip(tooltipData);
  }, [showTooltip]);

  // Render loading state
  if (loading) {
    return (
      <div
        ref={ref}
        className={cn(chartVariants({ variant, size }), className)}
        role="status"
        aria-label="Loading chart data"
        {...props}
      >
        <ChartHeader title={title} description={description} />
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading chart data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        ref={ref}
        className={cn(chartVariants({ variant, size }), className)}
        role="alert"
        aria-label="Chart error"
        {...props}
      >
        <ChartHeader title={title} description={description} />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 text-destructive">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <p className="text-sm text-destructive font-medium">Error loading chart</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <div
        ref={ref}
        className={cn(chartVariants({ variant, size }), className)}
        role="status"
        aria-label="No chart data"
        {...props}
      >
        <ChartHeader title={title} description={description} />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref || containerRef}
      className={cn(chartVariants({ variant, size }), className)}
      role="region"
      aria-label={ariaLabel || `${type} chart`}
      {...props}
    >
      <ChartHeader title={title} description={description} />
      
      <div className="relative">
        {type === 'bar' && (
          <BarChart
            data={data}
            width={dimensions.width}
            height={dimensions.height}
            colors={colors}
            showGrid={showGrid}
            showAxes={showAxes}
            animated={animated}
            onDataPointClick={onDataPointClick}
            onTooltip={handleTooltip}
          />
        )}
        
        {(type === 'pie' || type === 'donut') && (
          <PieChart
            data={data}
            width={dimensions.width}
            height={dimensions.height}
            colors={colors}
            animated={animated}
            onDataPointClick={onDataPointClick}
            onTooltip={handleTooltip}
          />
        )}
        
        {showTooltip && <ChartTooltip {...tooltip} />}
      </div>
      
      {showLegend && <ChartLegend data={data} colors={colors} />}
      
      {/* Axis labels */}
      {(xAxisLabel || yAxisLabel) && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {xAxisLabel && <div className="mt-2">{xAxisLabel}</div>}
          {yAxisLabel && (
            <div 
              className="absolute left-2 top-1/2 -rotate-90 transform -translate-y-1/2"
              style={{ transformOrigin: 'center' }}
            >
              {yAxisLabel}
            </div>
          )}
        </div>
      )}
      
      {/* Screen reader data table */}
      <table className="sr-only">
        <caption>Chart data in tabular format</caption>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((dataPoint, index) => (
            <tr key={index}>
              <td>{dataPoint.label}</td>
              <td>{dataPoint.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

Chart.displayName = 'Chart';

// Export types and variants
export type { VariantProps, ChartDataPoint, ChartSeries };
export { chartVariants };