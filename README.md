# YapOut ⚡

**YapOut** is a modern, mobile-first social hangout web application built to help people discover like-minded friends, join real-world hangout groups, organize activities, and eliminate social hesitation.

---

## 🚀 Key Features

1. **Home Feed**: Live feed of upcoming hangouts with host profiles, available spots, unboxed metadata, and quick RSVP/save actions.
2. **Discover Engine**: Multifaceted search and filtering by interest/vibe, activity pacing, budget tier (`Free`, `$`, `$$`, `$$$`), and neighborhood.
3. **Hangout Creator**: Host activities with custom group limits, category tags, meeting locations, timelines, and live card previews.
4. **Group Detail Sheet**: Confirmed member attendee rosters with avatars and bios, capacity progress tracking, planned itineraries, one-click shareable links, and community reporting.
5. **Gemma 4 AI Planner**: Server-side AI intelligence that accepts structured group preferences (size, vibes, budget, time, environment) and returns curated activity suggestions, a proposed schedule, social rationale, and a ready-to-send invitation message.
6. **User Profile & Privacy**: Manage your hangout vibes, view created and joined hangouts, and configure privacy controls.

7. **Admin Portal & Backend Control**:
   - Access via the **"Admin Portal"** link in the top bar or inside the Profile tab.
   - **Dashboard Overview**: Real-time metrics on total hangouts, active RSVPs, spots available, and pending safety reports.
   - **Hangout Fleet Management**: Search, inspect attendee rosters, edit limits, or delete violating hangouts.
   - **Safety Reports Queue**: Review incoming attendee flags (reason, details, timestamps) with "Dismiss" or "Take Down Hangout" actions.
   - **Gemma 4 Controller & Diagnostic Runner**: Dynamically update `GEMMA_4_ENDPOINT_URL`, bearer tokens, and execute live prompt tests with real-time latency diagnostics.
   - **Database Inspector**: View raw JSON state, download JSON backups, or reset to initial sample seed.
   - **cURL Generator**: Copy backend API commands with ready-to-use payloads for terminal access.

---

## 🛠️ Backend REST API Access

The Express backend runs on port 3000 and exposes the following public and administrative endpoints:

### Public Hangout APIs
- `GET /api/hangouts`: List all hangouts (supports `?search=`, `?category=`, `?budget=`, `?neighborhood=`, `?joinedOnly=true`)
- `GET /api/hangouts/:id`: Get full details of a specific hangout
- `POST /api/hangouts`: Create a new hangout
- `POST /api/hangouts/:id/join`: Join / RSVP to a hangout (enforces capacity)
- `POST /api/hangouts/:id/leave`: Leave a hangout
- `POST /api/hangouts/:id/save`: Toggle bookmark
- `POST /api/hangouts/:id/report`: Submit a safety or moderation report

### AI & Status APIs
- `GET /api/gemma/status`: Query Gemma 4 configuration status
- `POST /api/gemma/plan`: Generate tailored activity suggestions and schedule

### Admin & Governance APIs
- `GET /api/admin/metrics`: Fetch real-time system metrics (total events, RSVPs, uptime)
- `GET /api/admin/reports`: List all submitted community safety reports
- `POST /api/admin/reports/:id/resolve`: Resolve or dismiss a safety report
- `DELETE /api/admin/hangouts/:id`: Delete a hangout from the database
- `PATCH /api/admin/hangouts/:id`: Update a hangout's parameters
- `GET /api/admin/database`: Retrieve full in-memory JSON state dump
- `POST /api/admin/database/reset`: Reset database back to default seed
- `POST /api/admin/gemma/config`: Update Gemma 4 endpoint URL, API key, or model name dynamically
- `POST /api/admin/gemma/test`: Run an immediate diagnostic prompt test and receive latency metrics

---

## 🧠 Gemma 4 AI Architecture & Workflow

YapOut keeps model inference strictly separated from UI components and client bundles:

```
[Browser / React UI]
       │
       │ POST /api/gemma/plan (Structured JSON preferences)
       ▼
[Express Server-Side Adapter: server/gemma-adapter.ts]
       │
       ├── Input Validation (groupSize, vibes, budget, location)
       │
       ├── Checks: Is GEMMA_4_ENDPOINT_URL configured?
       │     │
       │     ├── YES: Dispatches HTTP request to hosted Gemma 4 inference server
       │     │        Validates schema response -> Returns live Gemma 4 plan
       │     │
       │     └── NO:  Returns validated Development Simulation
       │              Visibly marked with { simulated: true, runtimeConfigured: false }
       │              (NO silent Gemini substitution)
       │
       ▼
[Client UI with Transparent Status Banner & Suggestions]
```

---

## 🛠️ Configuring the Real Gemma 4 Runtime

YapOut never silently falls back or obscures runtime configuration. When `GEMMA_4_ENDPOINT_URL` is unset, the UI displays a clear `SIMULATED DEV MODE (UNCONFIGURED)` badge with a link to setup instructions.

### 1. Local Inference with Ollama
```bash
# Pull and start Gemma
ollama run gemma:latest

# In your .env file (or via Admin Portal -> Gemma 4 Controller):
GEMMA_4_ENDPOINT_URL="http://localhost:11434/v1/chat/completions"
GEMMA_4_MODEL_NAME="gemma:latest"
```

### 2. Cloud / vLLM / Hugging Face TGI / Vertex AI
Configure your environment variables in `.env`:
```env
GEMMA_4_ENDPOINT_URL="https://your-inference-endpoint/v1/chat/completions"
GEMMA_4_API_KEY="your-bearer-token"
GEMMA_4_MODEL_NAME="gemma-4"
GEMMA_4_TIMEOUT_MS="30000"
```

---

## 📦 How to Run

```bash
# Install dependencies
npm install

# Start development server (runs Express + Vite on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```


---

## 🎨 Design Constitution

- **Palette**: Dark charcoal background (`#0c0d12`), structural surface (`#141620`), electric purple (`#a855f7`) and vibrant lime (`#bef264`) accents.
- **Typography**: Clean Plus Jakarta Sans and JetBrains Mono tabular figures.
- **Ergonomics**: Mobile touch-optimized bottom bar (44px+ hitboxes) expanding naturally to multi-column desktop layouts.
- **Zero-Pill Discipline**: Unboxed metadata with typographic separators (`·`).
