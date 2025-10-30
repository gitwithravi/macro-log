-- Row Level Security Policies for Macro Journal
-- These policies ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Entries policies
CREATE POLICY "Users can view their own entries"
    ON entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
    ON entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
    ON entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
    ON entries FOR DELETE
    USING (auth.uid() = user_id);

-- Daily notes policies
CREATE POLICY "Users can view their own daily notes"
    ON daily_notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily notes"
    ON daily_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily notes"
    ON daily_notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily notes"
    ON daily_notes FOR DELETE
    USING (auth.uid() = user_id);
