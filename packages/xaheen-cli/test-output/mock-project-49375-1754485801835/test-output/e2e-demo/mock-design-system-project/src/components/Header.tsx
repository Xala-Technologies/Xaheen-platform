
import React from 'react';
import { Button } from '@xaheen/design-system';

interface HeaderProps {
  readonly title: string;
  readonly onMenuClick?: () => void;
}

export const Header = ({ title, onMenuClick }: HeaderProps): JSX.Element => {
  return (
    <header className="p-6 bg-white shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <Button
          variant="primary"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          Menu
        </Button>
      </div>
    </header>
  );
};
