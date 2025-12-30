'use client';

import type { ToolbarButtonProps } from '../types';

export default function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        rounded p-1.5 transition-colors
        ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}
        ${disabled ? 'cursor-not-allowed opacity-40' : ''}
      `}
    >
      {children}
    </button>
  );
}
