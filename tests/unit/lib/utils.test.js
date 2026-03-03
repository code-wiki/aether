import { cn } from '../../../src/lib/utils';

describe('cn (className utility)', () => {
  it('combines multiple class names', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('filters out falsy values', () => {
    const result = cn('class1', false, 'class2', null, undefined, 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn('base', isActive && 'active', isDisabled && 'disabled');
    expect(result).toBe('base active');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with boolean values', () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
      hover: false,
    });
    expect(result).toBe('base active');
  });

  it('handles mixed arguments', () => {
    const result = cn('base', ['array1', 'array2'], { conditional: true, falsy: false }, 'end');
    expect(result).toBe('base array1 array2 conditional end');
  });

  it('returns empty string when no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('returns empty string when all falsy', () => {
    const result = cn(false, null, undefined, '');
    expect(result).toBe('');
  });

  it('handles single string', () => {
    const result = cn('single-class');
    expect(result).toBe('single-class');
  });

  it('deduplicates repeated classes', () => {
    // clsx deduplicates by default
    const result = cn('class1', 'class2', 'class1');
    expect(result).toBe('class1 class2');
  });

  it('works with tailwind classes', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500', 'hover:bg-blue-600');
    expect(result).toBe('px-4 py-2 bg-blue-500 hover:bg-blue-600');
  });

  it('handles responsive and variant classes', () => {
    const isMobile = true;
    const isPrimary = true;

    const result = cn(
      'button',
      isMobile ? 'text-sm' : 'text-base',
      isPrimary && 'bg-primary',
      !isPrimary && 'bg-secondary'
    );
    expect(result).toBe('button text-sm bg-primary');
  });
});
