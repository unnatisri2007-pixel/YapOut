import React from 'react';

export type ButtonVariant = 'lime' | 'pink' | 'lavender' | 'blue' | 'yellow' | 'dark' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'pill-sm' | 'pill-md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'lime',
  size = 'md',
  pill = false,
  className = '',
  children,
  ...props
}) => {
  const variantClasses: Record<ButtonVariant, string> = {
    lime: 'btn-genz-lime',
    pink: 'btn-genz-pink',
    lavender: 'btn-genz-lavender',
    blue: 'btn-genz-blue',
    yellow: 'btn-genz-yellow',
    dark: 'btn-genz-dark',
    danger: 'btn-genz-danger',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-[11px] rounded-lg',
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl',
    icon: 'w-9 h-9 p-0 flex items-center justify-center rounded-xl',
    'pill-sm': 'px-3.5 py-1.5 text-xs rounded-full',
    'pill-md': 'px-5 py-2.5 text-xs sm:text-sm rounded-full',
  };

  const pillClass = pill ? '!rounded-full' : '';

  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${pillClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
