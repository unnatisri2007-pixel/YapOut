import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Check, Lock, Shield, ArrowRight, UserCheck, Smartphone } from 'lucide-react';
import { VerificationTier } from '../types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: VerificationTier;
  userName?: string;
  onNavigateToVerificationCenter?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  tier = 'identity_verified',
  userName,
  onNavigateToVerificationCenter,
}) => {
  if (!isOpen) return null;

  const isIdentity = tier === 'identity_verified';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#141622] border border-[#232736] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header with Visual Accent */}
        <div className="relative p-6 bg-gradient-to-b from-[#1c1a2e] to-[#141622] border-b border-[#232736] text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#232736] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge Icon Emblem */}
          <div
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-xl ${
              isIdentity
                ? 'bg-gradient-to-tr from-[#9333ea] to-[#c084fc] text-white shadow-purple-500/25 ring-4 ring-purple-500/20'
                : 'bg-[#bef264] text-black shadow-lime-500/25 ring-4 ring-lime-500/20'
            }`}
          >
            {isIdentity ? (
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            ) : (
              <Check className="w-8 h-8 stroke-[3]" />
            )}
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {isIdentity ? 'Identity Verified Member' : 'Phone Verified Member'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {userName ? `${userName} has earned a verified trust badge on YapOut.` : 'YapOut Verified Profile Trust Standard'}
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 text-xs text-gray-300">
          {/* Explanation of the tier */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              What This Badge Signifies
            </h4>

            {isIdentity ? (
              <div className="p-3.5 rounded-2xl bg-[#0e1017] border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <UserCheck className="w-4 h-4 text-[#c084fc]" />
                  <span>Government ID & Liveness Verified</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  This member’s official government document (Passport, Driver License, or National ID) and biometric liveness check have been verified through an accredited identity verification partner.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#0e1017] border border-lime-500/30 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Smartphone className="w-4 h-4 text-[#bef264]" />
                  <span>Two-Factor Phone Verified</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  This member has successfully verified a real, carrier-backed mobile phone number via 6-digit SMS OTP, ensuring non-duplicate accounts and discouraging spam.
                </p>
              </div>
            )}
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="p-3.5 rounded-2xl bg-[#0e1017] border border-[#232736] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <Lock className="w-3.5 h-3.5 text-[#bef264]" />
              <span>Data Privacy & Security Handling</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              YapOut adheres to strict SOC2 and GDPR compliance. All identity verification payloads use 256-bit AES encryption. Unencrypted raw biometric and government documents are never stored on public servers or shared with other members.
            </p>
          </div>

          {/* Standards list */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Community Trust Standards
            </h4>
            <div className="space-y-1.5 text-[11px] text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
                <span>Zero tolerance for impersonation, fake profiles, or bot accounts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                <span>Encourages accountability and authentic real-world connections</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Subject to community reporting and immediate badge revocation on violation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0e1017] border-t-2 border-[#232736] flex items-center justify-between gap-3">
          {onNavigateToVerificationCenter ? (
            <button
              onClick={() => {
                onClose();
                onNavigateToVerificationCenter();
              }}
              className="w-full py-3 rounded-xl btn-genz-lime text-xs flex items-center justify-center gap-2"
            >
              <span>Get Your Profile Verified</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#12131A] stroke-[3]" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl btn-genz-dark text-xs font-bold"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
