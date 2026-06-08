-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Portfolios Table
create table public.portfolios (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'My Portfolio',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Portfolio Items Table (Links Tickers to Portfolio)
create table public.portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  ticker text not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(portfolio_id, ticker)
);

-- 3. Company Profiles Table (Cached Metadata)
create table public.company_profiles (
  ticker text primary key,
  name text,
  sector text,
  industry text,
  summary text,
  website text,
  currency text,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. News Articles Table (Persistent News)
create table public.news_articles (
  id uuid default uuid_generate_v4() primary key,
  url text unique not null,
  headline text not null,
  summary text,
  source text,
  published_at timestamp with time zone,
  sentiment_score int, -- 0 to 100
  risk_level text, -- 'low', 'medium', 'high'
  impact_level text, -- 'positive', 'neutral', 'negative'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. News-Ticker Associations (Many-to-Many)
create table public.news_ticker_associations (
  news_id uuid references public.news_articles(id) on delete cascade,
  ticker text not null, -- Intentionally text to match profile PK
  primary key (news_id, ticker)
);

-- 6. Chat Conversations
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  title text default 'New Chat',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Chat Messages
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_portfolio_items_ticker on public.portfolio_items(ticker);
create index idx_news_published on public.news_articles(published_at);
create index idx_messages_conv_id on public.messages(conversation_id);
