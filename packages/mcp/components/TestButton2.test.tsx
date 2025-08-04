
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestButton2 } from './TestButton2.js';

describe('TestButton2', () => {
  it('renders without crashing', () => {
    render(<TestButton2 />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const handleClick = jest.fn();
    render(<TestButton2 onClick={handleClick} />);
    
    const element = screen.getByRole('button');
    fireEvent.click(element);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct accessibility attributes', () => {
    render(<TestButton2 />);
    const element = screen.getByRole('button');
    
    expect(element).toHaveAttribute('aria-label');
    expect(element).toBeVisible();
  });

  it('supports keyboard navigation', () => {
    render(<TestButton2 />);
    const element = screen.getByRole('button');
    
    fireEvent.keyDown(element, { key: 'Enter' });
    fireEvent.keyDown(element, { key: ' ' });
    
    expect(element).toHaveFocus();
  });
});