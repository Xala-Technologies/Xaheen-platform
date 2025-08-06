/**
 * Grid Component - Responsive CSS Grid container
 * CLAUDE.md Compliant: 8pt grid spacing system
 * Responsive columns with breakpoint support
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  readonly gap?: number | string;
  readonly rowGap?: number | string;
  readonly colGap?: number | string;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = { default: 1 }, gap = 4, rowGap, colGap, style, ...props }, ref) => {
    const gridCols = React.useMemo(() => {
      const classes: string[] = [];
      
      if (cols.default) classes.push(`grid-cols-${cols.default}`);
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
      if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
      
      return classes.join(' ');
    }, [cols]);

    const gapClasses = React.useMemo(() => {
      const classes: string[] = [];
      
      if (gap !== undefined) {
        const gapValue = typeof gap === 'number' ? `gap-${gap}` : gap;
        classes.push(gapValue);
      }
      
      if (rowGap !== undefined) {
        const rowGapValue = typeof rowGap === 'number' ? `gap-y-${rowGap}` : rowGap;
        classes.push(rowGapValue);
      }
      
      if (colGap !== undefined) {
        const colGapValue = typeof colGap === 'number' ? `gap-x-${colGap}` : colGap;
        classes.push(colGapValue);
      }
      
      return classes.join(' ');
    }, [gap, rowGap, colGap]);

    return (
      <div
        ref={ref}
        className={cn('grid', gridCols, gapClasses, className)}
        style={style}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

export { Grid };