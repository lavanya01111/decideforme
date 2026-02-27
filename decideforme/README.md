## ⚡ DecideForMe — AI‑Powered Decision Assistant

> Eliminate decision fatigue. DecideForMe uses an AI decision engine to pick the best option for you based on your preferences, habits, goals, and current context.

---

## Executive summary

- **What it is**: DecideForMe is a full‑stack web application where users describe a decision (e.g. food, fitness, entertainment, work tasks), list options, and let an AI agent pick a single best choice with a clear explanation and confidence score.
- **Why it matters**: Modern life pushes hundreds of micro‑decisions per day. This app reduces decision fatigue by offloading repeatable and low‑risk decisions to an AI that learns your preferences over time.
- **Who it is for**: Busy students, professionals, and anyone who feels overwhelmed by daily choices but still wants decisions that align with their long‑term goals (health, budget, productivity, etc.).
- **How it works (high level)**:
  - A **React + Vite + Tailwind** frontend for the decision experience, analytics dashboards, and settings.
  - A **Node.js + Express + MongoDB** backend for auth, persistence, analytics, and AI orchestration.
  - An **LLM provider (OpenAI‑compatible API, e.g. OpenRouter)** for the decision engine and preference learning.

---

## Project definition

- **Problem statement**:  
  People frequently get stuck in analysis paralysis: scrolling menus, comparing options, or worrying about “perfect” choices. This wastes time and mental energy.

- **Solution statement**:  
  DecideForMe centralizes decision‑making into a single interface. Users:
  1. State their question and category.
  2. Provide candidate options.
  3. Optionally add context (mood, time pressure, notes).
  4. Receive one decisive recommendation with justification and confidence.

- **Key capabilities**:
  - Personalized decision recommendations for multiple life domains.
  - Learning from feedback to refine future choices.
  - History and analytics to understand patterns over time.
  - Group decision flows with voting.

---

## Vision and objectives

- **Vision**:  
  Become a personal “decision co‑pilot” that silently learns user behavior and helps them make faster, higher‑quality choices without cognitive overload.

- **High‑level objectives**:
  - **Objective 1**: Reduce perceived decision fatigue for active users.
  - **Objective 2**: Provide recommendations that feel aligned with user goals at least most of the time (measured via feedback ratings).
  - **Objective 3**: Maintain a simple, delightful UX that feels more like a coach than a raw AI chat.
  - **Objective 4**: Be easy to deploy and run on inexpensive or free infrastructure.

---

## Scope

- **In scope**
  - Email/password authentication with JWT‑based sessions.
  - User profiles with basic attributes (age, goals, restrictions, budgets).
  - Creation of decisions with multiple options and contextual metadata.
  - AI‑generated recommendation with JSON‑structured output:
    - `chosen`, `reason`, `confidence`, `alternatives`, `tags`.
  - Feedback capture per decision (did user follow the advice, rating).
  - Preference learning and pattern extraction in the background.
  - Decision history with filters.
  - Basic analytics: counts, categories, success rates.
  - Group decisions and voting.
  - Dark mode and responsive UI.

- **Out of scope (current version)**
  - Payment / subscriptions.
  - Native mobile apps.
  - Deep calendar / email / 3rd‑party integrations (only listed as future ideas).
  - Enterprise‑grade RBAC, SSO, or multi‑tenant admin dashboards.

---

## Feature overview

- **Authentication & user management**
  - **Register / Login / Logout** with JWT.
  - **Profile management**: age, fitness goals, dietary restrictions, work style, budget levels.
  - **Persistent auth state** in the frontend via Zustand.

- **Decision creation & AI recommendations**
  - **New Decision flow** (`NewDecision.jsx`):
    - Title, category (food, entertainment, tasks, etc.).
    - List of options (min. 2) with nice interactive UI.
    - Optional context: mood, time available, priority, time of day, notes, weather.
  - AI returns:
    - **Chosen option** (must be one of the submitted options).
    - **Reason** (2–3 sentences).
    - **Confidence score** (0–100).
    - **Alternatives** with short notes.
    - **Tags** summarizing the decision.

- **History & feedback**
  - **Decision history** view with:
    - Past decisions, category, timestamps.
    - Stored AI result (chosen, confidence).
  - **Feedback capture**:
    - Whether the user followed the recommendation.
    - Rating / satisfaction.

- **Preference learning**
  - Background task that sends decision + feedback data to the LLM.
  - Extracts compact “behavioral patterns” (e.g. “prefers lighter meals at night”) and stores them in `preferences`.
  - The most recent patterns and choices are embedded in the system prompt for future decisions.

- **Analytics & dashboards**
  - **Analytics page** surfaces:
    - Number of decisions taken.
    - Category breakdown.
    - Simple charts via `recharts`.
  - Helps users understand:
    - Where they rely on the assistant (food vs tasks vs entertainment).
    - High‑level behavior trends.

- **Settings & personalization**
  - Update profile information and preferences.
  - Toggle between light/dark themes.
  - Fine‑tune categories and UI preferences.

- **Group decisions**
  - Create group decisions and track votes via `GroupVote` model.
  - Allow friends/teammates to vote on options; AI can still assist.

---

## Tech stack

- **Frontend**
  - **React 18** with functional components and hooks.
  - **Vite** for fast dev server and bundling.
  - **React Router** for SPA routing.
  - **Tailwind CSS** for utility‑first styling.
  - **Framer Motion** for micro‑interactions and animations.
  - **Recharts** for analytics charts.
  - **Zustand** for lightweight global auth state.
  - **Axios** for HTTP requests (`api.js`).

- **Backend**
  - **Node.js 18+** and **Express** for the REST API.
  - **MongoDB + Mongoose** for persistence.
  - **JSON Web Tokens (JWT)** for authentication.
  - **Helmet** for security headers.
  - **CORS** for cross‑origin access from the React frontend.
  - **express‑rate‑limit** for protecting AI‑heavy endpoints.
  - **dotenv** for environment management.
  - **openai** Node SDK configured with a **generic OpenAI‑compatible base URL** (e.g. OpenRouter).

- **AI / LLM layer**
  - OpenAI‑compatible provider (e.g. **OpenRouter**) using:
    - `LLM_API_KEY` for authentication.
    - `LLM_API_BASE_URL` for routing via baseURL.
    - Default model: `openai/gpt-4o-mini` (or compatible fast model).

---

## Architecture overview

- **High‑level flow**
  1. User authenticates and obtains a JWT.
  2. User creates a decision via the frontend.
  3. Frontend posts to `/api/decisions` with options and context.
  4. Backend:
     - Loads user + preferences from MongoDB.
     - Builds a **system prompt** from profile, learned patterns, and recent choices.
     - Builds a **user message** from the current decision + context.
     - Calls the LLM via the OpenAI‑compatible API.
     - Validates and stores the result in the `decisions` collection.
  5. Frontend displays the AI’s recommendation and saves feedback.
  6. A background learning function updates `preferences.learnedPatterns`.

- **Frontend structure**

```text
decideforme/
├── backend/
│   ├── models/           ← Mongoose schemas (User, Decision, Preference, Analytics, GroupVote)
│   ├── routes/           ← Express routes (auth, decisions, preferences, analytics, groups)
│   ├── middleware/       ← JWT auth middleware
│   ├── utils/
│   │   └── aiService.js  ← LLM integration + prompt engineering
│   ├── server.js         ← Express app entry point
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx        ← Marketing & onboarding
    │   │   ├── Login.jsx          ← Auth
    │   │   ├── Register.jsx       ← Auth
    │   │   ├── Dashboard.jsx      ← Summary dashboard
    │   │   ├── NewDecision.jsx    ← Main AI decision UI
    │   │   ├── History.jsx        ← Decision history
    │   │   ├── AnalyticsPage.jsx  ← Charts & stats
    │   │   └── Settings.jsx       ← User settings & profile
    │   ├── components/
    │   │   └── Layout.jsx         ← Shell layout, navigation
    │   ├── context/
    │   │   └── authStore.js       ← Zustand auth store
    │   ├── utils/
    │   │   ├── api.js             ← Axios instance with interceptors
    │   │   └── theme.js           ← Category & theme configuration
    │   ├── App.jsx                ← Router & route guards
    │   ├── main.jsx               ← React entry
    │   └── index.css              ← Tailwind + custom styles
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Work breakdown structure (WBS)

- **1. Project setup**
  - 1.1 Initialize Git repository and directory layout.
  - 1.2 Configure Node.js, `package.json`, and shared tooling.
  - 1.3 Set up MongoDB Atlas or local MongoDB.

- **2. Backend API**
  - 2.1 Express app and base middleware (JSON parsing, CORS, Helmet).
  - 2.2 MongoDB connection and models:
    - 2.2.1 `User`
    - 2.2.2 `Decision`
    - 2.2.3 `Preference`
    - 2.2.4 `Analytics`
    - 2.2.5 `GroupVote`
  - 2.3 Auth routes (`/api/auth`) and JWT middleware.
  - 2.4 Decision routes (`/api/decisions`) with AI integration.
  - 2.5 Preferences routes (`/api/preferences`).
  - 2.6 Analytics routes (`/api/analytics`).
  - 2.7 Group routes (`/api/groups`).
  - 2.8 Rate limiting and health check.

- **3. AI integration**
  - 3.1 Configure OpenAI‑compatible SDK (`openai` client with `LLM_API_BASE_URL`).
  - 3.2 Design system prompt with profile + patterns.
  - 3.3 Design user message for decision context.
  - 3.4 Implement `makeAIDecision` for JSON responses.
  - 3.5 Implement `learnFromDecision` for preference learning.

- **4. Frontend application**
  - 4.1 Vite + React bootstrap.
  - 4.2 Global layout, navigation, theme, and auth store.
  - 4.3 Pages (Landing, Auth, Dashboard, New Decision, History, Analytics, Settings).
  - 4.4 API client and error handling.
  - 4.5 Responsiveness, accessibility, and animations.

- **5. Testing & hardening**
  - 5.1 Manual API tests with `curl` / Postman.
  - 5.2 Error boundary handling in React.
  - 5.3 Input validation using `express-validator`.
  - 5.4 Basic security checks (helmet, rate limits).

- **6. Deployment**
  - 6.1 Backend deployment to Render / similar.
  - 6.2 Frontend deployment to Vercel / similar.
  - 6.3 Environment configuration for production (`MONGODB_URI`, `LLM_API_KEY`, etc.).

---

## Milestones and roadmap

- **M1 – Core MVP**
  - Backend auth, decisions, and AI integration.
  - Frontend flows for register, login, and basic decision creation.

- **M2 – History & feedback**
  - Persisted decisions with feedback.
  - History page with filtering.

- **M3 – Analytics & dashboards**
  - Aggregated analytics per user.
  - Charts and insights (e.g. categories, confidence distribution).

- **M4 – Preference learning**
  - Background learning from feedback.
  - Surfacing recent patterns in the system prompt.

- **M5 – Group decisions**
  - GroupVote model and endpoints.
  - Basic group UI for creating shared decisions.

- **M6 – UX polish & deployment**
  - Animations, dark mode, mobile responsiveness.
  - Deployment pipeline and environment hardening.

---

## Installation and local development

### Prerequisites

- **Node.js 18+**
- **MongoDB**:
  - Either MongoDB Atlas (recommended for production‑like environments), or
  - Local MongoDB instance (for offline development).
- **LLM provider key**:
  - API key for an OpenAI‑compatible provider (e.g. OpenRouter).

### 1. Install dependencies

```bash
# From project root
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure backend `.env`

Create `.env` in `backend/` (or copy from `.env.example`) and fill:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority

JWT_SECRET=some-long-random-string
JWT_EXPIRES_IN=7d

LLM_API_KEY=sk-...                # Your LLM provider key (e.g. OpenRouter)
LLM_API_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openai/gpt-4o-mini      # Optional override

CLIENT_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 3. Run backend and frontend

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Database collections and data model

| Collection   | Purpose                                                        |
|-------------|----------------------------------------------------------------|
| `users`     | User accounts, profile, authentication details, stats          |
| `decisions` | Every decision, AI result, options, context, and feedback      |
| `preferences` | Learned patterns, category affinities, recent choices       |
| `analytics` | Aggregated stats per user (counts, categories, time windows)   |
| `groupvotes` | Group decision sessions and voting records                   |

---

## AI prompt engineering details

The AI decision system uses a **3‑layer context architecture**:

1. **System prompt**  
   Injects:
   - User profile (age, fitness goal, restrictions, budgets).
   - Recently learned behavioral patterns.
   - Recent choices to provide recency bias.

2. **User message**  
   Encodes the **current** decision:
   - Category, question/title.
   - List of options.
   - Context: mood, time pressure, priority, time of day, notes, optional weather.

3. **Response format**  
   Enforces JSON‑only responses:

```javascript
// Response format from AI
{
  "chosen": "Salad",
  "reason": "Given your weight loss goal and it being evening...",
  "confidence": 88,
  "alternatives": [
    { "option": "Pizza", "note": "High calorie, not aligned with your goal" }
  ],
  "tags": ["healthy", "light", "evening-friendly"]
}
```

- **Default model**: `openai/gpt-4o-mini` or compatible fast model.
- **Temperature**: `0.4` (slightly creative but still consistent).

---

## API reference

### Auth

| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | `/api/auth/register` | Create account     |
| POST   | `/api/auth/login`    | Login              |
| GET    | `/api/auth/me`       | Get current user   |
| PUT    | `/api/auth/profile`  | Update profile     |

### Decisions

| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| POST   | `/api/decisions`               | Create decision + AI decide     |
| GET    | `/api/decisions`               | Get history                     |
| GET    | `/api/decisions/:id`           | Get a single decision           |
| PUT    | `/api/decisions/:id/feedback`  | Submit feedback for a decision  |
| DELETE | `/api/decisions/:id`           | Soft delete a decision          |

### Analytics

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | `/api/analytics` | Get user analytics   |

### Preferences

| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| GET    | `/api/preferences`  | Get preferences    |
| PUT    | `/api/preferences`  | Update preferences |

### Groups (high‑level)

| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| POST   | `/api/groups`        | Create group decision   |
| GET    | `/api/groups`        | List group sessions     |
| POST   | `/api/groups/:id/vote` | Submit a vote         |

---

## Testing and validation

- **Manual API testing (curl)**:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@test.com","password":"123456"}'

# Make a decision (replace TOKEN)
curl -X POST http://localhost:5000/api/decisions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title": "What should I eat?",
    "category": "food",
    "options": [{"text":"Pizza"},{"text":"Salad"},{"text":"Burger"}],
    "context": {"mood":"tired","priority":"health"}
  }'
```

- **Health check**:

```bash
curl http://localhost:5000/health
```

---

## Deployment guide

### Backend → Render (or similar)

- Push code to GitHub.
- Create a new Web Service on Render.
- Configure:
  - Build command: `cd backend && npm install`
  - Start command: `cd backend && node server.js`
  - Environment: Node.
- Add environment variables from your local `.env`.
- Deploy and verify `/health`.

### Frontend → Vercel (or similar)

- Import repo into Vercel.
- Configure:
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Output directory: `dist`
- Add environment variable:
  - `VITE_API_URL` = URL of your deployed backend.
- Deploy and verify pages load correctly.

### Database → MongoDB Atlas

- Create free Atlas cluster.
- Add database user with `readWrite` role.
- Add IP access rule (`0.0.0.0/0` or specific IPs).
- Copy connection string and set `MONGODB_URI`.

---

## Limitations and future improvements

- **Current limitations**
  - Uses localStorage for JWT (fine for demos, but not ideal for production security).
  - No built‑in offline mode.
  - Limited category‑specific logic (all categories use the same prompt structure).

- **Potential enhancements**
  - Per‑category prompt templates and AI strategies.
  - Integration with calendar, task managers, and email.
  - Push notifications / reminders for scheduled decisions.
  - Fine‑grained analytics and export.
  - Native mobile app or PWA enhancements.

---
