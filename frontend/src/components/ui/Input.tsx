import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon: LeftIcon, rightIcon: RightIcon, helperText, className = '', ...props }, ref) => {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label className="block text-sm font-semibold text-[#3f404c]">
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e91a1]">
              <LeftIcon size={18} />
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-white/70 backdrop-blur border rounded-xl
              text-[#3f404c] placeholder-[#8e91a1]
              focus:outline-none focus:border-[#e8614a] focus:ring-2 focus:ring-[#e8614a]/10
              transition-all duration-300
              ${LeftIcon ? 'pl-12' : ''}
              ${RightIcon ? 'pr-12' : ''}
              ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-[#d9dae0] hover:border-[#b6b8c3]'}
            `}
            {...props}
          />
          {RightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e91a1]">
              <RightIcon size={18} />
            </span>
          )}
        </div>
        {error && (
          <span className="text-sm text-red-500 font-medium">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-sm text-[#6f7286]">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
