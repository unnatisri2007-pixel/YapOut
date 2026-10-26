import { Hangout, UserProfile, HangoutReportInput, HangoutCreateInput } from '../src/types/index.js';

export class YapOutDataStore {
  private hangouts: Hangout[] = [];
  private reports: (HangoutReportInput & { id: string; timestamp: string })[] = [];
  private currentUser: UserProfile = {
    id: 'user-curr-1',
    name: 'Alex Rivera',
    handle: '@alexr',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Urban photographer, avid boulderer, and lover of indie board games & midnight matcha lattes.',
    location: 'Lower East Side, NYC',
    interests: ['Coffee & Yap', 'Bouldering & Climbing', 'Board Games', 'Foodie & Night Market', 'Indie Cinema & Arts'],
    privacySettings: {
      showProfileInMembers: true,
      allowDirectInvites: true,
    },
    verification: {
      status: 'unverified',
      tier: 'none',
      phoneVerified: false,
      identityVerified: false,
      identityStatus: 'not_started',
      provider: 'YapOut Secure Verification Gateway',
      attemptsCount: 0,
      maxAttempts: 3,
    },
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    this.hangouts = [
      {
        id: 'hangout-1',
        title: 'Friday Twilight Bouldering & Smoothies',
        description: 'Vibe check! We are doing a friendly problem-solving session on the purple & lime overhangs at the gym. All climbing levels welcome—we love cheering everyone on! Afterwards, we grab fresh smoothies next door.',
        activityCategory: 'Bouldering & Climbing',
        activityType: 'Active',
        dateTime: 'Tomorrow at 6:00 PM',
        isoDate: '2026-10-23T18:00:00Z',
        location: {
          name: 'The Overhang Bouldering Lounge',
          address: '428 W 26th Street',
          neighborhood: 'Chelsea / High Line',
        },
        budget: '$',
        groupSizeLimit: 8,
        currentMembersCount: 6,
        tags: ['Bouldering', 'Fitness', 'All-Levels', 'Post-Climb Drinks'],
        coverImage: '/src/assets/images/hangout_bouldering_session_1792683955989.jpg',
        privacy: 'public',
        itinerary: [
          { time: '6:00 PM', activity: 'Meet near shoe rental & stretch out' },
          { time: '6:20 PM', activity: 'Rotate routes & problem solving in groups of 3' },
          { time: '7:45 PM', activity: 'Cool down & head to Green Wave Smoothies' },
        ],
        createdAt: '2026-10-20T14:20:00Z',
        isJoined: true,
        isSaved: true,
        host: {
          id: 'host-1',
          name: 'Maya Chen',
          handle: '@mayachen',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          bio: 'Outdoor educator & climbing enthusiast. Love bringing friendly people together!',
          isVerified: true,
          verificationTier: 'identity_verified',
        },
        members: [
          {
            id: 'host-1',
            name: 'Maya Chen',
            handle: '@mayachen',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            role: 'host',
            joinedAt: '2026-10-20T14:20:00Z',
            bio: 'Host & route navigator',
            interests: ['Bouldering', 'Outdoors'],
            isVerified: true,
            verificationTier: 'identity_verified',
          },
          {
            id: 'user-curr-1',
            name: 'Alex Rivera',
            handle: '@alexr',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T09:15:00Z',
            bio: 'Ready to send some V3s!',
            interests: ['Climbing', 'Indie Games'],
          },
          {
            id: 'member-2',
            name: 'Marcus Bell',
            handle: '@marcusb',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T11:00:00Z',
            interests: ['Fitness', 'Food'],
            isVerified: true,
            verificationTier: 'phone_verified',
          },
          {
            id: 'member-3',
            name: 'Sara Lind',
            handle: '@saralind',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T13:40:00Z',
          },
          {
            id: 'member-4',
            name: 'Darius Thorne',
            handle: '@darius_t',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T18:22:00Z',
          },
          {
            id: 'member-5',
            name: 'Priya Patel',
            handle: '@priyap',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T08:10:00Z',
            isVerified: true,
            verificationTier: 'identity_verified',
          },
        ],
      },
      {
        id: 'hangout-2',
        title: 'Strategy & Banter: Cozy Board Game Cafe Evening',
        description: 'Pull up a chair at Twenty Sided Table! We are setting up Catan, Wingspan, and Cascadia. Beginners are very welcome—we teach the rules in 5 minutes flat. High laughs, delicious warm drinks, zero gatekeeping.',
        activityCategory: 'Board Games',
        activityType: 'Casual',
        dateTime: 'Saturday at 4:30 PM',
        isoDate: '2026-10-24T16:30:00Z',
        location: {
          name: 'The 20-Sided Table Parlor',
          address: '362 Grand Street',
          neighborhood: 'Williamsburg',
        },
        budget: '$',
        groupSizeLimit: 6,
        currentMembersCount: 4,
        tags: ['Board Games', 'Cozy Vibe', 'Tabletop', 'Matcha & Coffee'],
        coverImage: '/src/assets/images/hangout_boardgame_cafe_1792683956668.jpg',
        privacy: 'public',
        itinerary: [
          { time: '4:30 PM', activity: 'Grab drinks & settle table assignments' },
          { time: '4:50 PM', activity: 'Round 1: Quick warm-up party game' },
          { time: '5:30 PM', activity: 'Round 2: Wingspan / Cascadia big match' },
          { time: '7:15 PM', activity: 'Wrap-up & decide on diner snack run' },
        ],
        createdAt: '2026-10-21T10:00:00Z',
        isJoined: false,
        isSaved: true,
        host: {
          id: 'host-2',
          name: 'Julian Vance',
          handle: '@julianv',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          bio: 'Tabletop designer & coffee nerd. Always down for good banter.',
          isVerified: true,
          verificationTier: 'phone_verified',
        },
        members: [
          {
            id: 'host-2',
            name: 'Julian Vance',
            handle: '@julianv',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            role: 'host',
            joinedAt: '2026-10-21T10:00:00Z',
            isVerified: true,
            verificationTier: 'phone_verified',
          },
          {
            id: 'member-6',
            name: 'Elena Rostova',
            handle: '@elena_r',
            avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T16:05:00Z',
            isVerified: true,
            verificationTier: 'identity_verified',
          },
          {
            id: 'member-7',
            name: 'Kenji Sato',
            handle: '@kenjis',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T04:20:00Z',
          },
          {
            id: 'member-8',
            name: 'Chloe Dubois',
            handle: '@chloed',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T07:15:00Z',
          },
        ],
      },
      {
        id: 'hangout-3',
        title: 'Midnight Dumplings & Street Food Crawl',
        description: 'Hungry foodies unite! We are hitting four legendary spots across Chinatown & Lower East Side: handmade soup dumplings, spicy cumin lamb skewers, pan-fried buns, and egg tarts. Bring your appetite and good stories.',
        activityCategory: 'Foodie & Night Market',
        activityType: 'Food & Drinks',
        dateTime: 'Saturday at 8:00 PM',
        isoDate: '2026-10-24T20:00:00Z',
        location: {
          name: 'Chatham Square Fountain (Meetup Point)',
          address: 'Chatham Square & Mott St',
          neighborhood: 'Chinatown',
        },
        budget: '$$',
        groupSizeLimit: 8,
        currentMembersCount: 7,
        tags: ['Street Food', 'Dumplings', 'Night Owl', 'Food Crawl'],
        coverImage: '/src/assets/images/hangout_foodie_nightmarket_1792683956228.jpg',
        privacy: 'public',
        itinerary: [
          { time: '8:00 PM', activity: 'Meet at fountain, introductions' },
          { time: '8:15 PM', activity: 'Stop 1: Authentic Xiao Long Bao & Scallion Pancakes' },
          { time: '9:15 PM', activity: 'Stop 2: Lamb skewers & hand-pulled noodles' },
          { time: '10:15 PM', activity: 'Stop 3: Fresh custard egg tarts & herbal tea' },
        ],
        createdAt: '2026-10-19T18:00:00Z',
        isJoined: false,
        isSaved: false,
        host: {
          id: 'host-3',
          name: 'Samira Khan',
          handle: '@samirak',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          bio: 'Culinary explorer & food writer who knows all the hidden alleyway stalls.',
          isVerified: true,
          verificationTier: 'identity_verified',
        },
        members: [
          {
            id: 'host-3',
            name: 'Samira Khan',
            handle: '@samirak',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            role: 'host',
            joinedAt: '2026-10-19T18:00:00Z',
            isVerified: true,
            verificationTier: 'identity_verified',
          },
          {
            id: 'member-9',
            name: 'Oliver Vance',
            handle: '@ovance',
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-20T10:12:00Z',
            isVerified: true,
            verificationTier: 'phone_verified',
          },
          {
            id: 'member-10',
            name: 'Aisha Omar',
            handle: '@aishao',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-20T19:30:00Z',
          },
          {
            id: 'member-11',
            name: 'Carlos Mendez',
            handle: '@carlosm',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T08:00:00Z',
          },
          {
            id: 'member-12',
            name: 'Zoe Kim',
            handle: '@zoek',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T14:45:00Z',
          },
          {
            id: 'member-13',
            name: 'Noah Sterling',
            handle: '@noahs',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T02:10:00Z',
          },
          {
            id: 'member-14',
            name: 'Hana Takahashi',
            handle: '@hanat',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T06:40:00Z',
          },
        ],
      },
      {
        id: 'hangout-4',
        title: 'Golden Hour Rooftop Terrace Yap & Vinyl Beats',
        description: 'Low-key evening hangout on the open rooftop terrace overlooking the skyline. Ambient chillhop and lo-fi on vinyl, good cider & spritzes, zero pressure to perform. Come decompress from the week with new friends.',
        activityCategory: 'Coffee & Yap',
        activityType: 'Casual',
        dateTime: 'Sunday at 5:00 PM',
        isoDate: '2026-10-25T17:00:00Z',
        location: {
          name: 'The Skylark Pergola & Loft',
          address: '200 Broadway 14th Fl',
          neighborhood: 'SoHo / Tribeca',
        },
        budget: '$',
        groupSizeLimit: 10,
        currentMembersCount: 8,
        tags: ['Rooftop', 'Sunset', 'Deep Convos', 'Vinyl', 'Chill'],
        coverImage: '/src/assets/images/hero_hangout_community_1792683954659.jpg',
        privacy: 'public',
        itinerary: [
          { time: '5:00 PM', activity: 'Arrive, rooftop sunset views & beverage orders' },
          { time: '5:45 PM', activity: 'Curated vinyl listening & icebreaker prompts' },
          { time: '7:30 PM', activity: 'City lights skyline viewing & photo shares' },
        ],
        createdAt: '2026-10-21T12:00:00Z',
        isJoined: true,
        isSaved: false,
        host: {
          id: 'host-4',
          name: 'Lucas Wright',
          handle: '@lucasw',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          bio: 'Vinyl selector, architect, and community curator.',
          isVerified: true,
          verificationTier: 'identity_verified',
        },
        members: [
          {
            id: 'host-4',
            name: 'Lucas Wright',
            handle: '@lucasw',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
            role: 'host',
            joinedAt: '2026-10-21T12:00:00Z',
            isVerified: true,
            verificationTier: 'identity_verified',
          },
          {
            id: 'user-curr-1',
            name: 'Alex Rivera',
            handle: '@alexr',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T15:20:00Z',
          },
          {
            id: 'member-15',
            name: 'Mira Kapoor',
            handle: '@mirak',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T17:00:00Z',
            isVerified: true,
            verificationTier: 'phone_verified',
          },
          {
            id: 'member-16',
            name: 'Tyler Vance',
            handle: '@tylerv',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-21T19:10:00Z',
          },
          {
            id: 'member-17',
            name: 'Brianna Fox',
            handle: '@brifox',
            avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T01:30:00Z',
          },
          {
            id: 'member-18',
            name: 'Daniel Zhao',
            handle: '@danielz',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T04:15:00Z',
          },
          {
            id: 'member-19',
            name: 'Rachel Greene',
            handle: '@rachelg',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T05:50:00Z',
          },
          {
            id: 'member-20',
            name: 'Liam Peterson',
            handle: '@liamp',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T07:25:00Z',
          },
        ],
      },
      {
        id: 'hangout-5',
        title: '35mm Street Photowalk & Espresso Lab',
        description: 'Grab your camera (analog 35mm, digital, or smartphone with RAW mode). We are doing a visual scavenger hunt through cobblestone streets, chasing industrial reflections, followed by specialty pour-overs and print swaps.',
        activityCategory: 'Creative & Jamming',
        activityType: 'Creative',
        dateTime: 'Next Tuesday at 10:00 AM',
        isoDate: '2026-10-27T10:00:00Z',
        location: {
          name: 'Archetype Espresso Bar',
          address: '115 DUMBO Water St',
          neighborhood: 'DUMBO / Brooklyn Bridge',
        },
        budget: 'Free',
        groupSizeLimit: 6,
        currentMembersCount: 3,
        tags: ['Photography', '35mm Film', 'Coffee', 'Creative Walk'],
        coverImage: '/src/assets/images/hero_hangout_community_1792683954659.jpg',
        privacy: 'public',
        itinerary: [
          { time: '10:00 AM', activity: 'Meet at Archetype, compare setups & film stocks' },
          { time: '10:30 AM', activity: 'Route through cobblestone waterfront arches' },
          { time: '12:00 PM', activity: 'Review frames & share visual prompts over espresso' },
        ],
        createdAt: '2026-10-21T16:00:00Z',
        isJoined: false,
        isSaved: false,
        host: {
          id: 'host-5',
          name: 'Nadia Solis',
          handle: '@nadiasolis',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: 'Documentary photographer & darkroom printer.',
        },
        members: [
          {
            id: 'host-5',
            name: 'Nadia Solis',
            handle: '@nadiasolis',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'host',
            joinedAt: '2026-10-21T16:00:00Z',
          },
          {
            id: 'member-21',
            name: 'Ethan Cole',
            handle: '@ethanc',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T02:00:00Z',
          },
          {
            id: 'member-22',
            name: 'Tara Lin',
            handle: '@taral',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T06:10:00Z',
          },
        ],
      },
      {
        id: 'hangout-6',
        title: 'Indie Cinema Screening & Retro Diner Discussion',
        description: 'Watching a 35mm print revival of a neo-noir classic at the indie cinema, followed immediately by hot french fries, cherry pie, and deep cinema analysis at the diner around the corner.',
        activityCategory: 'Indie Cinema & Arts',
        activityType: 'Casual',
        dateTime: 'Wednesday at 7:00 PM',
        isoDate: '2026-10-28T19:00:00Z',
        location: {
          name: 'Metrograph Indie Cinema',
          address: '7 Ludlow Street',
          neighborhood: 'Lower East Side',
        },
        budget: '$$',
        groupSizeLimit: 6,
        currentMembersCount: 5,
        tags: ['Indie Cinema', 'Film Buffs', 'Diner Talk', 'Neo-Noir'],
        coverImage: '/src/assets/images/hangout_boardgame_cafe_1792683956668.jpg',
        privacy: 'public',
        itinerary: [
          { time: '7:00 PM', activity: 'Meet in theater bookstore lobby' },
          { time: '7:30 PM', activity: 'Screening commences' },
          { time: '9:30 PM', activity: 'Post-film round-table at classic diner booth' },
        ],
        createdAt: '2026-10-22T01:00:00Z',
        isJoined: false,
        isSaved: true,
        host: {
          id: 'host-6',
          name: 'Damon Reese',
          handle: '@damonr',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          bio: 'Screenwriter & film festival programmer.',
        },
        members: [
          {
            id: 'host-6',
            name: 'Damon Reese',
            handle: '@damonr',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            role: 'host',
            joinedAt: '2026-10-22T01:00:00Z',
          },
          {
            id: 'member-23',
            name: 'Sora Tanaka',
            handle: '@sorat',
            avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T03:30:00Z',
          },
          {
            id: 'member-24',
            name: 'Kofi Mensah',
            handle: '@kofim',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T04:45:00Z',
          },
          {
            id: 'member-25',
            name: 'Astrid Thorne',
            handle: '@astridt',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T05:55:00Z',
          },
          {
            id: 'member-26',
            name: 'Leo Martin',
            handle: '@leom',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            role: 'member',
            joinedAt: '2026-10-22T06:50:00Z',
          },
        ],
      },
    ];
  }

  public getAllHangouts(filters?: {
    search?: string;
    category?: string;
    activityType?: string;
    budget?: string;
    neighborhood?: string;
    joinedOnly?: boolean;
    savedOnly?: boolean;
    createdOnly?: boolean;
  }): Hangout[] {
    let list = [...this.hangouts];

    if (!filters) return list;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.location.neighborhood.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== 'All') {
      list = list.filter((h) => h.activityCategory === filters.category);
    }

    if (filters.activityType && filters.activityType !== 'All') {
      list = list.filter((h) => h.activityType === filters.activityType);
    }

    if (filters.budget && filters.budget !== 'All') {
      list = list.filter((h) => h.budget === filters.budget);
    }

    if (filters.neighborhood && filters.neighborhood !== 'All') {
      list = list.filter((h) => h.location.neighborhood.toLowerCase().includes(filters.neighborhood!.toLowerCase()));
    }

    if (filters.joinedOnly) {
      list = list.filter((h) => h.isJoined);
    }

    if (filters.savedOnly) {
      list = list.filter((h) => h.isSaved);
    }

    if (filters.createdOnly) {
      list = list.filter((h) => h.host.id === this.currentUser.id);
    }

    return list;
  }

  public getHangoutById(id: string): Hangout | null {
    const found = this.hangouts.find((h) => h.id === id);
    return found ? { ...found } : null;
  }

  public createHangout(input: HangoutCreateInput): Hangout {
    const defaultCover =
      input.activityCategory === 'Bouldering & Climbing'
        ? '/src/assets/images/hangout_bouldering_session_1792683955989.jpg'
        : input.activityCategory === 'Board Games'
        ? '/src/assets/images/hangout_boardgame_cafe_1792683956668.jpg'
        : input.activityCategory === 'Foodie & Night Market'
        ? '/src/assets/images/hangout_foodie_nightmarket_1792683956228.jpg'
        : '/src/assets/images/hero_hangout_community_1792683954659.jpg';

    const newHangout: Hangout = {
      id: `hangout-${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      activityCategory: input.activityCategory,
      activityType: input.activityType,
      dateTime: input.dateTime,
      isoDate: new Date().toISOString(),
      location: {
        name: input.locationName.trim(),
        address: input.locationAddress.trim(),
        neighborhood: input.neighborhood.trim(),
      },
      budget: input.budget,
      groupSizeLimit: input.groupSizeLimit,
      currentMembersCount: 1,
      tags: input.tags.length > 0 ? input.tags : [input.activityCategory, 'Social'],
      coverImage: input.coverImage || defaultCover,
      privacy: input.privacy || 'public',
      itinerary: [
        { time: 'Start', activity: `Meet at ${input.locationName.trim()}` },
        { time: '+1h', activity: `Group activity & ${input.activityCategory}` },
        { time: '+2h', activity: 'Wind down & social yap' },
      ],
      createdAt: new Date().toISOString(),
      isJoined: true,
      isSaved: false,
      host: {
        id: this.currentUser.id,
        name: this.currentUser.name,
        handle: this.currentUser.handle,
        avatar: this.currentUser.avatar,
        bio: this.currentUser.bio,
        isVerified: this.currentUser.verification.tier !== 'none',
        verificationTier: this.currentUser.verification.tier,
      },
      members: [
        {
          id: this.currentUser.id,
          name: this.currentUser.name,
          handle: this.currentUser.handle,
          avatar: this.currentUser.avatar,
          role: 'host',
          joinedAt: new Date().toISOString(),
          bio: this.currentUser.bio,
          interests: this.currentUser.interests,
          isVerified: this.currentUser.verification.tier !== 'none',
          verificationTier: this.currentUser.verification.tier,
        },
      ],
    };

    this.hangouts.unshift(newHangout);
    return newHangout;
  }

  public joinHangout(hangoutId: string): Hangout {
    const hangout = this.hangouts.find((h) => h.id === hangoutId);
    if (!hangout) {
      throw new Error('Hangout not found');
    }

    const alreadyJoined = hangout.members.some((m) => m.id === this.currentUser.id);
    if (alreadyJoined) {
      throw new Error('You are already part of this hangout!');
    }

    if (hangout.currentMembersCount >= hangout.groupSizeLimit) {
      throw new Error('This hangout has reached its group size limit.');
    }

    hangout.members.push({
      id: this.currentUser.id,
      name: this.currentUser.name,
      handle: this.currentUser.handle,
      avatar: this.currentUser.avatar,
      role: 'member',
      joinedAt: new Date().toISOString(),
      bio: this.currentUser.bio,
      interests: this.currentUser.interests,
      isVerified: this.currentUser.verification.tier !== 'none',
      verificationTier: this.currentUser.verification.tier,
    });
    hangout.currentMembersCount = hangout.members.length;
    hangout.isJoined = true;

    return { ...hangout };
  }

  public leaveHangout(hangoutId: string): Hangout {
    const hangout = this.hangouts.find((h) => h.id === hangoutId);
    if (!hangout) {
      throw new Error('Hangout not found');
    }

    if (hangout.host.id === this.currentUser.id) {
      throw new Error('As host, you cannot leave your own hangout. You may cancel it if needed.');
    }

    hangout.members = hangout.members.filter((m) => m.id !== this.currentUser.id);
    hangout.currentMembersCount = hangout.members.length;
    hangout.isJoined = false;

    return { ...hangout };
  }

  public toggleSaveHangout(hangoutId: string): Hangout {
    const hangout = this.hangouts.find((h) => h.id === hangoutId);
    if (!hangout) {
      throw new Error('Hangout not found');
    }

    hangout.isSaved = !hangout.isSaved;
    return { ...hangout };
  }

  public reportHangout(input: HangoutReportInput): { success: boolean; reportId: string } {
    const hangout = this.hangouts.find((h) => h.id === input.hangoutId);
    if (!hangout) {
      throw new Error('Hangout not found');
    }

    const reportId = `report-${Date.now()}`;
    this.reports.push({
      ...input,
      id: reportId,
      timestamp: new Date().toISOString(),
    });

    hangout.reportsCount = (hangout.reportsCount || 0) + 1;
    return { success: true, reportId };
  }

  // ------------------------------------------------------------------
  // Admin Portal Store Operations
  // ------------------------------------------------------------------

  public getAllReports() {
    return this.reports.map((r) => {
      const h = this.hangouts.find((item) => item.id === r.hangoutId);
      return {
        ...r,
        hangoutTitle: h ? h.title : 'Deleted Hangout',
        hostName: h ? h.host.name : 'Unknown',
        status: (r as any).status || 'pending',
      };
    });
  }

  public resolveReport(reportId: string, action: 'dismissed' | 'deleted_hangout') {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    (report as any).status = action === 'dismissed' ? 'dismissed' : 'resolved';

    if (action === 'deleted_hangout' && report.hangoutId) {
      this.deleteHangout(report.hangoutId);
    }

    return { success: true, report };
  }

  public deleteHangout(id: string): boolean {
    const prevLen = this.hangouts.length;
    this.hangouts = this.hangouts.filter((h) => h.id !== id);
    return this.hangouts.length < prevLen;
  }

  public updateHangout(id: string, updates: Partial<Hangout>): Hangout {
    const idx = this.hangouts.findIndex((h) => h.id === id);
    if (idx === -1) {
      throw new Error('Hangout not found');
    }

    this.hangouts[idx] = {
      ...this.hangouts[idx],
      ...updates,
    };
    return { ...this.hangouts[idx] };
  }

  public getAdminMetrics() {
    const totalHangouts = this.hangouts.length;
    const totalActiveRSVPs = this.hangouts.reduce((acc, h) => acc + h.currentMembersCount, 0);
    const totalSpots = this.hangouts.reduce((acc, h) => acc + h.groupSizeLimit, 0);
    const pendingReports = this.reports.filter((r: any) => !r.status || r.status === 'pending').length;

    const allVerifs = this.getAllVerifications();
    const verifiedUsersCount = allVerifs.filter((v) => v.status === 'verified').length;
    const pendingVerificationsCount = allVerifs.filter((v) => v.status === 'pending' || v.identityStatus === 'pending_review').length;

    return {
      totalHangouts,
      totalActiveRSVPs,
      totalSpotsAvailable: Math.max(0, totalSpots - totalActiveRSVPs),
      totalReportsCount: this.reports.length,
      pendingReportsCount: pendingReports,
      verifiedUsersCount,
      pendingVerificationsCount,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  public getAllVerifications() {
    return [
      {
        id: `ver-${this.currentUser.id}`,
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        userHandle: this.currentUser.handle,
        avatar: this.currentUser.avatar,
        tier: this.currentUser.verification.tier,
        status: this.currentUser.verification.status,
        phoneVerified: this.currentUser.verification.phoneVerified,
        phoneNumberMasked: this.currentUser.verification.phoneNumberMasked,
        identityVerified: this.currentUser.verification.identityVerified,
        identityStatus: this.currentUser.verification.identityStatus,
        documentType: 'Government Photo ID',
        rejectionReason: this.currentUser.verification.rejectionReason,
        attemptsCount: this.currentUser.verification.attemptsCount,
        lastAttemptAt: this.currentUser.verification.lastAttemptAt,
        verifiedAt: this.currentUser.verification.verifiedAt,
      },
      {
        id: 'ver-host-1',
        userId: 'host-1',
        userName: 'Maya Chen',
        userHandle: '@mayachen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        tier: 'identity_verified' as const,
        status: 'verified' as const,
        phoneVerified: true,
        phoneNumberMasked: '+1 (•••) •••-4921',
        identityVerified: true,
        identityStatus: 'verified' as const,
        documentType: 'US Passport',
        attemptsCount: 0,
        verifiedAt: '2026-09-14T10:15:00Z',
      },
      {
        id: 'ver-host-2',
        userId: 'host-2',
        userName: 'Julian Vance',
        userHandle: '@julianv',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        tier: 'phone_verified' as const,
        status: 'verified' as const,
        phoneVerified: true,
        phoneNumberMasked: '+1 (•••) •••-8820',
        identityVerified: false,
        identityStatus: 'not_started' as const,
        attemptsCount: 0,
        verifiedAt: '2026-10-02T16:20:00Z',
      },
      {
        id: 'ver-host-3',
        userId: 'host-3',
        userName: 'Samira Khan',
        userHandle: '@samirak',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        tier: 'identity_verified' as const,
        status: 'verified' as const,
        phoneVerified: true,
        phoneNumberMasked: '+1 (•••) •••-3104',
        identityVerified: true,
        identityStatus: 'verified' as const,
        documentType: 'Driver License',
        attemptsCount: 0,
        verifiedAt: '2026-08-20T14:00:00Z',
      },
      {
        id: 'ver-host-4',
        userId: 'host-4',
        userName: 'Lucas Wright',
        userHandle: '@lucasw',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        tier: 'identity_verified' as const,
        status: 'verified' as const,
        phoneVerified: true,
        phoneNumberMasked: '+1 (•••) •••-1299',
        identityVerified: true,
        identityStatus: 'verified' as const,
        documentType: 'National ID',
        attemptsCount: 0,
        verifiedAt: '2026-09-01T12:00:00Z',
      },
    ];
  }

  public resetToInitialData() {
    this.reports = [];
    this.seedInitialData();
    return { success: true, message: 'Database reset to initial sample seed.' };
  }

  public getRawDatabase() {
    return {
      hangoutsCount: this.hangouts.length,
      reportsCount: this.reports.length,
      currentUser: this.currentUser,
      hangouts: this.hangouts,
      reports: this.reports,
    };
  }

  public getCurrentUser(): UserProfile {
    return { ...this.currentUser };
  }

  public updateUserVerification(verification: any): UserProfile {
    this.currentUser.verification = {
      ...this.currentUser.verification,
      ...verification,
    };

    const isVerified = this.currentUser.verification.tier !== 'none';
    const tier = this.currentUser.verification.tier;

    // Propagate verification to hangouts where current user is host or member
    for (const h of this.hangouts) {
      if (h.host.id === this.currentUser.id) {
        h.host.isVerified = isVerified;
        h.host.verificationTier = tier;
      }
      for (const m of h.members) {
        if (m.id === this.currentUser.id) {
          m.isVerified = isVerified;
          m.verificationTier = tier;
        }
      }
    }

    return { ...this.currentUser };
  }

  public updateCurrentUser(updates: Partial<UserProfile>): UserProfile {
    this.currentUser = {
      ...this.currentUser,
      ...updates,
      privacySettings: {
        ...this.currentUser.privacySettings,
        ...(updates.privacySettings || {}),
      },
      verification: {
        ...this.currentUser.verification,
        ...(updates.verification || {}),
      },
    };
    return { ...this.currentUser };
  }
}

export const dataStore = new YapOutDataStore();
