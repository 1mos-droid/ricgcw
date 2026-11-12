// Adapted from Kokonut UI slide-text-button. Copyright (c) 2025 kokonutUI, MIT.
// React Router / MUI adapter replaces Next Link; original two-label slide interaction retained.
import React from 'react';
import { Button } from '@mui/material';

export default function SlideTextButton({ children, hoverText, className = '', ...props }) {
  if (props.variant && props.variant !== 'contained') {
    return <Button {...props} className={className}>{children}</Button>;
  }
  return (
    <Button {...props} className={`ku-slide-button ${className}`}>
      <span className="ku-slide-labels">
        <span className="ku-slide-front">{children}</span>
        <span className="ku-slide-back" aria-hidden="true">{hoverText || children}</span>
      </span>
    </Button>
  );
}
