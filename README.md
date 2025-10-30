# Macro Journal - Daily Meal Tracker PWA

A Progressive Web App for tracking daily meals and macronutrients with AI-powered meal parsing using OpenAI's GPT-4o-mini.

## Features

- **AI-Powered Meal Parsing**: Simply describe your meal in natural language (e.g., "2 eggs and 1 roti"), and the app automatically calculates calories, protein, carbs, and fat
- **Daily Tracking**: Log multiple meals per day and see real-time summaries
- **Goal Setting**: Set personalized daily macro goals and track progress
- **History View**: Browse past days and weeks of meal logs
- **User Authentication**: Secure user accounts with email/password via Supabase
- **Offline Support**: Install as a PWA and access your data offline
- **Dark Mode**: Automatic dark mode support based on system preferences
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini API
- **PWA**: next-pwa
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Vercel account (for deployment)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/macro-journal.git
cd macro-journal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
```

### 4. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the scripts in order:
   - `supabase/schema.sql` - Creates tables and functions
   - `supabase/rls-policies.sql` - Sets up Row Level Security

See `supabase/README.md` for detailed instructions.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
macro-journal/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── parse/           # OpenAI meal parsing
│   │   ├── entries/         # CRUD for meal entries
│   │   └── profile/         # User profile management
│   ├── dashboard/           # Main dashboard page
│   ├── history/             # Historical entries view
│   ├── profile/             # User settings page
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── meal-input.tsx       # Meal input form
│   ├── entry-card.tsx       # Meal entry display
│   ├── daily-summary.tsx    # Macro summary widget
│   └── theme-provider.tsx   # Dark mode provider
├── lib/                     # Utilities and helpers
│   ├── supabase/           # Supabase client configs
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Middleware utilities
│   └── types/              # TypeScript types
│       └── database.ts     # Database types
├── supabase/               # Database schemas and docs
│   ├── schema.sql          # Table definitions
│   ├── rls-policies.sql    # Security policies
│   └── README.md           # Setup instructions
├── public/                 # Static assets
│   └── manifest.json       # PWA manifest
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── middleware.ts           # Next.js middleware
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

## Key Features Explained

### AI Meal Parsing

The app uses OpenAI's GPT-4o-mini to parse natural language meal descriptions:

```typescript
// Input
"Breakfast: 2 eggs, 1 roti, 1 tsp ghee"

// Output
{
  "calories": 420,
  "protein": 27,
  "carbs": 30,
  "fat": 18,
  "items": [
    { "name": "eggs", "calories": 140, ... },
    { "name": "roti", "calories": 100, ... },
    { "name": "ghee", "calories": 180, ... }
  ]
}
```

### Database Schema

The app uses three main tables:

1. **profiles** - User preferences and daily goals
2. **entries** - Meal logs with parsed nutrition data
3. **daily_notes** - Optional daily notes (mood, weight, etc.)

All tables have Row Level Security enabled to ensure data privacy.

### PWA Features

- Installable on mobile and desktop
- Offline page caching
- Service worker for background sync (future enhancement)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/macro-journal)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

## Security

- All API routes validate user authentication
- Supabase Row Level Security prevents unauthorized data access
- Environment variables keep sensitive keys secure
- HTTPS enforced in production (via Vercel)

## Future Enhancements

- [ ] Voice-based meal logging using Web Speech API
- [ ] Weekly AI-generated insights and summaries
- [ ] Weight tracking with progress charts
- [ ] CSV data export
- [ ] Barcode scanning for packaged foods
- [ ] Social features (share recipes, meal plans)
- [ ] Meal suggestions based on remaining macros

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- Database and Auth by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review Supabase setup in `supabase/README.md`

---

**Author**: Ravi Singh
**Last Updated**: 2025-10-30
