import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../../../src/design-system/primitives/Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      const Icon = () => <span data-testid="search-icon">🔍</span>;
      render(<Input icon={<Icon />} placeholder="Search" />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('applies correct padding when icon is present', () => {
      const Icon = () => <span>🔍</span>;
      render(<Input icon={<Icon />} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-9');
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('renders email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('shows error state with red border', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Value and onChange', () => {
    it('displays the value', () => {
      render(<Input value="Test value" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('Test value');
    });

    it('calls onChange when typing', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Hello');

      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value on change', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
      };

      render(<TestComponent />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'New value' } });
      expect(input).toHaveValue('New value');
    });
  });

  describe('Focus States', () => {
    it('has focus-visible styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:border-accent-500');
    });

    it('can be focused', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Placeholder', () => {
    it('shows placeholder text', () => {
      render(<Input placeholder="Enter your email" />);
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('has placeholder styling', () => {
      render(<Input placeholder="Placeholder" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('placeholder-neutral-400');
    });
  });

  describe('Accessibility', () => {
    it('has textbox role', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('accepts aria-label', () => {
      render(<Input aria-label="Email input" />);
      expect(screen.getByLabelText('Email input')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className to input', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });
  });
});
