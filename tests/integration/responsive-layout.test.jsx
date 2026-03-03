import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useResponsive } from '../../src/hooks/useResponsive';

// Test component that uses responsive hook
const ResponsiveComponent = () => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  return (
    <div>
      <div data-testid="viewport-info">
        {isMobile && <span>Mobile</span>}
        {isTablet && <span>Tablet</span>}
        {isDesktop && <span>Desktop</span>}
        {isLargeDesktop && <span>Large Desktop</span>}
      </div>

      <nav data-testid="navigation">
        {isMobile ? (
          <button data-testid="mobile-menu">☰</button>
        ) : (
          <div data-testid="desktop-nav">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        )}
      </nav>

      <main className={isMobile ? 'px-4' : 'px-8'}>
        <h1 className={isMobile ? 'text-2xl' : 'text-4xl'}>Responsive Title</h1>
      </main>
    </div>
  );
};

describe('Responsive Layout Integration Tests', () => {
  let matchMediaMock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setViewport = (width) => {
    matchMediaMock.mockImplementation((query) => {
      // Parse the query to determine if it matches
      const minWidthMatch = query.match(/min-width:\s*(\d+)px/);
      const maxWidthMatch = query.match(/max-width:\s*(\d+)px/);

      let matches = true;

      if (minWidthMatch) {
        const minWidth = parseInt(minWidthMatch[1], 10);
        matches = matches && width >= minWidth;
      }

      if (maxWidthMatch) {
        const maxWidth = parseInt(maxWidthMatch[1], 10);
        matches = matches && width <= maxWidth;
      }

      return {
        matches,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
    });
  };

  it('renders mobile layout on small viewport', () => {
    setViewport(375); // Mobile width
    render(<ResponsiveComponent />);

    expect(screen.getByText('Mobile')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-nav')).not.toBeInTheDocument();
  });

  it('renders tablet layout on medium viewport', () => {
    setViewport(768); // Tablet width
    render(<ResponsiveComponent />);

    // Should show tablet indicator
    expect(screen.getByText('Tablet')).toBeInTheDocument();
  });

  it('renders desktop layout on large viewport', () => {
    setViewport(1280); // Desktop width
    render(<ResponsiveComponent />);

    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-nav')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });

  it('renders large desktop layout on extra large viewport', () => {
    setViewport(1920); // Large desktop width
    render(<ResponsiveComponent />);

    expect(screen.getByText('Large Desktop')).toBeInTheDocument();
  });

  it('applies correct mobile classes', () => {
    setViewport(375);
    const { container } = render(<ResponsiveComponent />);

    const main = container.querySelector('main');
    expect(main).toHaveClass('px-4');

    const h1 = container.querySelector('h1');
    expect(h1).toHaveClass('text-2xl');
  });

  it('applies correct desktop classes', () => {
    setViewport(1280);
    const { container } = render(<ResponsiveComponent />);

    const main = container.querySelector('main');
    expect(main).toHaveClass('px-8');

    const h1 = container.querySelector('h1');
    expect(h1).toHaveClass('text-4xl');
  });

  it('updates layout when viewport changes', () => {
    setViewport(375);
    const { rerender } = render(<ResponsiveComponent />);

    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

    // Simulate viewport change to desktop
    setViewport(1280);
    rerender(<ResponsiveComponent />);

    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    expect(screen.getByTestId('desktop-nav')).toBeInTheDocument();
  });

  it('handles breakpoint edge cases correctly', () => {
    // Test at exactly 640px (mobile/tablet boundary)
    setViewport(640);
    const { rerender } = render(<ResponsiveComponent />);
    expect(screen.queryByText('Mobile')).not.toBeInTheDocument();

    // Test at exactly 1024px (tablet/desktop boundary)
    setViewport(1024);
    rerender(<ResponsiveComponent />);
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });

  it('maintains consistency across multiple components', () => {
    setViewport(375);

    render(
      <div>
        <ResponsiveComponent />
        <ResponsiveComponent />
      </div>
    );

    const mobileMenus = screen.getAllByTestId('mobile-menu');
    expect(mobileMenus).toHaveLength(2);
  });
});
