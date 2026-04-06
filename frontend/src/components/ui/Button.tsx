import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#e8614a] text-white hover:bg-[#d14f3d] shadow-lg shadow-[#e8614a]/25';
      case 'secondary':
        return 'bg-[#6f7286] text-white hover:bg-[#5a5d6d]';
      case 'outline':
        return 'bg-transparent border border-[#d9dae0] text-[#6f7286] hover:border-[#e8614a] hover:text-[#e8614a]';
      case 'ghost':
        return 'bg-transparent text-[#6f7286] hover:bg-[#f8f8f9]';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'success':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'xl':
        return 'px-8 py-4 text-xl';
      default:
        return '';
    }
  };

  const classes = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300',
    getVariantClasses(),
    getSizeClasses(),
    fullWidth ? 'w-full' : '',
    (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && LeftIcon && <LeftIcon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />}
      {children}
      {!isLoading && RightIcon && <RightIcon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />}
    </button>
  );
};
