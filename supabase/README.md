# Supabase Setup Instructions

## Quick Setup

1. Create a new project at [https://supabase.com](https://supabase.com)

2. In the Supabase SQL Editor, run the following files in order:
   - First run: `schema.sql` - Creates tables and functions
   - Then run: `rls-policies.sql` - Sets up Row Level Security

3. Get your project credentials:
   - Go to Project Settings > API
   - Copy the `URL` and `anon` key
   - Add them to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Enable Email Auth:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email templates if needed

## Database Structure

### Tables

#### profiles
- Extends `auth.users` with additional user preferences
- Stores daily macro goals
- Auto-created via trigger when user signs up

#### entries
- Stores all meal logs
- Contains raw text input and parsed nutrition data (JSONB)
- Indexed by user_id and date for fast queries

#### daily_notes
- Optional daily notes for mood, energy, weight
- One note per user per day (UNIQUE constraint)

## Security

All tables have Row Level Security (RLS) enabled. Users can only:
- View their own data
- Create entries for themselves
- Update their own entries
- Delete their own entries

## Testing the Setup

After running the SQL files, you can test in the Supabase SQL Editor:

```sql
-- Check if tables are created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```
