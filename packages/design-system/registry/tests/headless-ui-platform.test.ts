/**
 * Headless UI Platform Component Tests
 * Tests for Headless UI components focusing on accessibility, keyboard navigation, and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  setupHeadlessUIEnvironment,
  mockHeadlessUIComponents,
  accessibilityTestHelpers,
  themeTestHelpers,
  commonTestPatterns,
  platformTestRunner,
} from './test-utils';

// Mock Headless UI components
vi.mock('@headlessui/react', () => mockHeadlessUIComponents);

// Import Headless UI components
import {
  Button as HeadlessButton,
  ButtonGroup,
  ToggleButton,
  MenuButton,
} from '../platforms/headless-ui/button';

// =============================================================================
// HEADLESS UI BUTTON TESTS
// =============================================================================

platformTestRunner.runHeadlessUITests(() => {
  describe('HeadlessButton Component', () => {
    const user = userEvent.setup();

    describe('Basic Rendering', () => {
      it('should render with default props', () => {
        render(<HeadlessButton>Click me</HeadlessButton>);
        
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
      });

      it('should render with custom className', () => {
        render(<HeadlessButton className="custom-class">Button</HeadlessButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
      });

      it('should render children correctly', () => {
        render(
          <HeadlessButton>
            <span>Custom content</span>
          </HeadlessButton>
        );
        
        expect(screen.getByText('Custom content')).toBeInTheDocument();
      });
    });

    describe('Variants', () => {
      const variantTests = [
        {
          variant: 'primary' as const,
          expected: ['bg-primary', 'text-primary-foreground', 'focus-visible:ring-primary']
        },
        {
          variant: 'secondary' as const,
          expected: ['bg-secondary', 'text-secondary-foreground', 'focus-visible:ring-secondary']
        },
        {
          variant: 'outline' as const,
          expected: ['border', 'border-input', 'bg-background']
        },
        {
          variant: 'ghost' as const,
          expected: ['hover:bg-accent', 'hover:text-accent-foreground']
        },
        {
          variant: 'destructive' as const,
          expected: ['bg-destructive', 'text-destructive-foreground']
        },
      ];

      variantTests.forEach(({ variant, expected }) => {
        it(`should render ${variant} variant correctly`, () => {
          render(<HeadlessButton variant={variant}>Button</HeadlessButton>);
          
          const button = screen.getByRole('button');
          expected.forEach(className => {
            expect(button).toHaveClass(className);
          });
        });
      });
    });

    describe('Sizes', () => {
      const sizeTests = [
        { size: 'xs' as const, expected: ['h-8', 'px-3', 'text-xs'] },
        { size: 'sm' as const, expected: ['h-10', 'px-4', 'text-sm'] },
        { size: 'md' as const, expected: ['h-12', 'px-6', 'text-base'] },
        { size: 'lg' as const, expected: ['h-14', 'px-8', 'text-lg'] },
        { size: 'xl' as const, expected: ['h-16', 'px-10', 'text-xl'] },
      ];

      sizeTests.forEach(({ size, expected }) => {
        it(`should render ${size} size correctly`, () => {
          render(<HeadlessButton size={size}>Button</HeadlessButton>);
          
          const button = screen.getByRole('button');
          expected.forEach(className => {
            expect(button).toHaveClass(className);
          });
        });
      });
    });

    describe('States', () => {
      it('should handle loading state', () => {
        render(<HeadlessButton loading>Loading Button</HeadlessButton>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('data-disabled', 'true');
        
        // Should have loading spinner
        const spinner = button.querySelector('svg');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('animate-spin');
      });

      it('should handle disabled state', () => {
        render(<HeadlessButton disabled>Disabled Button</HeadlessButton>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('data-disabled', 'true');
      });

      it('should handle full width', () => {
        render(<HeadlessButton fullWidth>Full Width</HeadlessButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('w-full');
      });
    });

    describe('Icons', () => {
      it('should render with prefix icon', () => {
        const icon = <span data-testid="prefix-icon">🔥</span>;
        render(<HeadlessButton icon={icon}>Button with icon</HeadlessButton>);
        
        expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
      });

      it('should render with suffix icon', () => {
        const icon = <span data-testid="suffix-icon">→</span>;
        render(<HeadlessButton suffixIcon={icon}>Button with suffix</HeadlessButton>);
        
        expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
      });

      it('should hide icons when loading', () => {
        const prefixIcon = <span data-testid="prefix-icon">🔥</span>;
        const suffixIcon = <span data-testid="suffix-icon">→</span>;
        
        render(
          <HeadlessButton loading icon={prefixIcon} suffixIcon={suffixIcon}>
            Loading
          </HeadlessButton>
        );
        
        expect(screen.queryByTestId('prefix-icon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('suffix-icon')).not.toBeInTheDocument();
      });
    });

    describe('Polymorphic Rendering', () => {
      it('should render as different elements', () => {
        const { container: buttonContainer } = render(
          <HeadlessButton>Button</HeadlessButton>
        );
        expect(buttonContainer.querySelector('button')).toBeInTheDocument();

        const { container: linkContainer } = render(
          <HeadlessButton render="a" href="/home">Link</HeadlessButton>
        );
        expect(linkContainer.querySelector('a')).toBeInTheDocument();
        expect(linkContainer.querySelector('a')).toHaveAttribute('href', '/home');

        const { container: divContainer } = render(
          <HeadlessButton render="div">Div</HeadlessButton>
        );
        expect(divContainer.querySelector('div')).toBeInTheDocument();
      });

      it('should pass through props to rendered element', () => {
        render(
          <HeadlessButton
            render="a"
            href="/test"
            target="_blank"
            rel="noopener"
          >
            External Link
          </HeadlessButton>
        );
        
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/test');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
      });
    });

    describe('Data Attributes (Headless UI Pattern)', () => {
      it('should use data-disabled attribute', () => {
        render(<HeadlessButton disabled>Disabled</HeadlessButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('data-disabled', 'true');
        expect(button).toHaveClass('data-[disabled]:opacity-50');
      });

      it('should use data-focus attribute for styling', async () => {
        render(<HeadlessButton>Focus me</HeadlessButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('data-[focus]:ring-2');
        
        // Focus the button
        await user.tab();
        expect(button).toHaveFocus();
      });

      it('should use data-hover attribute for styling', () => {
        render(<HeadlessButton variant="primary">Hover me</HeadlessButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('data-[hover]:bg-primary/90');
      });
    });

    describe('Event Handling', () => {
      it('should handle click events', async () => {
        const mockOnClick = vi.fn();
        render(<HeadlessButton onClick={mockOnClick}>Click me</HeadlessButton>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });

      it('should prevent click when disabled', async () => {
        const mockOnClick = vi.fn();
        render(
          <HeadlessButton disabled onClick={mockOnClick}>
            Disabled
          </HeadlessButton>
        );

        const button = screen.getByRole('button');
        await user.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
      });

      it('should prevent click when loading', async () => {
        const mockOnClick = vi.fn();
        render(
          <HeadlessButton loading onClick={mockOnClick}>
            Loading
          </HeadlessButton>
        );

        const button = screen.getByRole('button');
        await user.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });

    describe('Accessibility (Enhanced with Headless UI)', () => {
      it('should have proper focus management', async () => {
        render(
          <div>
            <HeadlessButton>First</HeadlessButton>
            <HeadlessButton>Second</HeadlessButton>
          </div>
        );
        
        const firstButton = screen.getByText('First');
        const secondButton = screen.getByText('Second');
        
        // Tab to first button
        await user.tab();
        expect(firstButton).toHaveFocus();
        
        // Tab to second button
        await user.tab();
        expect(secondButton).toHaveFocus();
      });

      it('should support keyboard navigation', async () => {
        const mockOnClick = vi.fn();
        render(<HeadlessButton onClick={mockOnClick}>Keyboard button</HeadlessButton>);

        const button = screen.getByRole('button');
        
        // Focus with Tab
        await user.tab();
        expect(button).toHaveFocus();

        // Activate with Enter
        await user.keyboard('{Enter}');
        expect(mockOnClick).toHaveBeenCalled();

        mockOnClick.mockClear();

        // Activate with Space
        await user.keyboard(' ');
        expect(mockOnClick).toHaveBeenCalled();
      });

      it('should have visible focus indicators', async () => {
        render(<HeadlessButton>Focus me</HeadlessButton>);

        const button = screen.getByRole('button');
        await user.tab();

        expect(button).toHaveClass('focus:outline-none');
        expect(button).toHaveClass('focus-visible:ring-2');
        expect(button).toHaveClass('data-[focus]:ring-2');
      });

      it('should announce loading state to screen readers', () => {
        render(<HeadlessButton loading>Loading</HeadlessButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('data-disabled', 'true');
        
        // Content should be visible but with opacity
        expect(button.textContent).toContain('Loading');
        const content = button.querySelector('span');
        expect(content).toHaveClass('opacity-70');
      });

      it('should support ARIA attributes', () => {
        render(
          <HeadlessButton
            aria-label="Custom label"
            aria-describedby="description"
            aria-pressed="false"
          >
            ARIA Button
          </HeadlessButton>
        );
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Custom label');
        expect(button).toHaveAttribute('aria-describedby', 'description');
        expect(button).toHaveAttribute('aria-pressed', 'false');
      });
    });
  });

  // =============================================================================
  // BUTTON GROUP TESTS
  // =============================================================================

  describe('ButtonGroup Component', () => {
    it('should render group of buttons', () => {
      render(
        <ButtonGroup>
          <HeadlessButton>First</HeadlessButton>
          <HeadlessButton>Second</HeadlessButton>
          <HeadlessButton>Third</HeadlessButton>
        </ButtonGroup>
      );
      
      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
      expect(group).toHaveClass('inline-flex', 'rounded-md', 'shadow-sm');
    });

    it('should apply correct border radius to grouped buttons', () => {
      render(
        <ButtonGroup>
          <HeadlessButton>First</HeadlessButton>
          <HeadlessButton>Second</HeadlessButton>
          <HeadlessButton>Third</HeadlessButton>
        </ButtonGroup>
      );
      
      const group = screen.getByRole('group');
      expect(group).toHaveClass(
        '[&>*:first-child]:rounded-r-none',
        '[&>*:last-child]:rounded-l-none',
        '[&>*:not(:first-child):not(:last-child)]:rounded-none'
      );
    });

    it('should add margin between buttons', () => {
      render(
        <ButtonGroup>
          <HeadlessButton>First</HeadlessButton>
          <HeadlessButton>Second</HeadlessButton>
        </ButtonGroup>
      );
      
      const group = screen.getByRole('group');
      expect(group).toHaveClass('[&>*:not(:first-child)]:ml-px');
    });

    it('should support keyboard navigation within group', async () => {
      render(
        <ButtonGroup>
          <HeadlessButton>First</HeadlessButton>
          <HeadlessButton>Second</HeadlessButton>
          <HeadlessButton>Third</HeadlessButton>
        </ButtonGroup>
      );
      
      const buttons = screen.getAllByRole('button');
      
      // Should be able to tab through buttons
      await user.tab();
      expect(buttons[0]).toHaveFocus();
      
      await user.tab();
      expect(buttons[1]).toHaveFocus();
      
      await user.tab();
      expect(buttons[2]).toHaveFocus();
    });
  });

  // =============================================================================
  // TOGGLE BUTTON TESTS
  // =============================================================================

  describe('ToggleButton Component', () => {
    it('should render in unpressed state by default', () => {
      render(<ToggleButton>Toggle me</ToggleButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).not.toHaveClass('bg-accent');
    });

    it('should render in pressed state', () => {
      render(<ToggleButton pressed>Pressed toggle</ToggleButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('should handle toggle events', async () => {
      const mockOnPressedChange = vi.fn();
      render(
        <ToggleButton onPressedChange={mockOnPressedChange}>
          Toggle me
        </ToggleButton>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnPressedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle from pressed to unpressed', async () => {
      const mockOnPressedChange = vi.fn();
      render(
        <ToggleButton pressed onPressedChange={mockOnPressedChange}>
          Toggle me
        </ToggleButton>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnPressedChange).toHaveBeenCalledWith(false);
    });

    it('should support keyboard toggling', async () => {
      const mockOnPressedChange = vi.fn();
      render(
        <ToggleButton onPressedChange={mockOnPressedChange}>
          Keyboard toggle
        </ToggleButton>
      );
      
      const button = screen.getByRole('button');
      
      await user.tab();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnPressedChange).toHaveBeenCalledWith(true);
      
      await user.keyboard(' ');
      expect(mockOnPressedChange).toHaveBeenCalledWith(true);
    });

    it('should announce state changes to screen readers', async () => {
      const { rerender } = render(<ToggleButton>Screen reader toggle</ToggleButton>);
      
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      
      rerender(<ToggleButton pressed>Screen reader toggle</ToggleButton>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  // =============================================================================
  // MENU BUTTON TESTS
  // =============================================================================

  describe('MenuButton Component', () => {
    it('should render with dropdown arrow', () => {
      render(<MenuButton>Menu</MenuButton>);
      
      const button = screen.getByRole('button');
      const arrow = button.querySelector('svg');
      
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveClass('ml-2', 'h-4', 'w-4', 'shrink-0');
    });

    it('should handle open state styling', () => {
      render(<MenuButton className="data-[open]:bg-red-500">Open menu</MenuButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('data-[open]:bg-accent');
      expect(button).toHaveClass('data-[open]:bg-red-500');
    });

    it('should be accessible for screen readers', () => {
      render(<MenuButton aria-haspopup="true" aria-expanded="false">Menu</MenuButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should integrate with Headless UI Menu patterns', async () => {
      // This would typically be tested with actual Headless UI Menu component
      const mockOnClick = vi.fn();
      render(<MenuButton onClick={mockOnClick}>Menu trigger</MenuButton>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  // =============================================================================
  // HEADLESS UI INTEGRATION TESTS
  // =============================================================================

  describe('Headless UI Integration', () => {
    it('should work with Headless UI patterns', () => {
      render(
        <div className="space-y-4">
          <HeadlessButton>Normal Button</HeadlessButton>
          <ToggleButton>Toggle Button</ToggleButton>
          <MenuButton>Menu Button</MenuButton>
        </div>
      );
      
      expect(screen.getByText('Normal Button')).toBeInTheDocument();
      expect(screen.getByText('Toggle Button')).toBeInTheDocument();
      expect(screen.getByText('Menu Button')).toBeInTheDocument();
    });

    it('should support composition with other Headless UI components', () => {
      // This would typically test integration with Menu, Dialog, Popover, etc.
      render(
        <div>
          <MenuButton>Menu</MenuButton>
          <HeadlessButton render="a" href="/dialog">Open Dialog</HeadlessButton>
        </div>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should handle complex state management', async () => {
      const TestComponent = () => {
        const [isPressed, setIsPressed] = React.useState(false);
        const [isMenuOpen, setIsMenuOpen] = React.useState(false);
        
        return (
          <div>
            <ToggleButton pressed={isPressed} onPressedChange={setIsPressed}>
              Toggle ({isPressed ? 'On' : 'Off'})
            </ToggleButton>
            <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              Menu ({isMenuOpen ? 'Open' : 'Closed'})
            </MenuButton>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      const toggleButton = screen.getByText(/Toggle \(Off\)/);
      const menuButton = screen.getByText(/Menu \(Closed\)/);
      
      await user.click(toggleButton);
      expect(screen.getByText(/Toggle \(On\)/)).toBeInTheDocument();
      
      await user.click(menuButton);
      expect(screen.getByText(/Menu \(Open\)/)).toBeInTheDocument();
    });
  });

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  describe('Performance', () => {
    it('should render efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        render(<HeadlessButton key={i}>Button {i}</HeadlessButton>);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // Should render 100 buttons in <1s
    });

    it('should handle rapid state changes efficiently', () => {
      const { rerender } = render(<ToggleButton>Toggle</ToggleButton>);
      
      const start = performance.now();
      
      // Rapidly toggle state
      for (let i = 0; i < 100; i++) {
        rerender(<ToggleButton pressed={i % 2 === 0}>Toggle</ToggleButton>);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(500); // Should handle 100 state changes in <500ms
    });
  });

  // =============================================================================
  // THEME INTEGRATION TESTS
  // =============================================================================

  describe('Theme Integration', () => {
    it('should apply theme tokens correctly', () => {
      render(<HeadlessButton variant="primary">Themed button</HeadlessButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should support CSS custom properties', () => {
      const { container } = render(
        <div style={{ '--primary': '#ff0000' }}>
          <HeadlessButton variant="primary">CSS vars button</HeadlessButton>
        </div>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.getPropertyValue('--primary')).toBe('#ff0000');
    });

    it('should work with different color schemes', () => {
      const { rerender } = render(
        <div data-theme="light">
          <HeadlessButton variant="primary">Light theme</HeadlessButton>
        </div>
      );
      
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
      
      rerender(
        <div data-theme="dark">
          <HeadlessButton variant="primary">Dark theme</HeadlessButton>
        </div>
      );
      
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });
  });
});

// =============================================================================
// HEADLESS UI PLATFORM INTEGRATION TESTS
// =============================================================================

describe('Headless UI Platform Integration', () => {
  beforeEach(() => {
    setupHeadlessUIEnvironment();
  });

  it('should integrate with Headless UI library', () => {
    expect(mockHeadlessUIComponents.Button).toBeDefined();
  });

  it('should support polymorphic rendering', () => {
    const { container } = render(
      <HeadlessButton render="div" role="button" tabIndex={0}>
        Polymorphic button
      </HeadlessButton>
    );
    
    const element = container.querySelector('div[role="button"]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('tabIndex', '0');
  });

  it('should work with Headless UI data attributes', async () => {
    render(<HeadlessButton>Data attributes</HeadlessButton>);
    
    const button = screen.getByRole('button');
    
    // Should have data attribute classes for Headless UI styling
    expect(button).toHaveClass('data-[disabled]:opacity-50');
    expect(button).toHaveClass('data-[focus]:ring-2');
    expect(button).toHaveClass('data-[hover]:bg-primary/90');
  });

  it('should maintain accessibility with complex interactions', async () => {
    const TestAccessibility = () => {
      const [pressed, setPressed] = React.useState(false);
      
      return (
        <div role="toolbar">
          <ToggleButton
            pressed={pressed}
            onPressedChange={setPressed}
            aria-label="Toggle feature"
          >
            Feature {pressed ? 'On' : 'Off'}
          </ToggleButton>
          <MenuButton aria-haspopup="menu" aria-expanded="false">
            Options
          </MenuButton>
        </div>
      );
    };
    
    render(<TestAccessibility />);
    
    const toolbar = screen.getByRole('toolbar');
    const toggle = screen.getByRole('button', { name: /toggle feature/i });
    const menu = screen.getByRole('button', { name: /options/i });
    
    expect(toolbar).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(menu).toHaveAttribute('aria-haspopup', 'menu');
    
    // Test keyboard navigation within toolbar
    await user.tab();
    expect(toggle).toHaveFocus();
    
    await user.tab();
    expect(menu).toHaveFocus();
  });
});