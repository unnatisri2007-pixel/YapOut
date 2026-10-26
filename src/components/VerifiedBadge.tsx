import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { VerificationTier } from '../types';

interface VerifiedBadgeProps {
  tier?: VerificationTier;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  userName?: string;
  onBadgeClick?: (tier: VerificationTier, userName?: string, e?: React.MouseEvent) => void;
  showLabel?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  tier = 'identity_verified',
  size = 'sm',
  userName,
  onBadgeClick,
  showLabel = false,
  className = '',
}) => {
  if (!tier || tier === 'none') return null;

  const isIdentity = tier === 'identity_verified';

  // Sizing styles
  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const containerSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-xs font-semibold',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBadgeClick) {
      onBadgeClick(tier, userName, e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isIdentity ? 'Identity Verified on YapOut (Tap for details)' : 'Phone Verified on YapOut (Tap for details)'}
      aria-label={isIdentity ? 'Identity Verified Member' : 'Phone Verified Member'}
      className={`inline-flex items-center gap-1 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer select-none ${className}`}
    >
      <div
        className={`${containerSizes[size]} rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isIdentity
            ? 'bg-gradient-to-tr from-[#9333ea] to-[#c084fc] text-black shadow-purple-500/20 ring-1 ring-[#c084fc]/50'
            : 'bg-[#bef264] text-black shadow-lime-500/20 ring-1 ring-[#bef264]/60'
        }`}
      >
        {isIdentity ? (
          <ShieldCheck className={`${iconSizes[size]} text-white stroke-[2.8]`} />
        ) : (
          <Check className={`${iconSizes[size]} text-black stroke-[3]`} />
        )}
      </div>

      {showLabel && (
        <span
          className={`font-medium tracking-tight whitespace-nowrap ${textSizes[size]} ${
            isIdentity ? 'text-[#c084fc]' : 'text-[#bef264]'
          }`}
        >
          {isIdentity ? 'ID Verified' : 'Phone Verified'}
        </span>
      )}
    </button>
  );
};
