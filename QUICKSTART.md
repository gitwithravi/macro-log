# Quick Start Guide

Get Macro Journal running locally in under 10 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- An OpenAI API key

## Step-by-Step Setup

### 1. Install Dependencies (1 minute)

```bash
npm install
```

### 2. Set Up Supabase (3 minutes)

1. **Create a project**: Go to [supabase.com](https://supabase.com) → New Project
2. **Run SQL scripts**:
   - Open SQL Editor in Supabase dashboard
   - Copy/paste `supabase/schema.sql` → Run
   - Copy/paste `supabase/rls-policies.sql` → Run
3. **Get credentials**:
   - Go to Settings → API
   - Copy "Project URL" and "anon public" key

### 3. Get OpenAI Key (2 minutes)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create new key
4. Copy it immediately

### 4. Configure Environment (1 minute)

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

### 5. Run the App (30 seconds)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Sign Up**: Click "Sign Up" and create an account
2. **Set Goals**: Go to Profile → Set your daily macro goals
3. **Log a Meal**:
   - Go to Dashboard
   - Enter something like: "Lunch: 2 eggs, 1 roti, 1 tsp ghee"
   - Click "Add Meal"
   - Watch the AI parse it!

## Troubleshooting

**Build errors?**
- Make sure Node.js is 18+: `node --version`
- Delete `node_modules` and `.next`, then `npm install` again

**Can't connect to Supabase?**
- Double-check your URL and key in `.env.local`
- Make sure you ran both SQL scripts

**OpenAI errors?**
- Verify your API key is correct
- Check you have billing enabled at platform.openai.com

**TypeScript errors?**
- This is normal during development
- Run `npm run build` to check for real errors

## What's Next?

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) when ready to deploy
- Review the code structure in the README

## Need Help?

- Check Supabase logs in the dashboard
- Use browser DevTools console for frontend errors
- Review API responses in the Network tab

---

**Happy tracking!** 🍳
