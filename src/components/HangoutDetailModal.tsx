import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Share2,
  Flag,
  Check,
  Sparkles,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { Hangout, VerificationTier } from '../types';
import { useToast } from '../context/ToastContext';
import { VerifiedBadge } from './VerifiedBadge';

interface HangoutDetailModalProps {
  hangout: Hangout | null;
  onClose: () => void;
  onJoinToggle: (e: React.MouseEvent, hangoutId: string, isCurrentlyJoined: boolean) => void;
  onOpenReport: (hangoutId: string) => void;
  onBadgeClick?: (tier: VerificationTier, userName?: string) => void;
}

export const HangoutDetailModal: React.FC<HangoutDetailModalProps> = ({
  hangout,
  onClose,
  onJoinToggle,
  onOpenReport,
  onBadgeClick,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!hangout) return null;

  const spotsLeft = Math.max(0, hangout.groupSizeLimit - hangout.currentMembersCount);
  const fillPercentage = Math.min(
    100,
    Math.round((hangout.currentMembersCount / hangout.groupSizeLimit) * 100)
  );
  const isFull = spotsLeft === 0 && !hangout.isJoined;

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`${hangout.title} - Join us on YapOut: ${url}`);
    setCopied(true);
    showToast('Hangout link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full sm:max-w-2xl bg-[#12141d] border-t sm:border border-[#232736] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-gray-700 rounded-full mx-auto my-3 shrink-0" />

        {/* Hero Header with Media */}
        <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full overflow-hidden bg-[#181a24] shrink-0">
          {!imageError ? (
            <img
              src={hangout.coverImage}
              alt={hangout.title}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-900/40 to-slate-900">
              <span className="font-semibold text-purple-300">{hangout.activityCategory}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141d] via-black/40 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share Hangout"
              className="btn-genz-dark !w-9 !h-9 !p-0 !rounded-xl"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="btn-genz-dark !w-9 !h-9 !p-0 !rounded-xl hover:!border-[#FF83C8]"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Badge & Category */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className="text-xs font-bold text-[#bef264] tracking-wide">
              {hangout.activityCategory}
            </span>
            <span className="text-xs text-gray-300 font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10">
              Budget: {hangout.budget}
            </span>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-gray-300 text-sm">
          {/* Title & Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
              <span>{hangout.location.neighborhood}</span>
              <span aria-hidden="true" className="text-gray-600">·</span>
              <span>{hangout.dateTime}</span>
              <span aria-hidden="true" className="text-gray-600">·</span>
              <span className="capitalize">{hangout.privacy.replace('_', ' ')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {hangout.title}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed pt-1">
              {hangout.description}
            </p>

            {/* Host Profile & Trust Bar */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0e1017] border border-[#232736] mt-3">
              <img
                src={hangout.host.avatar}
                alt={hangout.host.name}
                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white truncate">{hangout.host.name}</span>
                  <span className="text-[10px] bg-purple-500/20 text-[#c084fc] px-1.5 py-0.5 rounded font-medium border border-purple-500/30">
                    Host
                  </span>
                  {hangout.host.isVerified && (
                    <VerifiedBadge
                      tier={hangout.host.verificationTier || 'phone_verified'}
                      size="xs"
                      showLabel={true}
                      onBadgeClick={(tier) => onBadgeClick?.(tier, hangout.host.name)}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                  <span>{hangout.host.handle}</span>
                  {hangout.host.bio && (
                    <>
                      <span className="text-gray-600">·</span>
                      <span className="font-sans text-gray-400 truncate max-w-xs">{hangout.host.bio}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#0e1017] border border-[#232736] rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">When</span>
              <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#bef264]" />
                <span className="truncate">{hangout.dateTime}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Where</span>
              <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#a855f7]" />
                <span className="truncate">{hangout.location.name}</span>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-0.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Capacity</span>
              <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {hangout.currentMembersCount} of {hangout.groupSizeLimit} ({spotsLeft} left)
                </span>
              </div>
            </div>
          </div>

          {/* Group Capacity Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">Group spots fill rate</span>
              <span className="font-mono text-gray-400">{fillPercentage}% full</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#1b1e2b] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9333ea] to-[#bef264] rounded-full transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Location Pin Details */}
          <div className="p-3.5 bg-[#161823] border border-[#232736] rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-[#a855f7] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <span>{hangout.location.name}</span>
                <span className="text-gray-400 text-[11px]">({hangout.location.neighborhood})</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{hangout.location.address}</p>
            </div>
          </div>

          {/* Itinerary Timeline */}
          {hangout.itinerary && hangout.itinerary.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#bef264]" /> Planned Schedule
              </h4>
              <div className="space-y-2 border-l border-[#2d3246] ml-2 pl-3">
                {hangout.itinerary.map((item, idx) => (
                  <div key={idx} className="relative text-xs space-y-0.5">
                    <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#a855f7]" />
                    <span className="font-mono text-gray-400 block">{item.time}</span>
                    <p className="font-medium text-white">{item.activity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#a855f7]" /> Confirmed Members ({hangout.members.length})
              </h4>
              <span className="text-xs text-gray-500">Max {hangout.groupSizeLimit}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {hangout.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0e1017] border border-[#232736]/60"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate">{member.name}</span>
                      {member.role === 'host' && (
                        <span className="text-[10px] bg-purple-500/20 text-[#c084fc] px-1.5 py-0.2 rounded font-medium border border-purple-500/30">
                          Host
                        </span>
                      )}
                      {member.isVerified && (
                        <VerifiedBadge
                          tier={member.verificationTier || 'phone_verified'}
                          size="xs"
                          onBadgeClick={(tier) => onBadgeClick?.(tier, member.name)}
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{member.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {hangout.tags && hangout.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs text-gray-400">Vibes & Interests</span>
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300">
                {hangout.tags.map((tag, i) => (
                  <span key={i} className="text-gray-300">
                    #{tag}
                    {i < hangout.tags.length - 1 && <span className="text-gray-600 ml-2">·</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safety & Report Trigger */}
          <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-[#232736]/60">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gray-400" /> YapOut Verified Community Event
            </span>
            <button
              onClick={() => onOpenReport(hangout.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-gray-300 hover:text-white bg-[#1a1c29] border border-[#2d3246] hover:border-[#ff5277] transition-all"
            >
              <Flag className="w-3.5 h-3.5 text-[#ff5277]" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-4 bg-[#0e1017] border-t-2 border-[#232736] flex items-center gap-3 shrink-0">
          <button
            onClick={handleShare}
            className="btn-genz-blue rounded-xl px-4 py-3 text-xs flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-[#12131A] stroke-[2.5]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={(e) => onJoinToggle(e, hangout.id, Boolean(hangout.isJoined))}
            disabled={isFull}
            className={`flex-1 h-12 rounded-xl text-sm flex items-center justify-center gap-2 ${
              hangout.isJoined
                ? 'btn-genz-pink'
                : isFull
                ? 'btn-genz-dark !border-gray-800 !text-gray-500 !shadow-none cursor-not-allowed'
                : 'btn-genz-lime'
            }`}
          >
            {hangout.isJoined ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>You're in this hangout (Tap to Leave)</span>
              </>
            ) : isFull ? (
              <span>Hangout is at Full Capacity</span>
            ) : (
              <span>Join Hangout ({spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left)</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
