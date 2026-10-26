import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  DollarSign,
  MapPin,
  Sparkles,
  LayoutGrid,
  List,
  RotateCcw,
  Users,
} from 'lucide-react';
import { Hangout, HangoutCategory, ActivityType, BudgetTier, VerificationTier } from '../types';
import { HangoutCard } from '../components/HangoutCard';
import { VerifiedBadge } from '../components/VerifiedBadge';

interface DiscoverViewProps {
  hangouts: Hangout[];
  onOpenDetails: (hangout: Hangout) => void;
  onJoinToggle: (e: React.MouseEvent, hangoutId: string, isCurrentlyJoined: boolean) => void;
  onSaveToggle: (e: React.MouseEvent, hangoutId: string) => void;
  onBadgeClick?: (tier: VerificationTier, userName?: string) => void;
}

const CATEGORIES: ('All' | HangoutCategory)[] = [
  'All',
  'Coffee & Yap',
  'Bouldering & Climbing',
  'Board Games',
  'Foodie & Night Market',
  'Indie Cinema & Arts',
  'Outdoor & Hiking',
  'Creative & Jamming',
  'Tech & Hack',
];

const ACTIVITY_TYPES: ('All' | ActivityType)[] = [
  'All',
  'Casual',
  'Active',
  'Creative',
  'Food & Drinks',
  'Workshop',
];

const BUDGETS: ('All' | BudgetTier)[] = ['All', 'Free', '$', '$$', '$$$'];

const NEIGHBORHOODS = [
  'All',
  'Lower East Side',
  'Williamsburg',
  'Chelsea / High Line',
  'Chinatown',
  'SoHo / Tribeca',
  'DUMBO / Brooklyn Bridge',
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  hangouts,
  onOpenDetails,
  onJoinToggle,
  onSaveToggle,
  onBadgeClick,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | HangoutCategory>('All');
  const [selectedType, setSelectedType] = useState<'All' | ActivityType>('All');
  const [selectedBudget, setSelectedBudget] = useState<'All' | BudgetTier>('All');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [onlyOpenSpots, setOnlyOpenSpots] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredHangouts = hangouts.filter((h) => {
    if (selectedCategory !== 'All' && h.activityCategory !== selectedCategory) return false;
    if (selectedType !== 'All' && h.activityType !== selectedType) return false;
    if (selectedBudget !== 'All' && h.budget !== selectedBudget) return false;
    if (
      selectedNeighborhood !== 'All' &&
      !h.location.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase())
    )
      return false;
    if (onlyOpenSpots && h.currentMembersCount >= h.groupSizeLimit && !h.isJoined) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        h.title.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.location.neighborhood.toLowerCase().includes(q) ||
        h.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedBudget('All');
    setSelectedNeighborhood('All');
    setOnlyOpenSpots(false);
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'All' ||
    selectedType !== 'All' ||
    selectedBudget !== 'All' ||
    selectedNeighborhood !== 'All' ||
    onlyOpenSpots;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Discover Hangouts
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Filter by vibe, budget, neighborhood, and open spots to find your crew.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-[#141620] border-2 border-[#232736] p-1 rounded-2xl flex items-center gap-1 shadow-[2px_2px_0px_#090a0f]">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#C9FF59] text-[#12131A] font-extrabold border-2 border-[#12131A] shadow-[2px_2px_0px_#12131A]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-[#FF83C8] text-[#12131A] font-extrabold border-2 border-[#12131A] shadow-[2px_2px_0px_#12131A]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Console */}
      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities, keywords, board games, bouldering, coffee..."
            className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
              Vibe / Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
              Activity Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
              Budget
            </label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value as any)}
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
            >
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b === 'All' ? 'All Budgets' : `${b} Tier`}
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
              Neighborhood
            </label>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Toggles & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#232736]/60">
          <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyOpenSpots}
              onChange={(e) => setOnlyOpenSpots(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0c0d12] border-[#232736] text-[#bef264] focus:ring-0 focus:ring-offset-0"
            />
            <span>Show only hangouts with open spots available</span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="btn-genz-yellow !rounded-xl !px-3.5 !py-1.5 text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Showing {filteredHangouts.length} hangouts matching criteria</span>
      </div>

      {/* Results List / Grid */}
      {filteredHangouts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHangouts.map((h) => (
              <HangoutCard
                key={h.id}
                hangout={h}
                onOpenDetails={onOpenDetails}
                onJoinToggle={onJoinToggle}
                onSaveToggle={onSaveToggle}
                onBadgeClick={onBadgeClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHangouts.map((h) => {
              const spotsLeft = Math.max(0, h.groupSizeLimit - h.currentMembersCount);
              return (
                <div
                  key={h.id}
                  onClick={() => onOpenDetails(h)}
                  className="p-4 bg-[#141620] hover:bg-[#181b27] border border-[#232736] hover:border-[#a855f7]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={h.coverImage}
                      alt={h.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                        <span className="text-[#bef264] font-semibold">{h.activityCategory}</span>
                        <span>·</span>
                        <span>{h.location.neighborhood}</span>
                        <span>·</span>
                        <span>{h.dateTime}</span>
                        <span>·</span>
                        <div className="inline-flex items-center gap-1 text-gray-300">
                          <span>by {h.host.name}</span>
                          {h.host.isVerified && (
                            <VerifiedBadge
                              tier={h.host.verificationTier || 'phone_verified'}
                              size="xs"
                              onBadgeClick={(tier) => onBadgeClick?.(tier, h.host.name)}
                            />
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug">{h.title}</h3>
                      <p className="text-xs text-gray-300 line-clamp-1">{h.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#232736]">
                    <span className="text-xs font-mono text-gray-300">
                      {h.currentMembersCount}/{h.groupSizeLimit} joined
                    </span>
                    <button
                      onClick={(e) => onJoinToggle(e, h.id, Boolean(h.isJoined))}
                      className={`px-4 py-2 rounded-xl text-xs ${
                        h.isJoined
                          ? 'btn-genz-pink'
                          : 'btn-genz-lime'
                      }`}
                    >
                      {h.isJoined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="py-16 text-center bg-[#141620] border-2 border-[#232736] rounded-3xl p-8 space-y-4">
          <p className="text-sm font-bold text-white">No hangouts match your combination of filters.</p>
          <button
            onClick={resetAllFilters}
            className="btn-genz-lime rounded-xl px-5 py-2.5 text-xs"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
