# Card Component (CVA Pattern)

## Purpose
The `Card` component is a flexible, composable container for grouping related content. It uses **Class Variance Authority (CVA)** for consistent styling and supports multiple variants, padding options, and interactive states. The component is fully SSR-compatible and uses semantic Tailwind CSS classes.

## Usage
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@xala-technologies/ui-system';

<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

## Props (CVA-Based)
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card visual style variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  /** Padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Interactive card with click handler */
  interactive?: boolean;
  /** Children content */
  children: React.ReactNode;
}
```

## CVA Implementation
The Card component uses **Class Variance Authority (CVA)** for styling variants:

```typescript
// CVA variant definition
const cardVariants = cva(
  // Base classes using semantic tokens
  'relative block rounded-lg border bg-card text-card-foreground transition-all duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default: 'border-border bg-card shadow-sm',
        elevated: 'border-none bg-card shadow-md hover:shadow-lg',
        outlined: 'border-2 border-border bg-background shadow-none',
        flat: 'border-none bg-card shadow-none'
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12'
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg transition-shadow',
        false: 'cursor-default'
      }
    }
  }
);
```

## Card Sub-Components
The Card family includes semantic sub-components:

### CardHeader
```typescript
<CardHeader>
  <CardTitle>Main Title</CardTitle>
  <CardDescription>Subtitle or description</CardDescription>
</CardHeader>
```

### CardContent
```typescript
<CardContent>
  {/* Main card content */}
</CardContent>
```

### CardFooter
```typescript
<CardFooter>
  <Button variant="primary">Primary Action</Button>
  <Button variant="outline">Secondary Action</Button>
</CardFooter>
```

## Accessibility
- Semantic structure using proper HTML elements
- Keyboard and screen reader accessible
- Interactive cards support keyboard navigation
- Focus management for clickable cards
- WCAG 2.2 AAA compliant

## Localization
- Never hardcode text; use localization for all content
- Supports English (fallback), Norwegian Bokmål, French, Arabic

## Semantic Token Usage
The Card component uses **semantic Tailwind CSS classes** that reference design tokens:

- **Colors**: `bg-card`, `text-card-foreground`, `border-border`
- **Spacing**: `p-6`, `p-8`, `space-y-1.5` (mapped to design token scale)
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`
- **Effects**: `hover:shadow-lg`, `transition-all`

## Example: All Card Variants
```typescript
import { Card, CardHeader, CardTitle, CardContent, Button } from '@xala-technologies/ui-system';

const CardShowcase = (): JSX.Element => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Variant examples */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
        </CardHeader>
        <CardContent>Standard card with border and subtle shadow</CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
        </CardHeader>
        <CardContent>Card with prominent shadow, no border</CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Outlined Card</CardTitle>
        </CardHeader>
        <CardContent>Card with thick border, no shadow</CardContent>
      </Card>

      <Card variant="flat">
        <CardHeader>
          <CardTitle>Flat Card</CardTitle>
        </CardHeader>
        <CardContent>Card with no border or shadow</CardContent>
      </Card>

      {/* Interactive card */}
      <Card variant="elevated" interactive onClick={handleCardClick}>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
        </CardHeader>
        <CardContent>Click anywhere on this card</CardContent>
      </Card>

      {/* Different padding sizes */}
      <Card variant="default" padding="sm">
        <CardContent>Small padding card</CardContent>
      </Card>

      <Card variant="default" padding="lg">
        <CardContent>Large padding card</CardContent>
      </Card>
    </div>
  );
};
```

## External State Management
For complex card interactions, manage state externally:

```typescript
// ✅ CORRECT: External state management
const ProductCard = ({ product }: { product: Product }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFavorited, setIsFavorited] = React.useState(product.isFavorited);
  
  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCart(product.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toggleFavorite(product.id);
  };
  
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>${product.price}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          variant="primary" 
          loading={isLoading}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
        <Button 
          variant={isFavorited ? "destructive" : "outline"}
          onClick={handleToggleFavorite}
        >
          {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        </Button>
      </CardFooter>
    </Card>
  );
};
```

## TypeScript Integration
Full TypeScript support with CVA variant types:

```typescript
import { type VariantProps } from 'class-variance-authority';
import { type CardProps, cardVariants } from '@xala-technologies/ui-system';

// Extract variant types for custom components
type CardVariants = VariantProps<typeof cardVariants>;

interface ProductCardProps extends CardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

const ProductCard = ({ product, onAddToCart, ...cardProps }: ProductCardProps) => {
  return (
    <Card {...cardProps}>
      <CardContent>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </CardContent>
    </Card>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only handles card rendering and layout
- Open/Closed: Extend via CVA variants and composition, not modification
- Liskov Substitution: All variants are interchangeable
- Interface Segregation: Clean, focused props interface
- Dependency Inversion: Depends on CVA abstractions, not concrete implementations
- Strict TypeScript types, no `any`
- Pure component - no internal state management

## Further Reading
- [CVA Pattern Guide](../architecture/component-architecture.md)
- [Design Tokens via CSS Classes](../design-tokens.md)
- [Migration from useTokens to CVA](../migration/README.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)