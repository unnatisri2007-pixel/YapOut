import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User,
  MapPin,
  Calendar,
  Bookmark,
  Shield,
  ShieldCheck,
  Edit3,
  Check,
  Plus,
  Compass,
  Lock,
  Eye,
  LogOut,
  Smartphone,
  UserCheck,
  AlertCircle,
  Clock,
  RefreshCw,
  Info,
  CheckCircle2,
  FileText,
  KeyRound,
} from 'lucide-react';
import { UserProfile, Hangout, HangoutCategory, VerificationTier } from '../types';
import { HangoutCard } from '../components/HangoutCard';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { useToast } from '../context/ToastContext';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  hangouts: Hangout[];
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenDetails: (hangout: Hangout) => void;
  onJoinToggle: (e: React.MouseEvent, hangoutId: string, isCurrentlyJoined: boolean) => void;
  onSaveToggle: (e: React.MouseEvent, hangoutId: string) => void;
  onNavigateToCreate: () => void;
  onBadgeClick?: (tier: VerificationTier, userName?: string) => void;
}

const ALL_INTERESTS: HangoutCategory[] = [
  'Coffee & Yap',
  'Bouldering & Climbing',
  'Board Games',
  'Foodie & Night Market',
  'Indie Cinema & Arts',
  'Outdoor & Hiking',
  'Creative & Jamming',
  'Tech & Hack',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  hangouts,
  onUpdateProfile,
  onOpenDetails,
  onJoinToggle,
  onSaveToggle,
  onNavigateToCreate,
  onBadgeClick,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'joined' | 'created' | 'saved' | 'verification' | 'settings'>('joined');

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editHandle, setEditHandle] = useState(currentUser?.handle || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || '');
  const [editInterests, setEditInterests] = useState<string[]>(currentUser?.interests || []);
  const [privacySettings, setPrivacySettings] = useState(
    currentUser?.privacySettings || {
      showProfileInMembers: true,
      allowDirectInvites: true,
    }
  );

  // Verification state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const [legalFullName, setLegalFullName] = useState(currentUser?.name || '');
  const [documentType, setDocumentType] = useState<'passport' | 'drivers_license' | 'national_id'>('drivers_license');
  const [isSubmittingIdentity, setIsSubmittingIdentity] = useState(false);

  const joinedHangouts = hangouts.filter((h) => h.isJoined);
  const createdHangouts = hangouts.filter((h) => h.host.id === currentUser?.id);
  const savedHangouts = hangouts.filter((h) => h.isSaved);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<UserProfile> = {
        name: editName.trim(),
        handle: editHandle.trim(),
        bio: editBio.trim(),
        location: editLocation.trim(),
        interests: editInterests,
        privacySettings,
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onUpdateProfile(data.data);
        setIsEditing(false);
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    }
  };

  const toggleInterest = (interest: string) => {
    if (editInterests.includes(interest)) {
      setEditInterests(editInterests.filter((i) => i !== interest));
    } else {
      setEditInterests([...editInterests, interest]);
    }
  };

  // Verification Handlers
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      showToast('Please enter your mobile phone number.', 'error');
      return;
    }
    setIsSendingOtp(true);
    setDevCodeHint(null);
    try {
      const res = await fetch('/api/verification/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        if (data.sessionId) {
          setOtpSessionId(data.sessionId);
        }
        if (data.devTokenHint || data.devCodeHint) {
          setDevCodeHint(data.devTokenHint || data.devCodeHint);
        }
        showToast(data.message || 'Verification code sent to your phone!', 'success');
      } else {
        showToast(data.error || 'Failed to send verification code', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error sending code', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      showToast('Please enter the 6-digit code sent to your phone.', 'error');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/verification/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: otpSessionId,
          code: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Phone verified successfully! You unlocked the Phone Verified Badge ⚡', 'success');
        if (data.data?.user) {
          onUpdateProfile(data.data.user);
        }
        setOtpCode('');
        setOtpSent(false);
        setDevCodeHint(null);
      } else {
        showToast(data.error || 'Invalid verification code', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error verifying code', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleStartIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalFullName.trim()) {
      showToast('Please enter your full legal name as it appears on your government document.', 'error');
      return;
    }
    setIsSubmittingIdentity(true);
    try {
      const res = await fetch('/api/verification/identity/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalFullName: legalFullName.trim(),
          documentType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Identity verification initiated!', 'success');
        if (data.data?.user) {
          onUpdateProfile(data.data.user);
        }
      } else {
        showToast(data.error || 'Failed to initiate identity verification', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error during identity verification', 'error');
    } finally {
      setIsSubmittingIdentity(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Header Card */}
      <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'Profile'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#a855f7] shadow-xl"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#bef264] border-2 border-[#141620]" />
            </div>

            {/* Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{currentUser?.name}</h1>
                {currentUser?.verification?.status === 'verified' ? (
                  <VerifiedBadge
                    tier={currentUser.verification.tier}
                    size="sm"
                    showLabel={true}
                    userName={currentUser.name}
                    onBadgeClick={(tier, name) => onBadgeClick?.(tier, name || currentUser.name)}
                  />
                ) : (
                  <button
                    onClick={() => setActiveTab('verification')}
                    className="btn-genz-lime !rounded-full !px-3 !py-1 text-[11px] inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#12131A] stroke-[2.5]" />
                    <span>Get Verified</span>
                  </button>
                )}
                <span className="text-xs text-gray-400 font-mono">{currentUser?.handle}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 justify-center sm:justify-start">
                <MapPin className="w-3.5 h-3.5 text-[#C9FF59]" />
                <span>{currentUser?.location}</span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed pt-1">
                {currentUser?.bio}
              </p>
            </div>
          </div>

          {/* Profile Actions: Edit */}
          <div className="flex items-center gap-2.5 self-center sm:self-start flex-wrap">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-genz-dark rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#B99AFF]" />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Interests & Vibes tags */}
        <div className="pt-4 border-t border-[#232736]/70 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
            Favorite Hangout Vibes & Interests
          </span>
          <div className="flex flex-wrap gap-2">
            {currentUser?.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-lg bg-[#0e1017] border border-[#232736] text-xs text-gray-200 font-medium"
              >
                #{interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Form (Collapsible) */}
      {isEditing && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="bg-[#12141d] border border-[#a855f7]/40 rounded-3xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#232736] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#a855f7]" /> Edit Profile & Preferences
            </h3>
            <span className="text-xs text-gray-400">Updates sync immediately</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 block">Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 block">Handle</label>
              <input
                type="text"
                value={editHandle}
                onChange={(e) => setEditHandle(e.target.value)}
                className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 block">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 block">Short Bio</label>
              <input
                type="text"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                required
              />
            </div>
          </div>

          {/* Interests selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">
              Toggle Favorite Hangout Activities
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map((interest) => {
                const active = editInterests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#bef264] text-black font-semibold'
                        : 'bg-[#0c0d12] text-gray-400 border border-[#232736] hover:text-white'
                    }`}
                  >
                    {active ? `✓ ${interest}` : `+ ${interest}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-genz-dark rounded-xl px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-genz-lime rounded-xl px-5 py-2 text-xs"
            >
              Save Profile
            </button>
          </div>
        </motion.form>
      )}

      {/* Tabs Row (Segmented control) */}
      <div className="flex items-center gap-2 p-1.5 bg-[#141620] border-2 border-[#232736] rounded-2xl overflow-x-auto scrollbar-none shadow-[2px_2px_0px_#090a0f]">
        <button
          onClick={() => setActiveTab('joined')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all ${
            activeTab === 'joined'
              ? 'btn-genz-lime'
              : 'text-gray-400 hover:text-white font-semibold'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Joined Hangouts ({joinedHangouts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('created')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all ${
            activeTab === 'created'
              ? 'btn-genz-yellow'
              : 'text-gray-400 hover:text-white font-semibold'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Created Plans ({createdHangouts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all ${
            activeTab === 'saved'
              ? 'btn-genz-pink'
              : 'text-gray-400 hover:text-white font-semibold'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Bookmarked ({savedHangouts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all ${
            activeTab === 'verification'
              ? 'btn-genz-lavender'
              : 'text-gray-400 hover:text-white font-semibold'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verification Center</span>
          {currentUser?.verification?.status === 'verified' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#12131A]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'btn-genz-blue'
              : 'text-gray-400 hover:text-white font-semibold'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy & Safety</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'joined' && (
          <div className="space-y-4">
            {joinedHangouts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedHangouts.map((h) => (
                  <HangoutCard
                    key={h.id}
                    hangout={h}
                    onOpenDetails={onOpenDetails}
                    onJoinToggle={onJoinToggle}
                    onSaveToggle={onSaveToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="py-14 text-center bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-3">
                <Calendar className="w-8 h-8 text-gray-500 mx-auto" />
                <h4 className="text-base font-bold text-white">No joined hangouts yet</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Browse the feed or discover page to join activities you love.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'created' && (
          <div className="space-y-4">
            {createdHangouts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdHangouts.map((h) => (
                  <HangoutCard
                    key={h.id}
                    hangout={h}
                    onOpenDetails={onOpenDetails}
                    onJoinToggle={onJoinToggle}
                    onSaveToggle={onSaveToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="py-14 text-center bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-4">
                <Plus className="w-8 h-8 text-gray-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">You haven’t hosted any hangouts yet</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Take the initiative! Host a coffee chat, board game evening, or photowalk.
                  </p>
                </div>
                <button
                  onClick={onNavigateToCreate}
                  className="btn-genz-yellow rounded-xl px-5 py-2.5 text-xs"
                >
                  Create Your First Hangout
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedHangouts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedHangouts.map((h) => (
                  <HangoutCard
                    key={h.id}
                    hangout={h}
                    onOpenDetails={onOpenDetails}
                    onJoinToggle={onJoinToggle}
                    onSaveToggle={onSaveToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="py-14 text-center bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-3">
                <Bookmark className="w-8 h-8 text-gray-500 mx-auto" />
                <h4 className="text-base font-bold text-white">No bookmarked hangouts</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Tap the bookmark icon on any hangout card to save it for later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Verification Center Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-6 max-w-3xl">
            {/* Header Card & Privacy Notice */}
            <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 sm:p-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232736] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#bef264]/20 text-[#bef264] border border-[#bef264]/30 uppercase">
                      Trust & Safety Standard
                    </span>
                    <span className="text-xs text-gray-400 font-mono">SOC-2 & GDPR Certified</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#a855f7]" /> YapOut Profile Verification Center
                  </h3>
                </div>

                {currentUser?.verification?.status === 'verified' && (
                  <VerifiedBadge
                    tier={currentUser.verification.tier}
                    size="md"
                    showLabel={true}
                    userName={currentUser.name}
                    onBadgeClick={(tier, name) => onBadgeClick?.(tier, name || currentUser.name)}
                  />
                )}
              </div>

              {/* Data Handling & Privacy Guarantee */}
              <div className="p-4 rounded-2xl bg-[#0c0d12] border border-[#232736] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Lock className="w-3.5 h-3.5 text-[#bef264]" />
                  <span>How We Handle Your Personal Data</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your privacy is sacred. All verification data is transmitted with 256-bit AES encryption. Unencrypted raw ID documents and biometric data are never stored on public servers or shared with other members. Badges verify authentic identity without revealing personal phone numbers or legal records.
                </p>
              </div>
            </div>

            {/* Current Status Overview */}
            <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Your Current Verification Status
              </h4>

              <div className="p-4 rounded-2xl bg-[#0e1017] border border-[#232736] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                      currentUser?.verification?.tier === 'identity_verified'
                        ? 'bg-gradient-to-tr from-[#9333ea] to-[#c084fc] text-white shadow-purple-500/20'
                        : currentUser?.verification?.tier === 'phone_verified'
                        ? 'bg-[#bef264] text-black shadow-lime-500/20'
                        : currentUser?.verification?.identityStatus === 'pending_review'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-[#1e202c] text-gray-500'
                    }`}
                  >
                    {currentUser?.verification?.tier === 'identity_verified' ? (
                      <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                    ) : currentUser?.verification?.tier === 'phone_verified' ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : currentUser?.verification?.identityStatus === 'pending_review' ? (
                      <Clock className="w-6 h-6 stroke-[2]" />
                    ) : (
                      <Shield className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white capitalize">
                        {currentUser?.verification?.tier === 'identity_verified'
                          ? 'Tier 2: Identity Verified Member'
                          : currentUser?.verification?.tier === 'phone_verified'
                          ? 'Tier 1: Phone Verified Member'
                          : currentUser?.verification?.identityStatus === 'pending_review'
                          ? 'Identity Verification Pending Review'
                          : currentUser?.verification?.status === 'failed'
                          ? 'Verification Unsuccessful'
                          : 'Unverified Profile'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      {currentUser?.verification?.tier === 'identity_verified'
                        ? `Verified on ${currentUser?.verification?.verifiedAt || 'recent'} via ${currentUser?.verification?.provider}`
                        : currentUser?.verification?.tier === 'phone_verified'
                        ? `Phone ${currentUser.verification.phoneNumberMasked || ''} confirmed. Upgrade to Tier 2 for full Shield badge.`
                        : currentUser?.verification?.identityStatus === 'pending_review'
                        ? 'Document submitted. Superadmin moderation queue turnaround is typically under 2 hours.'
                        : currentUser?.verification?.status === 'failed'
                        ? currentUser.verification.rejectionReason || 'Requirements not met. You may retry.'
                        : 'Complete phone or official ID verification to earn trust with hosts and members.'}
                    </p>
                  </div>
                </div>

                {/* Attempt and Cooldown Status */}
                <div className="text-right sm:border-l sm:border-[#232736] sm:pl-4 space-y-1 shrink-0">
                  <span className="text-[11px] text-gray-400 block">
                    Attempts:{' '}
                    <span className="font-mono text-white font-semibold">
                      {currentUser?.verification?.attemptsCount || 0} / {currentUser?.verification?.maxAttempts || 3}
                    </span>
                  </span>
                  {currentUser?.verification?.cooldownUntil && (
                    <span className="text-[10px] text-amber-400 font-mono block">
                      Cooldown active
                    </span>
                  )}
                </div>
              </div>

              {/* Rejection notice with retry guidance if failed */}
              {currentUser?.verification?.status === 'failed' && (
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>Previous Verification Attempt Unsuccessful</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    Reason: {currentUser.verification.rejectionReason || 'Document illegible or details did not match profile.'} Please ensure your document is clearly legible and legal name matches official records.
                  </p>
                </div>
              )}
            </div>

            {/* Verification Pathway: Step 1 & Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Method 1: Phone Verification */}
              <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-lime-500/10 text-[#bef264] flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <span className="text-sm font-bold text-white">Tier 1: Phone Verification</span>
                    </div>
                    {currentUser?.verification?.phoneVerified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#bef264]/20 text-[#bef264] border border-[#bef264]/30">
                        Active ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 uppercase font-mono">2 min check</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Verify a genuine mobile carrier phone number via 6-digit SMS OTP. Prevents duplicate accounts and earns the <span className="text-[#bef264] font-medium">Lime Checkmark Badge</span>.
                  </p>

                  {currentUser?.verification?.phoneVerified ? (
                    <div className="p-3.5 rounded-xl bg-[#0c0d12] border border-[#bef264]/30 space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#bef264]" />
                        <span>Phone Number Confirmed</span>
                      </div>
                      <p className="text-gray-400 font-mono text-[11px]">
                        Linked: {currentUser.verification.phoneNumberMasked || '+1 (•••) •••-4821'}
                      </p>
                      <p className="text-[11px] text-gray-500 pt-1">
                        Carrier: Verizon Wireless US (Validated)
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={otpSent ? handleVerifyPhoneOtp : handleSendPhoneOtp} className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-300 block">
                          Mobile Phone Number
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={otpSent}
                            placeholder="+1 (555) 234-5678"
                            className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#bef264]"
                            required
                          />
                        </div>
                      </div>

                      {otpSent && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <label className="text-[11px] font-semibold text-gray-300 block">
                            Enter 6-Digit SMS Code
                          </label>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#bef264]" />
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="123456"
                              className="w-full bg-[#0c0d12] border border-[#bef264]/50 rounded-xl pl-8 pr-3 py-2 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-[#bef264]"
                              required
                            />
                          </div>

                          {devCodeHint && (
                            <div className="p-2 rounded-lg bg-[#1a1c28] border border-purple-500/30 flex items-center justify-between text-[11px]">
                              <span className="text-gray-400">Dev Sandbox Code:</span>
                              <button
                                type="button"
                                onClick={() => setOtpCode(devCodeHint)}
                                className="font-mono text-[#bef264] font-bold hover:underline"
                              >
                                {devCodeHint} (Click to auto-fill)
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                            <span>Code expires in 10 minutes</span>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtpCode('');
                              }}
                              className="text-gray-400 hover:text-white underline"
                            >
                              Change Number
                            </button>
                          </div>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={isSendingOtp || isVerifyingOtp}
                        className="w-full py-3 rounded-xl btn-genz-lime text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isSendingOtp ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending SMS...</span>
                          </>
                        ) : isVerifyingOtp ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : otpSent ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3] text-[#12131A]" />
                            <span>Confirm 6-Digit Code</span>
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-3.5 h-3.5 text-[#12131A]" />
                            <span>Send Verification Code</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                <div className="pt-3 border-t border-[#232736]/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Twilio Carrier Verification</span>
                  <span className="font-mono">Rate limited (max 3 tries)</span>
                </div>
              </div>

              {/* Method 2: Official Identity Verification */}
              <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-[#c084fc] flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <span className="text-sm font-bold text-white">Tier 2: Government ID & Liveness</span>
                    </div>
                    {currentUser?.verification?.tier === 'identity_verified' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-[#c084fc] border border-purple-500/30">
                        Active Shield ✓
                      </span>
                    ) : currentUser?.verification?.identityStatus === 'pending_review' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending Review
                      </span>
                    ) : (
                      <span className="text-[10px] text-purple-300 uppercase font-mono">Highest Trust</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Verify official government documents (Passport, Driver License, National ID) through encrypted identity infrastructure. Unlocks the <span className="text-[#c084fc] font-medium">Electric Purple Trust Shield</span>.
                  </p>

                  {/* Provider Architecture Status */}
                  <div className="p-3 rounded-xl bg-[#0c0d12] border border-[#232736] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Identity Provider:</span>
                      <span className="font-mono text-purple-300 font-semibold">Stripe Identity / Persona</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-normal">
                      In development mode without live Stripe production API keys, verification payloads are routed directly into the YapOut Superadmin Moderation Queue for review.
                    </p>
                  </div>

                  {currentUser?.verification?.tier === 'identity_verified' ? (
                    <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-[#c084fc] font-semibold">
                        <ShieldCheck className="w-4 h-4 text-[#c084fc]" />
                        <span>Identity Authenticated</span>
                      </div>
                      <p className="text-gray-300 text-[11px]">
                        Document verified and escrowed under SOC-2 encryption standards.
                      </p>
                    </div>
                  ) : currentUser?.verification?.identityStatus === 'pending_review' ? (
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-300 font-semibold">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Document In Moderation Queue</span>
                      </div>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        Your identity review has been staged for Superadmin audit. Admins can review and approve it directly in the Admin Portal.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleStartIdentity} className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-300 block">
                          Full Legal Name (as on ID)
                        </label>
                        <input
                          type="text"
                          value={legalFullName}
                          onChange={(e) => setLegalFullName(e.target.value)}
                          placeholder="e.g. Alex Morgan Chen"
                          className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-300 block">
                          Document Type
                        </label>
                        <select
                          value={documentType}
                          onChange={(e: any) => setDocumentType(e.target.value)}
                          className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                        >
                          <option value="drivers_license">Driver's License (State / Province)</option>
                          <option value="passport">Passport (International)</option>
                          <option value="national_id">National Identity Card</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingIdentity}
                        className="w-full py-3 rounded-xl btn-genz-lavender text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isSubmittingIdentity ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Staging Document...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-[#12131A] stroke-[2.5]" />
                            <span>Start Official ID Verification</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                <div className="pt-3 border-t border-[#232736]/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>256-Bit Escrow Vault</span>
                  <span className="font-mono">GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-6 max-w-2xl">
            <div className="space-y-1 border-b border-[#232736] pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#a855f7]" /> Privacy & Community Controls
              </h3>
              <p className="text-xs text-gray-400">
                Manage how your profile appears to other members and maintain control of your hangout notifications.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3.5 bg-[#0e1017] border border-[#232736] rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.showProfileInMembers}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      showProfileInMembers: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded mt-0.5 bg-[#141620] border-[#232736] text-[#bef264] focus:ring-0"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-white block">
                    Show avatar and handle in confirmed member lists
                  </span>
                  <span className="text-gray-400">
                    When enabled, other attendees can see you are attending.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-[#0e1017] border border-[#232736] rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.allowDirectInvites}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      allowDirectInvites: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded mt-0.5 bg-[#141620] border-[#232736] text-[#bef264] focus:ring-0"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-white block">
                    Allow hosts to send direct hangout invites
                  </span>
                  <span className="text-gray-400">
                    Receive invitations to private or approval-based hangouts from hosts you’ve hung out with.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#bef264] hover:bg-[#a3e635]"
              >
                Save Privacy Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
