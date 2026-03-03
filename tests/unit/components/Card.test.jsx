import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../../../src/design-system/primitives/Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders complex children', () => {
      render(
        <Card>
          <h2>Title</h2>
          <p>Description</p>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant with border', () => {
      const { container } = render(<Card variant="default">Default</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-neutral-200');
    });

    it('renders elevated variant with shadow', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('shadow-sm');
    });

    it('renders glass variant with backdrop-blur', () => {
      const { container } = render(<Card variant="glass">Glass</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('backdrop-blur-xl');
    });
  });

  describe('Padding', () => {
    it('renders with no padding', () => {
      const { container } = render(<Card padding="none">No padding</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('p-4');
    });

    it('renders with xs padding', () => {
      const { container } = render(<Card padding="xs">XS padding</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-2');
    });

    it('renders with sm padding', () => {
      const { container } = render(<Card padding="sm">SM padding</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-3');
    });

    it('renders with md padding by default', () => {
      const { container } = render(<Card>Default padding</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-4');
    });

    it('renders with lg padding', () => {
      const { container } = render(<Card padding="lg">LG padding</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-6');
    });

    it('renders with xl padding', () => {
      const { container } = render(<Card padding="xl">XL padding</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-8');
    });
  });

  describe('Hoverable', () => {
    it('applies hover styles when hoverable', () => {
      const { container } = render(<Card hoverable>Hoverable</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('does not apply hover styles when not hoverable', () => {
      const { container } = render(<Card>Not hoverable</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked and hoverable', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Card hoverable onClick={handleClick}>
          Clickable
        </Card>
      );
      fireEvent.click(container.firstChild);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when clicked even if not hoverable', () => {
      const handleClick = jest.fn();
      const { container } = render(<Card onClick={handleClick}>Clickable</Card>);
      fireEvent.click(container.firstChild);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Base Styles', () => {
    it('always has background color', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('dark:bg-neutral-900');
    });

    it('always has rounded corners', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('rounded-lg');
    });

    it('has transition styles', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('transition-all');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<Card className="custom-card">Custom</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('custom-card');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(<Card className="custom-card">Custom</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('custom-card');
      expect(card).toHaveClass('bg-white');
    });
  });
});
