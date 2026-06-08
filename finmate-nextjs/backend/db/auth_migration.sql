-- Migration: Add Authentication and RLS
-- Run this in Supabase SQL Editor

-- 1. Portfolios: Add user_id and RLS
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolios" ON portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios" ON portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Portfolio Items: Indirect RLS via Portfolio
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio items" ON portfolio_items
    FOR SELECT USING (
        portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own portfolio items" ON portfolio_items
    FOR INSERT WITH CHECK (
        portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete own portfolio items" ON portfolio_items
    FOR DELETE USING (
        portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
    );

-- 3. Conversations: Add user_id and RLS
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Messages: Indirect RLS via Conversation
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (
        conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
    );

-- 5. Public Tables (News, Profiles)
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read news" ON news_articles;
CREATE POLICY "Public read news" ON news_articles FOR SELECT USING (true); -- Public read (Anon + Auth)

DROP POLICY IF EXISTS "Service role manages news" ON news_articles;
CREATE POLICY "Service role manages news" ON news_articles FOR ALL TO service_role USING (true);

ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON company_profiles;
CREATE POLICY "Public read profiles" ON company_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages profiles" ON company_profiles;
CREATE POLICY "Service role manages profiles" ON company_profiles FOR ALL TO service_role USING (true);

-- Fix: Ensure existing rows have a user_id if any (might fail if distinct users exist, defaulting to current user running query if they are logged in, else NULL).
-- For now, we assume this is a fresh start or single user dev env.
