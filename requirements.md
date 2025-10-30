# 🧾 Project: Macro Journal (PWA)

## Overview

**Macro Journal** is a Progressive Web App (PWA) for daily meal logging and macro tracking.  
Users can log their meals in natural language (e.g. “Breakfast: 2 eggs and 1 roti”), and the app uses the **OpenAI API** to parse and estimate nutrition data (calories, protein, carbs, fat).  
All entries are stored securely in **Supabase** with user-level isolation.  
The app should support multiple users with sign-up/login functionality.

---

## 🧱 Tech Stack

| Component | Technology |
|------------|-------------|
| Frontend + Backend | **Next.js 15 (App Router)** |
| Database | **Supabase (PostgreSQL + Auth)** |
| AI API | **OpenAI GPT-4o-mini (via API)** |
| Hosting | **Vercel** |
| Styling | **Tailwind CSS** |
| PWA Support | **next-pwa plugin** |

---

## ⚙️ Core Functional Requirements

### 1. User Authentication
- Use Supabase Auth (email/password).
- After login, users can only view and manage their own entries.
- Basic profile information stored in Supabase (`users` table auto-managed).

---

### 2. Meal Logging (Main Feature)
- Users can write free-form text describing their meals.
- Example input: `"Lunch: 1 bowl dal, 2 rotis, 1 tsp ghee"`.
- The system should:
  1. Send this text to the **OpenAI API** via `/api/parse` route.
  2. Receive structured JSON data with estimated:
     - calories
     - protein (g)
     - carbs (g)
     - fat (g)
     - items (list of food names with their macros)
  3. Store the result in Supabase (`entries` table).

---

### 3. Entry Management
- Each entry belongs to a user.
- Each entry has:
  ```ts
  {
    id: number,
    user_id: string,
    date: date,
    raw_text: string,
    parsed_data: jsonb,
    created_at: timestamp
  }
  ```
- Entries are grouped by `date`.
- Users can:
  - View all entries for a given date.
  - Edit or delete an entry.
  - Add optional daily notes (mood, energy, weight).

---

### 4. Daily Summary
- Show daily total macros (sum of entries).
- Show progress visualization:
  - Total calories vs target
  - Protein, carb, fat distribution
- Users can set a daily goal (optional, stored in `profiles` table).

---

### 5. Analytics (Phase 2)
- Weekly and monthly charts for:
  - Calorie intake trends
  - Protein and carb averages
- Graphs should use a lightweight charting library (e.g. Recharts or Chart.js).

---

### 6. PWA Features
- Installable on mobile and desktop.
- Offline entry creation (store in IndexedDB until sync).
- Cache static assets for offline viewing.

---

## 🧠 AI Parsing (OpenAI Integration)

### Endpoint
`/api/parse` (Next.js API Route)

### Logic
- Accepts JSON input:
  ```json
  { "text": "Lunch: 2 eggs and 1 roti" }
  ```
- Sends a prompt to GPT-4o-mini with instruction:
  > Parse the meal log into total calories, protein, carbs, and fat.  
  > Respond in **valid JSON** with keys: calories, protein, carbs, fat, items (array of food items with macros).

- Example Response:
  ```json
  {
    "calories": 420,
    "protein": 27,
    "carbs": 30,
    "fat": 18,
    "items": [
      { "name": "boiled eggs", "calories": 140, "protein": 12, "carbs": 0, "fat": 10 },
      { "name": "roti", "calories": 100, "protein": 3, "carbs": 18, "fat": 2 },
      { "name": "curd", "calories": 180, "protein": 12, "carbs": 12, "fat": 6 }
    ]
  }
  ```

### Error Handling
- If GPT returns invalid JSON, clean and reparse.
- Show a user-friendly error if the analysis fails.

---

## 💾 Database Schema (Supabase)

### `users` (Supabase-managed)
- `id` (uuid)
- `email`
- `created_at`
- `updated_at`

### `profiles`
- `id` (uuid, references users.id)
- `name`
- `daily_goal_calories` (int, optional)
- `daily_goal_protein` (int, optional)
- `created_at`

### `entries`
- `id` bigint primary key
- `user_id` uuid references users.id
- `date` date
- `raw_text` text
- `parsed_data` jsonb
- `created_at` timestamp default now()

### `notes`
- `id` bigint primary key
- `entry_id` bigint references entries.id
- `mood` text
- `energy` text
- `weight` numeric
- `note_text` text
- `created_at` timestamp default now()

---

## 🧩 API Routes (Next.js /api)

| Route | Method | Description |
|-------|---------|-------------|
| `/api/parse` | POST | Parse a meal log via OpenAI |
| `/api/entries` | GET/POST | CRUD for meal entries |
| `/api/profile` | GET/PUT | Retrieve or update user preferences |

---

## 🧑‍💻 UI Requirements

- **Login / Signup** page (Supabase Auth UI)
- **Dashboard** page showing:
  - Today’s total calories/macros
  - Input box for new meal log
  - List of today’s entries
- **History** page:
  - Calendar or list of past days
  - Click to view that day’s logs
- **Profile** page:
  - Set target calories/macros
  - View weekly summaries
- **Responsive design** (mobile-first)
- **Dark mode** (optional but preferred)

---

## 🔒 Security
- Supabase Row Level Security (RLS) enabled:
  - Users can only access rows where `user_id = auth.uid()`.
- All API routes must validate Supabase session tokens.
- No anonymous data logging.

---

## 🚀 Deployment Plan
- Deploy frontend + API via **Vercel**
- Connect **Supabase project** as backend
- Configure environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_API_KEY`
- Enable `next-pwa` for offline installability

---

## 📈 Future Enhancements
- Voice-based logging (`Web Speech API`)
- Weekly AI summaries (“You averaged 1800 kcal/day this week”)
- Weight progress chart
- Export data as CSV
- Smart suggestions (“You’re 20g short on protein today”)

---

## ✅ Acceptance Criteria

1. User can sign up, log in, and stay logged in across sessions.  
2. User can input free-form meal text and see parsed nutrition data.  
3. Data persists in Supabase and shows in daily and weekly summaries.  
4. The app is installable and works offline for text input.  
5. Each user’s data is private and separated.

---

## 🧩 Deliverables
- Fully functional Next.js PWA
- Connected Supabase backend with RLS
- Working OpenAI integration for parsing
- Responsive UI with Tailwind CSS
- Deployment instructions (Vercel + Supabase)

---

## 🕒 Estimated Timeline

| Phase | Tasks | Duration |
|-------|--------|----------|
| Phase 1 | Auth + DB setup + Supabase config | 1 day |
| Phase 2 | Meal log input + OpenAI parsing route | 1 day |
| Phase 3 | Dashboard UI + summaries | 2 days |
| Phase 4 | PWA + deployment | 1 day |
| **Total** | MVP ready | ~5 days |

---

*Author: Ravi Singh*  
*Last Updated: 2025-10-28*
