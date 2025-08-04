
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestCard } from './TestCard.js';

describe('TestCard', () => {
  it('renders without crashing', () => {
    render(<TestCard />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const handleClick = jest.fn();
    render(<TestCard onClick={handleClick} />);
    
    const element = screen.getByRole('button');
    fireEvent.click(element);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct accessibility attributes', () => {
    render(<TestCard />);
    const element = screen.getByRole('button');
    
    expect(element).toHaveAttribute('aria-label');
    expect(element).toBeVisible();
  });

  it('supports keyboard navigation', () => {
    render(<TestCard />);
    const element = screen.getByRole('button');
    
    fireEvent.keyDown(element, { key: 'Enter' });
    fireEvent.keyDown(element, { key: ' ' });
    
    expect(element).toHaveFocus();
  });
});