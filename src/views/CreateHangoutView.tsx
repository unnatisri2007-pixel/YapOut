import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Tag,
  Shield,
  Sparkles,
  Plus,
  Eye,
  Check,
} from 'lucide-react';
import { HangoutCategory, ActivityType, BudgetTier, HangoutCreateInput, Hangout } from '../types';
import { useToast } from '../context/ToastContext';

interface CreateHangoutViewProps {
  onHangoutCreated: (newHangout: Hangout) => void;
  initialDraft?: Partial<HangoutCreateInput> | null;
}

const CATEGORIES: HangoutCategory[] = [
  'Coffee & Yap',
  'Bouldering & Climbing',
  'Board Games',
  'Foodie & Night Market',
  'Indie Cinema & Arts',
  'Outdoor & Hiking',
  'Creative & Jamming',
  'Tech & Hack',
];

const ACTIVITY_TYPES: ActivityType[] = ['Casual', 'Active', 'Creative', 'Food & Drinks', 'Workshop'];

const BUDGETS: BudgetTier[] = ['Free', '$', '$$', '$$$'];

const POPULAR_TAGS = [
  'All-Levels',
  'Cozy Vibe',
  'Zero Pressure',
  'Coffee Lovers',
  'Board Games',
  'Sunset',
  'Night Owl',
  'Craft & Chat',
  'Beginners Welcome',
];

export const CreateHangoutView: React.FC<CreateHangoutViewProps> = ({
  onHangoutCreated,
  initialDraft,
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialDraft?.title || '');
  const [description, setDescription] = useState(initialDraft?.description || '');
  const [activityCategory, setActivityCategory] = useState<HangoutCategory>(
    initialDraft?.activityCategory || 'Coffee & Yap'
  );
  const [activityType, setActivityType] = useState<ActivityType>(
    initialDraft?.activityType || 'Casual'
  );
  const [dateTime, setDateTime] = useState(initialDraft?.dateTime || 'This Saturday at 5:00 PM');
  const [locationName, setLocationName] = useState(initialDraft?.locationName || '');
  const [locationAddress, setLocationAddress] = useState(initialDraft?.locationAddress || '');
  const [neighborhood, setNeighborhood] = useState(initialDraft?.neighborhood || 'Lower East Side');
  const [budget, setBudget] = useState<BudgetTier>(initialDraft?.budget || '$');
  const [groupSizeLimit, setGroupSizeLimit] = useState<number>(initialDraft?.groupSizeLimit || 6);
  const [tags, setTags] = useState<string[]>(initialDraft?.tags || ['Casual Yap', 'Weekend']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'approval_required'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < 5) {
      showToast('Please provide a descriptive title (at least 5 characters).', 'error');
      return;
    }
    if (description.trim().length < 15) {
      showToast('Please provide a brief description of what you plan to do (at least 15 characters).', 'error');
      return;
    }
    if (!locationName.trim()) {
      showToast('Please specify the meeting place or venue name.', 'error');
      return;
    }
    if (!neighborhood.trim()) {
      showToast('Please specify a neighborhood or area.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: HangoutCreateInput = {
        title: title.trim(),
        description: description.trim(),
        activityCategory,
        activityType,
        dateTime,
        locationName: locationName.trim(),
        locationAddress: locationAddress.trim() || locationName.trim(),
        neighborhood: neighborhood.trim(),
        budget,
        groupSizeLimit,
        tags,
        privacy,
      };

      const res = await fetch('/api/hangouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Your hangout has been created and published!', 'success');
        onHangoutCreated(data.data);
      } else {
        showToast(data.error || 'Failed to create hangout', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating hangout', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Host a Hangout
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Create an open activity plan, set group limits, and invite good people to join.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="btn-genz-dark rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5 text-[#C9FF59] stroke-[2.5]" />
          <span>{showPreview ? 'Edit Details' : 'Live Card Preview'}</span>
        </button>
      </div>

      {/* Live Preview Toggle Area */}
      {showPreview && (
        <div className="p-5 bg-[#0e1017] border-2 border-[#B99AFF] rounded-2xl space-y-3 shadow-[3px_3px_0px_#12131A]">
          <div className="flex items-center justify-between text-xs text-[#B99AFF] font-extrabold uppercase tracking-wide">
            <span>Live Feed Card Preview</span>
            <span className="text-gray-400 font-normal">How your hangout appears to others</span>
          </div>
          <div className="max-w-md mx-auto bg-[#141620] border-2 border-[#232736] rounded-2xl overflow-hidden p-4 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-[#C9FF59] font-bold">{activityCategory}</span>
              <span>·</span>
              <span>{neighborhood || 'Neighborhood'}</span>
              <span>·</span>
              <span>{dateTime}</span>
            </div>
            <h3 className="text-base font-extrabold text-white">{title || 'Your Hangout Title'}</h3>
            <p className="text-xs text-gray-300 line-clamp-2">
              {description || 'Your description of the hangout activity, vibe, and expectations...'}
            </p>
            <div className="pt-2 border-t border-[#232736] flex items-center justify-between text-xs text-gray-400">
              <span>Spot limit: {groupSizeLimit} people</span>
              <span className="font-mono text-gray-300">Budget: {budget}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-[#141620] border-2 border-[#232736] rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
            Hangout Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Saturday Thrift Stroll & Vietnamese Iced Coffee"
            className="w-full bg-[#0c0d12] border-2 border-[#232736] focus:border-[#B99AFF] rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
            required
          />
        </div>

        {/* Category Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
            Select Category / Primary Vibe <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat, idx) => {
              const isSelected = activityCategory === cat;
              const activeClasses = [
                'bg-[#C9FF59] text-[#12131A] border-2 border-[#12131A] shadow-[2.5px_2.5px_0px_#12131A]',
                'bg-[#FF83C8] text-[#12131A] border-2 border-[#12131A] shadow-[2.5px_2.5px_0px_#12131A]',
                'bg-[#B99AFF] text-[#12131A] border-2 border-[#12131A] shadow-[2.5px_2.5px_0px_#12131A]',
                'bg-[#FFD166] text-[#12131A] border-2 border-[#12131A] shadow-[2.5px_2.5px_0px_#12131A]',
              ];
              const activeStyle = activeClasses[idx % activeClasses.length];
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setActivityCategory(cat)}
                  className={`p-3 rounded-2xl text-xs font-extrabold text-left transition-all ${
                    isSelected
                      ? activeStyle
                      : 'bg-[#0c0d12] border-2 border-[#232736] text-gray-300 hover:text-white hover:border-[#B99AFF] shadow-[1.5px_1.5px_0px_#090a0f]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Type & Budget Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              Pacing / Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as any)}
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#a855f7]"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              Budget Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BUDGETS.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    budget === b
                      ? 'btn-genz-lime !py-2 !rounded-xl'
                      : 'btn-genz-dark !py-2 !rounded-xl'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
            When is it happening? <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              placeholder="e.g., Saturday at 5:00 PM or Oct 24, 6:30 PM"
              className="flex-1 bg-[#0c0d12] border-2 border-[#232736] focus:border-[#B99AFF] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] text-gray-400">
            <span className="shrink-0 text-gray-500 font-bold">Quick presets:</span>
            {['Tonight at 7:30 PM', 'Tomorrow at 6:00 PM', 'This Saturday at 4:00 PM', 'Sunday at 11:00 AM'].map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDateTime(preset)}
                  className="pill-genz-filter !py-1 !px-2.5 !text-[11px]"
                >
                  {preset}
                </button>
              )
            )}
          </div>
        </div>

        {/* Meeting Place & Neighborhood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              Meeting Place / Venue Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Ludlow Coffee Supply or Central Park Bethesda Fountain"
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              Neighborhood / Metro Area <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="e.g., Lower East Side, Williamsburg, Chelsea"
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]"
              required
            />
          </div>
        </div>

        {/* Group Size Limit Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Group Size Limit
            </label>
            <span className="text-sm font-mono font-bold text-[#bef264]">
              {groupSizeLimit} people max
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={groupSizeLimit}
            onChange={(e) => setGroupSizeLimit(Number(e.target.value))}
            className="w-full accent-[#bef264] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-gray-500 font-mono">
            <span>2 (Intimate pair)</span>
            <span>6 (Cozy table)</span>
            <span>12 (Large crew)</span>
            <span>20 (Party)</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
            Description & Vibe Notes <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell people what to expect, what to bring, and how to spot you when they arrive..."
            className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7] resize-none"
            required
          />
        </div>

        {/* Tags / Interests */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
            Vibe Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1e202e] text-xs text-white border border-[#2d3246]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-400 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(customTagInput);
                }
              }}
              placeholder="Add tag and press enter..."
              className="flex-1 bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]"
            />
            <button
              type="button"
              onClick={() => handleAddTag(customTagInput)}
              className="btn-genz-blue rounded-xl px-4 py-2 text-xs"
            >
              Add
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] text-gray-400">
            <span className="shrink-0 text-gray-500 font-bold">Suggested:</span>
            {POPULAR_TAGS.map((pop) => (
              <button
                key={pop}
                type="button"
                onClick={() => handleAddTag(pop)}
                className="pill-genz-filter !py-1 !px-2.5 !text-[11px]"
              >
                +{pop}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Selector */}
        <div className="p-4 bg-[#0c0d12] border-2 border-[#232736] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#B99AFF] shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Event Privacy</span>
              <span className="text-gray-400">
                {privacy === 'public'
                  ? 'Anyone on YapOut can immediately join until spots fill.'
                  : 'Requires host approval before members can attend.'}
              </span>
            </div>
          </div>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as any)}
            className="bg-[#141620] border-2 border-[#232736] focus:border-[#B99AFF] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="public">Public (Instant Join)</option>
            <option value="approval_required">Request-to-Join (Approval)</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t-2 border-[#232736] flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl text-sm btn-genz-lime flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Publishing Hangout...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3] text-[#12131A]" />
                <span>Create & Publish Hangout</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
