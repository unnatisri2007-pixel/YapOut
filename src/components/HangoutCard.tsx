import React, { useState } from 'react';
import { Bookmark, MapPin, Users, Calendar, Sparkles, Check, ChevronRight } from 'lucide-react';
import { Hangout, VerificationTier } from '../types';
import { VerifiedBadge } from './VerifiedBadge';

interface HangoutCardProps {
  hangout: Hangout;
  onOpenDetails: (hangout: Hangout) => void;
  onJoinToggle: (e: React.MouseEvent, hangoutId: string, isCurrentlyJoined: boolean) => void;
  onSaveToggle: (e: React.MouseEvent, hangoutId: string) => void;
  onBadgeClick?: (tier: VerificationTier, userName?: string) => void;
}

export const HangoutCard: React.FC<HangoutCardProps> = ({
  hangout,
  onOpenDetails,
  onJoinToggle,
  onSaveToggle,
  onBadgeClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const spotsLeft = Math.max(0, hangout.groupSizeLimit - hangout.currentMembersCount);
  const isFull = spotsLeft === 0 && !hangout.isJoined;

  return (
    <article
      onClick={() => onOpenDetails(hangout)}
      className="group relative bg-[#141620] hover:bg-[#181b27] border border-[#232736] hover:border-[#a855f7]/50 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col shadow-lg shadow-black/30 hover:shadow-purple-950/20 active:scale-[0.99]"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#181a24]">
        {!imageError ? (
          <img
            src={hangout.coverImage}
            alt={hangout.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1e1b2e] to-[#12141c] text-gray-400 p-4 text-center">
            <Sparkles className="w-6 h-6 text-[#a855f7] mb-1" />
            <span className="text-xs font-semibold text-gray-300">{hangout.activityCategory}</span>
          </div>
        )}

        {/* Subtle Scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141620] via-black/30 to-transparent" />

        {/* Top Floating Controls: Save & Budget */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={(e) => onSaveToggle(e, hangout.id)}
            aria-label={hangout.isSaved ? 'Remove from saved' : 'Save hangout'}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              hangout.isSaved
                ? 'btn-genz-yellow !w-9 !h-9 !p-0 shadow-md'
                : 'bg-[#12131A]/80 text-white/90 hover:text-white border-2 border-white/20 hover:border-[#FF83C8] shadow-[2px_2px_0px_#12131A] active:translate-y-0.5'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${hangout.isSaved ? 'fill-current text-[#12131A]' : ''}`} />
          </button>
        </div>

        {/* Category & Budget Overlay Indicator */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
          <span className="font-extrabold text-[#C9FF59] drop-shadow-sm tracking-wide">
            {hangout.activityCategory}
          </span>
          <span className="font-mono text-xs font-bold text-gray-200 bg-[#12131A]/85 backdrop-blur-sm px-2.5 py-0.5 rounded-lg border border-white/15 shadow-sm">
            {hangout.budget}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Unboxed Metadata Line (Zero-pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
            <span>{hangout.location.neighborhood}</span>
            <span aria-hidden="true" className="text-gray-600">·</span>
            <span>{hangout.dateTime}</span>
            <span aria-hidden="true" className="text-gray-600">·</span>
            <span
              className={
                hangout.isJoined
                  ? 'text-[#bef264] font-medium'
                  : spotsLeft <= 2 && spotsLeft > 0
                  ? 'text-amber-400 font-medium'
                  : isFull
                  ? 'text-red-400 font-medium'
                  : 'text-gray-300'
              }
            >
              {hangout.isJoined
                ? 'You are in'
                : isFull
                ? 'Hangout full'
                : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#bef264] transition-colors line-clamp-1 leading-snug">
            {hangout.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed">
            {hangout.description}
          </p>
        </div>

        {/* Host and Quick Action Footer */}
        <div className="pt-3 border-t border-[#232736]/70 flex items-center justify-between gap-3">
          {/* Host info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={hangout.host.avatar}
              alt={hangout.host.name}
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {hangout.host.name}
                </p>
                {hangout.host.isVerified && (
                  <VerifiedBadge
                    tier={hangout.host.verificationTier || 'phone_verified'}
                    size="xs"
                    onBadgeClick={(tier) => {
                      if (onBadgeClick) onBadgeClick(tier, hangout.host.name);
                    }}
                  />
                )}
              </div>
              <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                {hangout.currentMembersCount}/{hangout.groupSizeLimit} attending
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={(e) => onJoinToggle(e, hangout.id, Boolean(hangout.isJoined))}
            disabled={isFull}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              hangout.isJoined
                ? 'btn-genz-pink'
                : isFull
                ? 'btn-genz-dark !border-gray-800 !text-gray-500 !shadow-none cursor-not-allowed'
                : 'btn-genz-lime'
            }`}
          >
            {hangout.isJoined ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Joined</span>
              </>
            ) : isFull ? (
              <span>Full</span>
            ) : (
              <span>Join</span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
