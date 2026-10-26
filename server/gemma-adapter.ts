import { GoogleGenAI } from '@google/genai';
import {
  GemmaPlanRequest,
  GemmaPlanResponse,
  GemmaRuntimeStatus,
  GemmaPlanSuggestion,
  HangoutCategory,
  BudgetTier,
} from '../src/types/index.js';

/**
 * Server-side Adapter for Gemma 4 AI Inference using the Gemini API.
 *
 * Model: `gemma-4-31b-it`
 * Key: Read strictly on the server from `process.env.GEMINI_API_KEY`.
 *
 * If the key is missing or the call fails, it gracefully falls back
 * to the simulated development mode with identical schema guarantees.
 */
export class Gemma4InferenceAdapter {
  private modelName: string;
  private timeoutMs: number;
  private lastInferenceSuccess: boolean = false;
  private lastInferenceTime: string | null = null;
  private lastError: string | null = null;

  constructor() {
    this.modelName = process.env.GEMMA_4_MODEL_NAME?.trim() || 'gemma-4-31b-it';
    this.timeoutMs = parseInt(process.env.GEMMA_4_TIMEOUT_MS || '35000', 10);
  }

  /**
   * Check if GEMINI_API_KEY is present on the server.
   */
  public hasApiKey(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  }

  /**
   * Check if live runtime is configured and active.
   */
  public isRuntimeConfigured(): boolean {
    return this.hasApiKey() && this.lastError === null;
  }

  /**
   * Return current configuration status for transparency in UI and health checks.
   * Kept strictly server-side; NEVER exposes the actual key value.
   */
  public getRuntimeStatus(): GemmaRuntimeStatus {
    const keyPresent = this.hasApiKey();
    // Configured is true if the key is present and we haven't suffered an unrecoverable failure
    const isLive = keyPresent && (this.lastInferenceSuccess || this.lastError === null);

    return {
      configured: isLive,
      endpointUrl: keyPresent ? 'Gemini API (gemma-4-31b-it)' : null,
      modelName: this.modelName,
      requiresKey: true,
      hasKey: keyPresent,
    };
  }

  /**
   * Update Gemma 4 configuration dynamically from Admin portal if needed.
   */
  public updateRuntimeConfig(config: {
    endpointUrl?: string;
    apiKey?: string;
    modelName?: string;
    timeoutMs?: number;
  }): GemmaRuntimeStatus {
    if (config.modelName) {
      this.modelName = config.modelName.trim();
    }
    if (config.timeoutMs) {
      this.timeoutMs = Number(config.timeoutMs) || 35000;
    }
    return this.getRuntimeStatus();
  }

  public getRawConfig(): { endpointUrl: string | null; hasApiKey: boolean; modelName: string; timeoutMs: number } {
    return {
      endpointUrl: this.hasApiKey() ? 'Gemini API' : null,
      hasApiKey: this.hasApiKey(),
      modelName: this.modelName,
      timeoutMs: this.timeoutMs,
    };
  }

  /**
   * Plan a group hangout using the real Gemma 4 model (gemma-4-31b-it) via the Gemini API.
   * If the key is missing or the call fails, smoothly falls back to simulated mode.
   */
  public async planHangout(request: GemmaPlanRequest): Promise<GemmaPlanResponse> {
    this.validateInput(request);

    // 1. If GEMINI_API_KEY is missing, immediately fall back to simulated mode
    if (!this.hasApiKey()) {
      console.warn('[Gemma 4 Planner] GEMINI_API_KEY is missing from environment. Using simulated mode.');
      this.lastInferenceSuccess = false;
      return this.generateSimulatedResponse(
        request,
        'GEMINI_API_KEY secret is not set. Operating in simulated fallback mode.'
      );
    }

    // 2. Attempt real inference with gemma-4-31b-it via GoogleGenAI SDK
    try {
      const liveResponse = await this.callGeminiGemma4WithRetry(request);
      this.lastInferenceSuccess = true;
      this.lastInferenceTime = new Date().toISOString();
      this.lastError = null;
      return liveResponse;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[Gemma 4 Planner] Live inference failed. Falling back to simulated mode:', errMsg);
      this.lastError = errMsg;
      this.lastInferenceSuccess = false;

      // Graceful fallback to simulated mode
      return this.generateSimulatedResponse(
        request,
        `Live model call failed (${errMsg.slice(0, 120)}). Smoothly fell back to simulated mode.`
      );
    }
  }

  private validateInput(req: GemmaPlanRequest): void {
    if (!req.groupSize || req.groupSize < 2 || req.groupSize > 50) {
      throw new Error('Group size must be between 2 and 50 people.');
    }
    if (!req.vibes || !Array.isArray(req.vibes) || req.vibes.length === 0) {
      throw new Error('Please select at least one interest or vibe for your group.');
    }
    if (!req.location || req.location.trim().length === 0) {
      throw new Error('Please specify a neighborhood or general location.');
    }
  }

  /**
   * Call the real Gemma 4 model (gemma-4-31b-it) with retries for transient spikes.
   */
  private async callGeminiGemma4WithRetry(req: GemmaPlanRequest, maxAttempts = 2): Promise<GemmaPlanResponse> {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = this.buildInferencePrompt(req);

    let lastError: any = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemma 4 Planner] Calling model ${this.modelName} (attempt ${attempt}/${maxAttempts})...`);

        const response = await ai.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text?.trim() || '';
        if (!rawText) {
          throw new Error('Empty response from Gemma 4 model.');
        }

        const parsed = this.parseAndSanitizeJson(rawText, req);
        this.validateParsedOutput(parsed);

        return {
          runtimeConfigured: true,
          simulated: false,
          modelUsed: `Gemma 4 (${this.modelName})`,
          endpointUrl: 'Gemini API',
          runtimeNotice: `Live inference powered by Gemma 4 (${this.modelName}).`,
          suggestions: parsed.suggestions,
          proposedSchedule: parsed.proposedSchedule,
          shortRationale: parsed.shortRationale,
          invitationMessage: parsed.invitationMessage,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemma 4 Planner] Attempt ${attempt} error:`, err?.message || err);
        if (attempt < maxAttempts) {
          // Wait 1.2s before retry on transient spike
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
    }

    throw lastError || new Error(`Gemma 4 inference failed after ${maxAttempts} attempts.`);
  }

  private parseAndSanitizeJson(rawText: string, req: GemmaPlanRequest): any {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      // If direct parse fails, try extracting first JSON object
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Gemma 4 output could not be parsed as JSON: ' + clean.slice(0, 150));
      }
    }

    // Ensure suggestions structure is well-formed
    if (Array.isArray(parsed.suggestions)) {
      parsed.suggestions = parsed.suggestions.map((item: any, idx: number) => ({
        id: item.id || `act-${idx + 1}`,
        title: item.title || `Hangout Activity ${idx + 1}`,
        tagline: item.tagline || 'Curated group experience.',
        estimatedCost: item.estimatedCost || (req.budget === 'Free' ? '$0' : '$10-$20/person'),
        recommendedVenueType: item.recommendedVenueType || (req.environment === 'Outdoor' ? 'Local park or scenic route' : 'Cozy venue'),
        idealGroupSize: item.idealGroupSize || `${req.groupSize} people`,
        highlight: item.highlight || 'Relaxed conversation and shared fun.',
        suggestedCategory: this.validateCategory(item.suggestedCategory, req.vibes[0] || 'Coffee & Yap'),
      }));
    }

    // Ensure proposedSchedule is well-formed
    if (Array.isArray(parsed.proposedSchedule)) {
      parsed.proposedSchedule = parsed.proposedSchedule.map((item: any, idx: number) => ({
        time: item.time || `${idx + 1}:00`,
        activity: item.activity || `Milestone ${idx + 1}`,
        notes: item.notes || '',
      }));
    }

    return parsed;
  }

  private validateParsedOutput(output: any): void {
    if (!output.suggestions || !Array.isArray(output.suggestions) || output.suggestions.length < 2) {
      throw new Error('Invalid Gemma 4 response: Expected at least 2 activity suggestions.');
    }
    if (!output.proposedSchedule || !Array.isArray(output.proposedSchedule) || output.proposedSchedule.length === 0) {
      throw new Error('Invalid Gemma 4 response: Expected a proposed schedule.');
    }
    if (!output.shortRationale || typeof output.shortRationale !== 'string') {
      throw new Error('Invalid Gemma 4 response: Missing short rationale.');
    }
    if (!output.invitationMessage || typeof output.invitationMessage !== 'string') {
      throw new Error('Invalid Gemma 4 response: Missing invitation message.');
    }
  }

  private validateCategory(cat: string | undefined, fallbackVibe: string): HangoutCategory {
    const valid: HangoutCategory[] = [
      'Coffee & Yap',
      'Bouldering & Climbing',
      'Board Games',
      'Foodie & Night Market',
      'Indie Cinema & Arts',
      'Outdoor & Hiking',
      'Creative & Jamming',
      'Tech & Hack',
    ];
    if (cat && valid.includes(cat as HangoutCategory)) {
      return cat as HangoutCategory;
    }
    return this.inferCategory(fallbackVibe);
  }

  private buildInferencePrompt(req: GemmaPlanRequest): string {
    return `You are the YapOut AI Social Hangout Planner.
Generate a social hangout plan for a real-world group meetup matching these preferences:
- Group Size: ${req.groupSize} people
- Target Vibes & Interests: ${req.vibes.join(', ')}
- Budget Tier: ${req.budget}
- Time of Day: ${req.timeOfDay}
- Planned Duration: ${req.durationHours} hours
- Setting: ${req.environment}
- Target Neighborhood / Metro Area: ${req.location}
${req.notes ? `- Additional Preferences & Vibe Notes: ${req.notes}` : ''}

You MUST output strictly a valid JSON object matching this exact schema:
{
  "suggestions": [
    {
      "id": "act-1",
      "title": "Creative Title for Activity 1",
      "tagline": "One-line hook describing the activity",
      "estimatedCost": "Approx cost (e.g. Free, $15-$25/person)",
      "recommendedVenueType": "Venue description",
      "idealGroupSize": "e.g., 3-6 people",
      "highlight": "Key memorable social spark or highlight",
      "suggestedCategory": "Coffee & Yap"
    }
  ],
  "proposedSchedule": [
    {
      "time": "e.g., 2:00 PM",
      "activity": "Activity milestone name",
      "notes": "What happens here"
    }
  ],
  "shortRationale": "A 2-3 sentence explanation of why this itinerary balances conversation and energy.",
  "invitationMessage": "A catchy, warm 2-sentence invitation message ready to send to friends or post on YapOut."
}

Rules:
1. Provide exactly 3 curated activity suggestions in "suggestions".
2. "suggestedCategory" MUST be one of: "Coffee & Yap", "Bouldering & Climbing", "Board Games", "Foodie & Night Market", "Indie Cinema & Arts", "Outdoor & Hiking", "Creative & Jamming", "Tech & Hack".
3. Provide 3-4 chronological items in "proposedSchedule" tailored to the duration.
4. Output raw JSON only.`;
  }

  /**
   * Visibly labeled Simulated Development Mode.
   * Dynamically constructs tailored suggestions matching the exact requested vibes and budget.
   */
  public generateSimulatedResponse(req: GemmaPlanRequest, notice?: string): GemmaPlanResponse {
    const primaryVibe = req.vibes[0] || 'Social Yap';
    const secondaryVibe = req.vibes[1] || 'Good Eats';

    const suggestions: GemmaPlanSuggestion[] = [
      {
        id: 'sim-1',
        title: `${primaryVibe} Kickoff & Social Lounge`,
        tagline: `Low-pressure intro session designed for ${req.groupSize} people to break the ice naturally.`,
        estimatedCost: req.budget === 'Free' ? '$0 (BYO / Public Space)' : req.budget === '$' ? '$8 - $14 / person' : '$20 - $35 / person',
        recommendedVenueType: req.environment === 'Outdoor' ? 'Park Pavilion / Community Green' : 'Aesthetic Corner Cafe / Roastery',
        idealGroupSize: `${req.groupSize} people`,
        highlight: 'Casual conversation sparks, communal seating, and zero awkward intros.',
        suggestedCategory: this.inferCategory(primaryVibe),
      },
      {
        id: 'sim-2',
        title: `Hands-On ${secondaryVibe} Exploration`,
        tagline: `Engaging collaborative activity that gives everyone a shared focus without forced small-talk.`,
        estimatedCost: req.budget === 'Free' ? 'Free entry' : req.budget === '$' ? '$12 / person' : '$25 / person',
        recommendedVenueType: req.environment === 'Indoor' ? 'Boutique Activity Space or Tabletop Parlor' : 'Urban Discovery Trail / Night Stroll',
        idealGroupSize: `${req.groupSize} people`,
        highlight: 'Shared laughs over friendly team challenges and authentic teamwork.',
        suggestedCategory: this.inferCategory(secondaryVibe),
      },
      {
        id: 'sim-3',
        title: `Wind-Down Street Bites & Evening De-Brief`,
        tagline: `Casual wrap-up where inside jokes solidify and plans for the next hangout get scheduled.`,
        estimatedCost: req.budget === 'Free' ? 'Free (Walk & Yap)' : req.budget === '$' ? '$10 / person' : '$18 / person',
        recommendedVenueType: 'Open-Air Food Market / Late Dessert Haven',
        idealGroupSize: `${req.groupSize} people`,
        highlight: 'Golden-hour debrief, sharing social links, and snapping a group candid.',
        suggestedCategory: 'Foodie & Night Market',
      },
    ];

    const startHour = req.timeOfDay === 'Morning' ? 10 : req.timeOfDay === 'Afternoon' ? 14 : req.timeOfDay === 'Evening' ? 18 : 21;
    const proposedSchedule = [
      {
        time: `${startHour}:00`,
        activity: `Meetup at ${req.location} & Welcome Drinks`,
        notes: `Gather near the entrance; easy identifier is YapOut host flag/sign.`,
      },
      {
        time: `${startHour + 1}:15`,
        activity: `Main Event: ${suggestions[1].title}`,
        notes: `Dive into the core activity together; structured for all skill levels.`,
      },
      {
        time: `${startHour + Math.max(2, Math.round(req.durationHours))}:00`,
        activity: `Wrap-up at Local Food Spot & Group Photo`,
        notes: `Debrief the highlights, exchange socials, and vote on next weekend's plan.`,
      },
    ];

    const shortRationale = `This itinerary is tuned specifically for ${req.groupSize} friends in ${req.location} who want a ${req.environment.toLowerCase()} ${req.budget.toLowerCase()}-budget hangout. Starting with casual beverage yap removes initial social friction, transitioning into ${primaryVibe.toLowerCase()} delivers memorable active engagement, and wrapping with open-ended street food lets everyone stay as long as they want.`;

    const invitationMessage = `Hey friends! Putting together an easygoing ${req.timeOfDay.toLowerCase()} hangout in ${req.location} for some ${primaryVibe.toLowerCase()} and good food. Spots are capped at ${req.groupSize} so it stays cozy—hit join if you're down! ⚡`;

    return {
      runtimeConfigured: false,
      simulated: true,
      modelUsed: 'Gemma 4 (Simulated Mode)',
      runtimeNotice: notice || 'Operating in simulated fallback mode.',
      endpointUrl: null,
      suggestions,
      proposedSchedule,
      shortRationale,
      invitationMessage,
    };
  }

  private inferCategory(vibe: string): HangoutCategory {
    const v = vibe.toLowerCase();
    if (v.includes('climb') || v.includes('boulder') || v.includes('fitness')) return 'Bouldering & Climbing';
    if (v.includes('board') || v.includes('game') || v.includes('tabletop')) return 'Board Games';
    if (v.includes('food') || v.includes('eat') || v.includes('tasting') || v.includes('market')) return 'Foodie & Night Market';
    if (v.includes('movie') || v.includes('cinema') || v.includes('art') || v.includes('gallery')) return 'Indie Cinema & Arts';
    if (v.includes('hike') || v.includes('walk') || v.includes('outdoor') || v.includes('park')) return 'Outdoor & Hiking';
    if (v.includes('music') || v.includes('jam') || v.includes('craft') || v.includes('photo')) return 'Creative & Jamming';
    if (v.includes('tech') || v.includes('code') || v.includes('hack') || v.includes('build')) return 'Tech & Hack';
    return 'Coffee & Yap';
  }
}

export const gemmaAdapter = new Gemma4InferenceAdapter();
