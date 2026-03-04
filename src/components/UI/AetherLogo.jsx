import React from 'react';

/**
 * AetherLogo - Aether brand logo with colorful overlapping circles
 * Represents AI convergence and creativity
 */
function AetherLogo({ size = 40, className = '' }) {
  return (
    <img
      src="/logos/aether-logo.png"
      alt="Aether Logo"
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: 'contain',
        userSelect: 'none',
      }}
      draggable={false}
    />
  );
}

export default AetherLogo;
