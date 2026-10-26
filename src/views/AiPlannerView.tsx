import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Copy,
  Check,
  Calendar,
  Compass,
  ArrowRight,
  ShieldAlert,
  Server,
  Layers,
  Info,
} from 'lucide-react';
import {
  GemmaPlanRequest,
  GemmaPlanResponse,
  GemmaRuntimeStatus,
  BudgetTier,
  HangoutCreateInput,
} from '../types';
import { GemmaRuntimeBanner } from '../components/GemmaRuntimeBanner';
import { useToast } from '../context/ToastContext';

interface AiPlannerViewProps {
  runtimeStatus: GemmaRuntimeStatus | null;
  onOpenSetupModal: () => void;
  onSelectActivityForDraft: (draft: Partial<HangoutCreateInput>) => void;
}

const AVAILABLE_VIBES = [
  'Indie Coffee & Matcha',
  'Tabletop Board Games',
  'Bouldering & Climbing',
  'Night Market & Street Food',
  'Thrift & Vintage Crawl',
  'Analog Photography & Film',
  'Indie Cinema & Screenings',
  'Rooftop Vinyl Listening',
  'Park Walk & Sunset Yap',
  'Craft Jam & Sketching',
  'Tech & Creative Hack',
];

export const AiPlannerView: React.FC<AiPlannerViewProps> = ({
  runtimeStatus,
  onOpenSetupModal,
  onSelectActivityForDraft,
}) => {
  const { showToast } = useToast();

  // Form states
  const [groupSize, setGroupSize] = useState<number>(4);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([
    'Indie Coffee & Matcha',
    'Tabletop Board Games',
  ]);
  const [budget, setBudget] = useState<BudgetTier>('$');
  const [timeOfDay, setTimeOfDay] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Late Night'>('Afternoon');
  const [durationHours, setDurationHours] = useState<number>(3);
  const [environment, setEnvironment] = useState<'Indoor' | 'Outdoor' | 'Hybrid'>('Indoor');
  const [location, setLocation] = useState<string>('Lower East Side');
  const [notes, setNotes] = useState<string>('Mix of extroverts and introverts; relaxed pacing.');

  // Inference state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<GemmaPlanResponse | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      if (selectedVibes.length === 1) {
        showToast('Please keep at least one vibe selected.', 'info');
        return;
      }
      setSelectedVibes(selectedVibes.filter((v) => v !== vibe));
    } else {
      if (selectedVibes.length >= 4) {
        showToast('Maximum 4 vibes for optimal coherence.', 'info');
        return;
      }
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedVibes.length === 0) {
      showToast('Please select at least one vibe.', 'error');
      return;
    }
    if (!location.trim()) {
      showToast('Please specify a neighborhood or area.', 'error');
      return;
    }

    setIsLoading(true);
    setPlanResult(null);

    try {
      const payload: GemmaPlanRequest = {
        groupSize,
        vibes: selectedVibes,
        budget,
        timeOfDay,
        durationHours,
        environment,
        location: location.trim(),
        notes: notes.trim(),
      };

      const res = await fetch('/api/gemma/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setPlanResult(data.data);
        showToast('Gemma 4 hangout plan generated!', 'success');
      } else {
        showToast(data.error || 'Failed to generate plan', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error generating plan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInvitation = () => {
    if (!planResult?.invitationMessage) return;
    navigator.clipboard.writeText(planResult.invitationMessage);
    setCopiedMessage(true);
    showToast('Invitation copied to clipboard!', 'success');
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleCreateFromSuggestion = (suggestionTitle: string, category: any) => {
    if (!planResult) return;
    onSelectActivityForDraft({
      title: suggestionTitle,
      description: `${planResult.shortRationale}\n\nTarget plan: ${planResult.invitationMessage}`,
      activityCategory: category || 'Coffee & Yap',
      neighborhood: location,
      locationName: `${location} Meeting Hub`,
      budget,
      groupSizeLimit: groupSize,
      tags: [...selectedVibes.slice(0, 3), 'GemmaPlan'],
      dateTime: `This weekend (${timeOfDay})`,
    });
    showToast('Preferences transferred to Hangout Creator!', 'success');
  };

  // Compute effective runtime status: if planResult was obtained, it reflects actual inference mode
  const effectiveStatus: GemmaRuntimeStatus | null = planResult
    ? {
        configured: !planResult.simulated,
        endpointUrl: planResult.endpointUrl || (planResult.simulated ? null : 'Gemini API (gemma-4-31b-it)'),
        modelName: planResult.modelUsed || 'gemma-4-31b-it',
        requiresKey: true,
        hasKey: true,
      }
    : runtimeStatus;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Concept */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[#c084fc] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemma 4 AI Hangout Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          AI Hangout Planner
        </h1>
        <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
          Input your crew’s preferences, preferred budget, and vibe. Gemma 4 synthesizes three curated activity options, a realistic schedule, and an invitation pitch.
        </p>
      </div>

      {/* Gemma 4 Runtime Status Banner */}
      <GemmaRuntimeBanner status={effectiveStatus} onOpenModal={onOpenSetupModal} />

      {/* Layout: Two Column on Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (Preferences Input) */}
        <div className="lg:col-span-5 bg-[#141620] border border-[#232736] rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#232736] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#bef264]" /> Group Preferences
            </h2>
            <span className="text-xs text-gray-400 font-mono">Structured Inputs</span>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-5">
            {/* Group Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Group Size
                </label>
                <span className="text-sm font-mono font-bold text-[#bef264]">
                  {groupSize} people
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={16}
                step={1}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full accent-[#bef264] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                <span>2 (Pair)</span>
                <span>4 (Small group)</span>
                <span>8 (Table)</span>
                <span>16 (Party)</span>
              </div>
            </div>

            {/* Target Vibes (Multi-select) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Vibes & Interests <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-gray-400">{selectedVibes.length}/4 selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VIBES.map((vibe, idx) => {
                  const isSelected = selectedVibes.includes(vibe);
                  const activeColorVariations = ['active-lavender', 'active-pink', 'active-lime'];
                  const activeVariant = activeColorVariations[idx % activeColorVariations.length];
                  return (
                    <button
                      type="button"
                      key={vibe}
                      onClick={() => toggleVibe(vibe)}
                      className={`pill-genz-filter ${isSelected ? activeVariant : ''}`}
                    >
                      {vibe}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget & Time of Day */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Budget
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Free', '$', '$$', '$$$'] as BudgetTier[]).map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        budget === b
                          ? 'btn-genz-lime !py-1.5 !rounded-xl'
                          : 'btn-genz-dark !py-1.5 !rounded-xl'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Time of Day
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as any)}
                  className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Late Night">Late Night</option>
                </select>
              </div>
            </div>

            {/* Duration & Environment */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Duration
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                >
                  <option value={1.5}>Quick Yap (1.5h)</option>
                  <option value={3}>Standard Outing (3h)</option>
                  <option value={5}>Extended Half-Day (5h)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Setting
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                >
                  <option value="Indoor">Indoor Cozy</option>
                  <option value="Outdoor">Outdoor / Open Air</option>
                  <option value="Hybrid">Hybrid (Walk + Venue)</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                Target Neighborhood / Metro Hub <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Lower East Side, Williamsburg, Arts District"
                className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]"
                required
              />
            </div>

            {/* Extra notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                Special Dynamics or Preferences <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Chill introverted energy, vegan friendly, quiet coffee spots"
                className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl text-sm btn-genz-pink flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#12131A] border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing with Gemma 4...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#12131A] stroke-[2.5]" />
                  <span>Match My Vibe & Generate Hangout Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="bg-[#141620] border border-[#232736] rounded-3xl p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-[#c084fc] mx-auto flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Synthesizing Hangout Plan</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Gemma 4 is matching your {groupSize} person group size, {budget} budget, and {selectedVibes.join(', ')} vibes...
                </p>
              </div>
            </div>
          ) : planResult ? (
            <div className="space-y-6">
              {/* Output Mode Notice Card */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  planResult.simulated
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}
              >
                {planResult.simulated ? (
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Server className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>Generated by {planResult.modelUsed}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        planResult.simulated
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${planResult.simulated ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                      {planResult.simulated ? 'Simulated' : 'Live'}
                    </span>
                  </div>
                  <p className="text-gray-300">
                    {planResult.runtimeNotice || (planResult.simulated ? 'Plan generated in simulated fallback mode.' : 'Live Gemma 4 inference via Gemini API.')}
                  </p>
                </div>
              </div>

              {/* 3 Activity Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#bef264]" /> Curated Activity Suggestions
                  </h3>
                  <span className="text-xs text-gray-500">Pick any to host</span>
                </div>

                <div className="space-y-3">
                  {planResult.suggestions.map((act, idx) => (
                    <div
                      key={act.id || idx}
                      className="p-4 sm:p-5 bg-[#141620] border border-[#232736] hover:border-[#a855f7]/50 rounded-2xl transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="text-[#bef264] font-semibold">{act.suggestedCategory}</span>
                            <span>·</span>
                            <span>{act.estimatedCost}</span>
                            <span>·</span>
                            <span>{act.idealGroupSize}</span>
                          </div>
                          <h4 className="text-base font-bold text-white leading-snug">{act.title}</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">{act.tagline}</p>
                        </div>
                      </div>

                      {/* Venue & Highlight */}
                      <div className="p-3 rounded-xl bg-[#0c0d12] border border-[#232736]/60 text-xs space-y-1">
                        <div className="text-gray-400">
                          <span className="text-gray-500">Recommended venue:</span> {act.recommendedVenueType}
                        </div>
                        <div className="text-[#c084fc] font-medium">
                          <span className="text-gray-500 font-normal">Social highlight:</span> {act.highlight}
                        </div>
                      </div>

                      {/* CTA to host */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCreateFromSuggestion(act.title, act.suggestedCategory)}
                          className="btn-genz-yellow rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
                        >
                          <span>Use this to create Hangout</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#12131A] stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Schedule */}
              <div className="p-5 bg-[#141620] border border-[#232736] rounded-2xl space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#a855f7]" /> Proposed Itinerary Schedule
                </h3>
                <div className="space-y-3 border-l border-[#2d3246] ml-2 pl-4">
                  {planResult.proposedSchedule.map((item, idx) => (
                    <div key={idx} className="relative text-xs space-y-0.5">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#bef264]" />
                      <span className="font-mono text-gray-400 font-bold">{item.time}</span>
                      <p className="font-semibold text-white text-sm">{item.activity}</p>
                      {item.notes && <p className="text-gray-400">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale */}
              <div className="p-5 bg-[#141620] border border-[#232736] rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#c084fc]">
                  Gemma 4 Social Engineering Rationale
                </h4>
                <p className="text-gray-300 leading-relaxed">{planResult.shortRationale}</p>
              </div>

              {/* Invitation Message Card */}
              <div className="p-5 bg-[#0e1017] border border-[#a855f7]/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#bef264]">
                    Ready-to-Send Invitation Message
                  </span>
                  <button
                    onClick={handleCopyInvitation}
                    className="btn-genz-lavender rounded-xl px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#12131A] stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#12131A] stroke-[2.5]" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141620] border border-[#232736] text-xs sm:text-sm text-gray-200 leading-relaxed font-mono">
                  "{planResult.invitationMessage}"
                </div>

                <p className="text-[11px] text-gray-500">
                  Paste this into your group chat, Slack channel, or post as the description of your new YapOut hangout.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#141620] border border-[#232736] rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1e202e] text-[#bef264] mx-auto flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">Your Curated Plan Will Appear Here</h3>
                <p className="text-xs text-gray-400">
                  Tune your group size, budget, and vibes on the left, then click Generate to get a bespoke itinerary synthesized by Gemma 4.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
