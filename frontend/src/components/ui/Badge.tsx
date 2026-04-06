import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
  leftIcon?: LucideIcon;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  leftIcon: LeftIcon,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-[#f8f8f9] text-[#6f7286] border border-[#d9dae0]',
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    outline: 'bg-transparent text-[#6f7286] border border-[#d9dae0]',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const classes = [
    'inline-flex items-center gap-1 rounded-full font-medium',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <span className={classes}>
      {LeftIcon && <LeftIcon size={size === 'sm' ? 12 : 14} />}
      {children}
    </span>
  );
};
