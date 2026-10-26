export type VerificationTier = 'none' | 'phone_verified' | 'identity_verified';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';

export interface VerificationDetails {
  status: VerificationStatus;
  tier: VerificationTier;
  phoneVerified: boolean;
  phoneNumberMasked?: string;
  identityVerified: boolean;
  identityStatus: 'not_started' | 'pending_review' | 'verified' | 'failed';
  provider: string;
  verifiedAt?: string;
  rejectionReason?: string;
  attemptsCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  cooldownUntil?: string;
}

export interface HangoutMember {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: 'host' | 'member';
  joinedAt: string;
  bio?: string;
  interests?: string[];
  isVerified?: boolean;
  verificationTier?: VerificationTier;
}

export interface ItineraryItem {
  time: string;
  activity: string;
  location?: string;
}

export interface HangoutLocation {
  name: string;
  address: string;
  neighborhood: string;
  lat?: number;
  lng?: number;
}

export type BudgetTier = 'Free' | '$' | '$$' | '$$$';

export type HangoutCategory =
  | 'Coffee & Yap'
  | 'Bouldering & Climbing'
  | 'Board Games'
  | 'Foodie & Night Market'
  | 'Indie Cinema & Arts'
  | 'Outdoor & Hiking'
  | 'Creative & Jamming'
  | 'Tech & Hack';

export type ActivityType = 'Casual' | 'Active' | 'Creative' | 'Food & Drinks' | 'Workshop';

export interface Hangout {
  id: string;
  title: string;
  description: string;
  activityCategory: HangoutCategory;
  activityType: ActivityType;
  dateTime: string;
  isoDate: string;
  location: HangoutLocation;
  budget: BudgetTier;
  groupSizeLimit: number;
  currentMembersCount: number;
  members: HangoutMember[];
  host: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    bio?: string;
    isVerified?: boolean;
    verificationTier?: VerificationTier;
  };
  tags: string[];
  coverImage: string;
  privacy: 'public' | 'approval_required';
  itinerary: ItineraryItem[];
  createdAt: string;
  isJoined?: boolean;
  isSaved?: boolean;
  reportsCount?: number;
}

export interface HangoutCreateInput {
  title: string;
  description: string;
  activityCategory: HangoutCategory;
  activityType: ActivityType;
  dateTime: string;
  locationName: string;
  locationAddress: string;
  neighborhood: string;
  budget: BudgetTier;
  groupSizeLimit: number;
  tags: string[];
  privacy: 'public' | 'approval_required';
  coverImage?: string;
}

export interface GemmaPlanRequest {
  groupSize: number;
  vibes: string[];
  budget: BudgetTier;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Late Night';
  durationHours: number;
  environment: 'Indoor' | 'Outdoor' | 'Hybrid';
  location: string;
  notes?: string;
}

export interface GemmaPlanSuggestion {
  id: string;
  title: string;
  tagline: string;
  estimatedCost: string;
  recommendedVenueType: string;
  idealGroupSize: string;
  highlight: string;
  suggestedCategory: HangoutCategory;
}

export interface GemmaPlanScheduleItem {
  time: string;
  activity: string;
  notes?: string;
}

export interface GemmaPlanResponse {
  runtimeConfigured: boolean;
  simulated: boolean;
  modelUsed: string;
  runtimeNotice?: string;
  endpointUrl?: string | null;
  suggestions: GemmaPlanSuggestion[];
  proposedSchedule: GemmaPlanScheduleItem[];
  shortRationale: string;
  invitationMessage: string;
}

export interface GemmaRuntimeStatus {
  configured: boolean;
  endpointUrl: string | null;
  modelName: string;
  requiresKey: boolean;
  hasKey: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  location: string;
  interests: string[];
  privacySettings: {
    showProfileInMembers: boolean;
    allowDirectInvites: boolean;
  };
  verification: VerificationDetails;
}

export interface AdminVerificationItem {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  avatar: string;
  tier: VerificationTier;
  status: VerificationStatus;
  phoneVerified: boolean;
  phoneNumberMasked?: string;
  identityVerified: boolean;
  identityStatus: 'not_started' | 'pending_review' | 'verified' | 'failed';
  documentType?: string;
  rejectionReason?: string;
  attemptsCount: number;
  lastAttemptAt?: string;
  verifiedAt?: string;
}

export interface HangoutReportInput {
  hangoutId: string;
  reason: 'spam' | 'harassment' | 'misleading' | 'safety' | 'other';
  details: string;
  userEmail?: string;
}

export interface AdminReportItem extends HangoutReportInput {
  id: string;
  timestamp: string;
  hangoutTitle: string;
  hostName: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AdminMetrics {
  totalHangouts: number;
  totalActiveRSVPs: number;
  totalSpotsAvailable: number;
  totalReportsCount: number;
  pendingReportsCount: number;
  gemmaStatus: GemmaRuntimeStatus;
  uptimeSeconds: number;
  verifiedUsersCount: number;
  pendingVerificationsCount: number;
}

