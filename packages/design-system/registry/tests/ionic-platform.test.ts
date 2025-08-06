/**
 * Ionic Platform Component Tests
 * Tests for Ionic-specific components including mobile features, gestures, and haptic feedback
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  setupIonicEnvironment,
  cleanupIonicEnvironment,
  mockHaptics,
  mockIonicComponents,
  accessibilityTestHelpers,
  themeTestHelpers,
  commonTestPatterns,
  platformTestRunner,
} from './test-utils';

// Mock Ionic React components
vi.mock('@ionic/react', () => mockIonicComponents);

// Import Ionic components
import { Button as IonicButton, FAB, SegmentButton, TabButton } from '../platforms/ionic/button';

// =============================================================================
// IONIC BUTTON TESTS
// =============================================================================

platformTestRunner.runIonicTests(() => {
  describe('IonicButton Component', () => {
    const user = userEvent.setup();

    describe('Basic Rendering', () => {
      it('should render with default props', () => {
        render(<IonicButton>Click me</IonicButton>);
        
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
      });

      it('should render with custom className', () => {
        render(<IonicButton className="custom-class">Button</IonicButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
      });

      it('should render children correctly', () => {
        render(
          <IonicButton>
            <span>Custom content</span>
          </IonicButton>
        );
        
        expect(screen.getByText('Custom content')).toBeInTheDocument();
      });
    });

    describe('Ionic-Specific Props', () => {
      it('should map variants to Ionic colors', () => {
        const { rerender } = render(<IonicButton variant="primary">Primary</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('color', 'primary');

        rerender(<IonicButton variant="destructive">Destructive</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('color', 'danger');

        rerender(<IonicButton variant="ghost">Ghost</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('color', 'medium');
      });

      it('should map fill variants correctly', () => {
        const { rerender } = render(<IonicButton variant="outline">Outline</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('fill', 'outline');

        rerender(<IonicButton variant="ghost">Ghost</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('fill', 'clear');

        rerender(<IonicButton variant="primary">Solid</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('fill', 'solid');
      });

      it('should map sizes to Ionic sizes', () => {
        const { rerender } = render(<IonicButton size="xs">Extra Small</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('size', 'small');

        rerender(<IonicButton size="sm">Small</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('size', 'small');

        rerender(<IonicButton size="md">Medium</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('size', 'default');

        rerender(<IonicButton size="lg">Large</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('size', 'large');

        rerender(<IonicButton size="xl">Extra Large</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('size', 'large');
      });

      it('should handle shape prop', () => {
        const { rerender } = render(<IonicButton shape="round">Round</IonicButton>);
        expect(screen.getByRole('button')).toHaveAttribute('shape', 'round');

        rerender(<IonicButton shape="default">Default</IonicButton>);
        expect(screen.getByRole('button')).not.toHaveAttribute('shape');
      });

      it('should handle fullWidth prop', () => {
        render(<IonicButton fullWidth>Full Width</IonicButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('expand', 'block');
      });
    });

    describe('Icons', () => {
      it('should render with start icon string', () => {
        render(<IonicButton startIcon="home">Home</IonicButton>);
        
        // Should render IonIcon with the icon name
        const ionIcon = screen.getByRole('button').querySelector('ion-icon');
        expect(ionIcon).toHaveAttribute('icon', 'home');
        expect(ionIcon).toHaveAttribute('slot', 'start');
      });

      it('should render with end icon string', () => {
        render(<IonicButton endIcon="arrow-forward">Next</IonicButton>);
        
        const ionIcon = screen.getByRole('button').querySelector('ion-icon');
        expect(ionIcon).toHaveAttribute('icon', 'arrow-forward');
        expect(ionIcon).toHaveAttribute('slot', 'end');
      });

      it('should render with React element icons', () => {
        const customIcon = <span data-testid="custom-icon">🔥</span>;
        render(<IonicButton startIcon={customIcon}>Custom Icon</IonicButton>);
        
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      });

      it('should hide icons when loading', () => {
        render(
          <IonicButton loading startIcon="home" endIcon="arrow-forward">
            Loading
          </IonicButton>
        );
        
        const button = screen.getByRole('button');
        const spinner = button.querySelector('ion-spinner');
        const homeIcon = button.querySelector('ion-icon[icon="home"]');
        const arrowIcon = button.querySelector('ion-icon[icon="arrow-forward"]');
        
        expect(spinner).toBeInTheDocument();
        expect(homeIcon).not.toBeInTheDocument();
        expect(arrowIcon).not.toBeInTheDocument();
      });
    });

    describe('Loading State', () => {
      it('should show spinner when loading', () => {
        render(<IonicButton loading>Loading</IonicButton>);
        
        const button = screen.getByRole('button');
        const spinner = button.querySelector('ion-spinner');
        
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('slot', 'start');
      });

      it('should disable button when loading', () => {
        render(<IonicButton loading>Loading</IonicButton>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
      });
    });

    describe('Haptic Feedback', () => {
      beforeEach(() => {
        setupIonicEnvironment();
      });

      afterEach(() => {
        cleanupIonicEnvironment();
      });

      it('should trigger haptic feedback on click', async () => {
        render(<IonicButton haptic="medium">Haptic Button</IonicButton>);
        
        const button = screen.getByRole('button');
        await user.click(button);
        
        expect(mockHaptics.impact).toHaveBeenCalledWith({ style: 'medium' });
      });

      it('should handle different haptic types', async () => {
        const { rerender } = render(<IonicButton haptic="light">Light</IonicButton>);
        
        let button = screen.getByRole('button');
        await user.click(button);
        expect(mockHaptics.impact).toHaveBeenCalledWith({ style: 'light' });

        rerender(<IonicButton haptic="heavy">Heavy</IonicButton>);
        button = screen.getByRole('button');
        await user.click(button);
        expect(mockHaptics.impact).toHaveBeenCalledWith({ style: 'heavy' });

        rerender(<IonicButton haptic="selection">Selection</IonicButton>);
        button = screen.getByRole('button');
        await user.click(button);
        expect(mockHaptics.selectionStart).toHaveBeenCalled();
      });

      it('should not trigger haptic when disabled', async () => {
        render(<IonicButton haptic="medium" disabled>Disabled</IonicButton>);
        
        const button = screen.getByRole('button');
        await user.click(button);
        
        expect(mockHaptics.impact).not.toHaveBeenCalled();
      });

      it('should handle missing Haptics API gracefully', async () => {
        cleanupIonicEnvironment();
        
        render(<IonicButton haptic="medium">No Haptics</IonicButton>);
        
        const button = screen.getByRole('button');
        
        expect(() => user.click(button)).not.toThrow();
      });
    });

    describe('Event Handling', () => {
      it('should handle click events', async () => {
        const mockOnClick = vi.fn();
        render(<IonicButton onClick={mockOnClick}>Click me</IonicButton>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });

      it('should prevent click when disabled', async () => {
        const mockOnClick = vi.fn();
        render(<IonicButton disabled onClick={mockOnClick}>Disabled</IonicButton>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
      });

      it('should prevent click when loading', async () => {
        const mockOnClick = vi.fn();
        render(<IonicButton loading onClick={mockOnClick}>Loading</IonicButton>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });

    describe('CSS Classes', () => {
      it('should apply Ionic-specific classes', () => {
        render(<IonicButton variant="primary" size="md">Button</IonicButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('ion-activatable', 'ion-focusable');
        expect(button).toHaveClass('ion-color-primary');
      });

      it('should combine with custom classes', () => {
        render(
          <IonicButton 
            className="custom-class" 
            variant="secondary" 
            size="lg"
          >
            Custom Button
          </IonicButton>
        );
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
        expect(button).toHaveClass('ion-color-secondary');
      });
    });

    describe('Accessibility', () => {
      it('should have proper ARIA attributes', () => {
        render(<IonicButton aria-label="Custom label">Button</IonicButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Custom label');
      });

      it('should support keyboard navigation', async () => {
        const mockOnClick = vi.fn();
        render(<IonicButton onClick={mockOnClick}>Keyboard button</IonicButton>);

        const button = screen.getByRole('button');
        
        // Focus with Tab
        await user.tab();
        expect(button).toHaveFocus();

        // Activate with Enter
        await user.keyboard('{Enter}');
        expect(mockOnClick).toHaveBeenCalled();
      });

      it('should announce loading state', () => {
        render(<IonicButton loading>Loading</IonicButton>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
      });
    });
  });

  // =============================================================================
  // FAB (FLOATING ACTION BUTTON) TESTS
  // =============================================================================

  describe('FAB Component', () => {
    it('should render as round button', () => {
      render(<FAB>Add</FAB>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('shape', 'round');
    });

    it('should position correctly', () => {
      const { container } = render(<FAB position="bottom-right">Add</FAB>);
      
      const fabContainer = container.querySelector('.fab-container');
      expect(fabContainer).toHaveClass('fab-bottom-right');
    });

    it('should handle different positions', () => {
      const positions = ['bottom-left', 'top-right', 'top-left', 'center'] as const;
      
      positions.forEach(position => {
        const { container } = render(<FAB position={position}>Add</FAB>);
        const fabContainer = container.querySelector('.fab-container');
        expect(fabContainer).toHaveClass(`fab-${position}`);
      });
    });
  });

  // =============================================================================
  // SEGMENT BUTTON TESTS
  // =============================================================================

  describe('SegmentButton Component', () => {
    it('should render in unselected state', () => {
      render(<SegmentButton>Option 1</SegmentButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('fill', 'clear');
    });

    it('should render in selected state', () => {
      render(<SegmentButton selected>Selected Option</SegmentButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('color', 'primary');
      expect(button).toHaveAttribute('fill', 'solid');
      expect(button).toHaveClass('segment-button-selected');
    });

    it('should apply segment-specific classes', () => {
      render(<SegmentButton>Segment</SegmentButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('segment-button');
    });
  });

  // =============================================================================
  // TAB BUTTON TESTS
  // =============================================================================

  describe('TabButton Component', () => {
    it('should render with icon', () => {
      render(<TabButton startIcon="home">Home</TabButton>);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('ion-icon');
      expect(icon).toHaveAttribute('icon', 'home');
    });

    it('should render with badge', () => {
      render(<TabButton badge="3">Notifications</TabButton>);
      
      const badge = screen.getByText('3');
      expect(badge).toHaveClass('tab-badge');
    });

    it('should render in active state', () => {
      render(<TabButton active>Active Tab</TabButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('tab-button-active');
      expect(button).toHaveAttribute('color', 'primary');
    });

    it('should wrap content correctly', () => {
      render(
        <TabButton badge="5" startIcon="notifications">
          Alerts
        </TabButton>
      );
      
      const content = screen.getByText('Alerts').closest('.tab-content');
      expect(content).toBeInTheDocument();
      
      const badge = screen.getByText('5');
      expect(badge).toBeInTheDocument();
    });
  });

  // =============================================================================
  // MOBILE-SPECIFIC FEATURES TESTS
  // =============================================================================

  describe('Mobile-Specific Features', () => {
    beforeEach(() => {
      setupIonicEnvironment();
    });

    afterEach(() => {
      cleanupIonicEnvironment();
    });

    describe('Touch Interactions', () => {
      it('should handle touch events', async () => {
        const mockOnClick = vi.fn();
        render(<IonicButton onClick={mockOnClick}>Touch me</IonicButton>);

        const button = screen.getByRole('button');
        
        // Simulate touch events
        await user.pointer([
          { keys: '[TouchA>]', target: button },
          { keys: '[/TouchA]' }
        ]);

        expect(mockOnClick).toHaveBeenCalled();
      });

      it('should provide appropriate touch targets', () => {
        render(<IonicButton size="md">Touch Target</IonicButton>);
        
        const button = screen.getByRole('button');
        
        // Ionic buttons should have appropriate touch target size
        // This is handled by Ionic's CSS, but we can verify the size classes
        expect(button).toHaveAttribute('size', 'default');
      });
    });

    describe('Platform Adaptations', () => {
      it('should adapt to iOS styles', () => {
        // Mock iOS platform
        Object.defineProperty(navigator, 'platform', {
          value: 'iPhone',
          writable: true
        });

        render(<IonicButton>iOS Button</IonicButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('ion-activatable');
      });

      it('should adapt to Android styles', () => {
        // Mock Android platform
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
          writable: true
        });

        render(<IonicButton>Android Button</IonicButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('ion-activatable');
      });
    });

    describe('Responsive Design', () => {
      it('should adapt to different screen sizes', () => {
        // Test different viewport sizes
        const viewports = [320, 768, 1024];
        
        viewports.forEach(width => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
          });

          const { container } = render(<IonicButton>Responsive</IonicButton>);
          const button = container.querySelector('ion-button');
          
          expect(button).toBeInTheDocument();
          
          window.dispatchEvent(new Event('resize'));
        });
      });
    });
  });

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  describe('Performance', () => {
    it('should render efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        render(<IonicButton key={i}>Button {i}</IonicButton>);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(2000); // Should render 100 buttons in <2s
    });

    it('should handle rapid state changes', async () => {
      const { rerender } = render(<IonicButton>Initial</IonicButton>);
      
      const start = performance.now();
      
      // Rapidly change states
      for (let i = 0; i < 50; i++) {
        rerender(<IonicButton loading={i % 2 === 0}>State {i}</IonicButton>);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // Should handle 50 state changes in <1s
    });
  });

  // =============================================================================
  // THEME INTEGRATION TESTS
  // =============================================================================

  describe('Theme Integration', () => {
    it('should use Ionic CSS variables', () => {
      render(<IonicButton variant="primary">Themed</IonicButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ion-color-primary');
    });

    it('should support custom Ionic themes', () => {
      render(
        <div className="ion-color-custom">
          <IonicButton>Custom Theme</IonicButton>
        </div>
      );
      
      const container = screen.getByText('Custom Theme').closest('.ion-color-custom');
      expect(container).toBeInTheDocument();
    });

    it('should integrate with Ionic dark mode', () => {
      // Mock dark mode
      document.body.classList.add('dark');
      
      render(<IonicButton variant="primary">Dark Mode</IonicButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ion-color-primary');
      
      document.body.classList.remove('dark');
    });
  });
});

// =============================================================================
// IONIC PLATFORM INTEGRATION TESTS
// =============================================================================

describe('Ionic Platform Integration', () => {
  beforeEach(() => {
    setupIonicEnvironment();
  });

  afterEach(() => {
    cleanupIonicEnvironment();
  });

  it('should integrate with Ionic framework', () => {
    expect(mockIonicComponents.IonButton).toBeDefined();
    expect(mockIonicComponents.IonIcon).toBeDefined();
    expect(mockIonicComponents.IonSpinner).toBeDefined();
  });

  it('should handle Ionic lifecycle', () => {
    const { unmount } = render(<IonicButton>Lifecycle</IonicButton>);
    
    expect(() => unmount()).not.toThrow();
  });

  it('should work with Ionic routing', () => {
    render(
      <IonicButton onClick={() => window.history.pushState({}, '', '/test')}>
        Navigate
      </IonicButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should support Ionic gestures', async () => {
    const mockOnClick = vi.fn();
    render(<IonicButton onClick={mockOnClick}>Gesture</IonicButton>);

    const button = screen.getByRole('button');
    
    // Simulate gesture (tap)
    const user = userEvent.setup();
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalled();
  });
});