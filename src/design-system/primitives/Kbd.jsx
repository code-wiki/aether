import React from 'react';
import clsx from 'clsx';

const Kbd = ({ children, className, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center px-2 py-1 text-xs font-medium font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded shadow-sm';

  return (
    <kbd
      className={clsx(baseStyles, className)}
      {...props}
    >
      {children}
    </kbd>
  );
};

export default Kbd;
