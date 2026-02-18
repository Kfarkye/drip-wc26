-- ══════════════════════════════════════
-- TEAMS
-- ══════════════════════════════════════
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,        -- 'USA', 'ESP', 'BRA'
  group_letter CHAR(1) NOT NULL,    -- 'A' through 'L'
  fifa_ranking INT,
  confederation TEXT,               -- 'UEFA', 'CONCACAF', 'CONMEBOL', etc.
  flag_emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- VENUES
-- ══════════════════════════════════════
CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  capacity INT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- MATCHES
-- ══════════════════════════════════════
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_letter CHAR(1) NOT NULL,
  match_number INT,                  -- 1, 2, 3 within group stage
  home_team_code TEXT NOT NULL REFERENCES teams(code),
  away_team_code TEXT NOT NULL REFERENCES teams(code),
  venue_id UUID REFERENCES venues(id),
  kickoff TIMESTAMPTZ NOT NULL,
  stage TEXT DEFAULT 'group',        -- 'group', 'r32', 'r16', 'qf', 'sf', 'final'
  status TEXT DEFAULT 'scheduled',   -- 'scheduled', 'live', 'completed'
  home_score INT,
  away_score INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- ODDS (sportsbook lines)
-- ══════════════════════════════════════
CREATE TABLE odds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  market_type TEXT NOT NULL,         -- 'moneyline', 'spread', 'total', 'futures_group_winner'
  team_code TEXT REFERENCES teams(code),
  source TEXT NOT NULL,              -- 'draftkings', 'fanduel', 'betmgm', 'caesars'
  american_odds INT,                 -- +150, -200, etc.
  implied_probability DECIMAL(5, 4), -- 0.4000 = 40%
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- PREDICTION MARKET PRICES
-- ══════════════════════════════════════
CREATE TABLE prediction_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  market_type TEXT NOT NULL,         -- 'match_winner', 'group_winner', 'advance'
  team_code TEXT REFERENCES teams(code),
  source TEXT NOT NULL,              -- 'kalshi', 'polymarket'
  price_cents INT,                   -- 55 = $0.55 = 55% implied
  implied_probability DECIMAL(5, 4),
  volume_usd DECIMAL(12, 2),
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- EDGES (calculated)
-- ══════════════════════════════════════
CREATE TABLE edges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  team_code TEXT REFERENCES teams(code),
  market_type TEXT NOT NULL,
  sportsbook_implied DECIMAL(5, 4),
  prediction_implied DECIMAL(5, 4),
  edge_pct DECIMAL(5, 2),           -- 5.20 = 5.2% edge
  sportsbook_source TEXT,
  prediction_source TEXT,
  direction TEXT,                    -- 'sportsbook_high' or 'prediction_high'
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read odds" ON odds FOR SELECT USING (true);
CREATE POLICY "Public read predictions" ON prediction_prices FOR SELECT USING (true);
CREATE POLICY "Public read edges" ON edges FOR SELECT USING (true);

-- Service role write access
CREATE POLICY "Service write teams" ON teams FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write venues" ON venues FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write matches" ON matches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write odds" ON odds FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write predictions" ON prediction_prices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write edges" ON edges FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════
CREATE INDEX idx_matches_group ON matches(group_letter);
CREATE INDEX idx_odds_match ON odds(match_id);
CREATE INDEX idx_odds_source ON odds(source);
CREATE INDEX idx_predictions_match ON prediction_prices(match_id);
CREATE INDEX idx_edges_match ON edges(match_id);
CREATE INDEX idx_edges_team ON edges(team_code);
CREATE INDEX idx_teams_group ON teams(group_letter);

-- ══════════════════════════════════════
-- SEED DATA - Group D
-- ══════════════════════════════════════

-- VENUES
INSERT INTO venues (name, city, state, country, capacity, latitude, longitude, timezone) VALUES
  ('SoFi Stadium', 'Inglewood', 'CA', 'US', 70240, 33.9534, -118.3390, 'America/Los_Angeles'),
  ('Q2 Stadium', 'Austin', 'TX', 'US', 20738, 30.3879, -97.7194, 'America/Chicago'),
  ('MetLife Stadium', 'East Rutherford', 'NJ', 'US', 82500, 40.8128, -74.0742, 'America/New_York');

-- TEAMS
INSERT INTO teams (name, code, group_letter, fifa_ranking, confederation, flag_emoji) VALUES
  ('United States', 'USA', 'D', 14, 'CONCACAF', '🇺🇸'),
  ('Chile', 'CHI', 'D', 36, 'CONMEBOL', '🇨🇱'),
  ('Ecuador', 'ECU', 'D', 30, 'CONMEBOL', '🇪🇨'),
  ('Peru', 'PER', 'D', 33, 'CONMEBOL', '🇵🇪');

-- MATCHES
INSERT INTO matches (group_letter, match_number, home_team_code, away_team_code, venue_id, kickoff, stage) VALUES
  ('D', 1, 'USA', 'CHI', (SELECT id FROM venues WHERE name = 'SoFi Stadium'), '2026-06-13T18:00:00-07:00', 'group'),
  ('D', 2, 'ECU', 'PER', (SELECT id FROM venues WHERE name = 'Q2 Stadium'), '2026-06-14T15:00:00-05:00', 'group'),
  ('D', 3, 'USA', 'PER', (SELECT id FROM venues WHERE name = 'MetLife Stadium'), '2026-06-18T18:00:00-04:00', 'group'),
  ('D', 4, 'CHI', 'ECU', (SELECT id FROM venues WHERE name = 'SoFi Stadium'), '2026-06-18T15:00:00-07:00', 'group'),
  ('D', 5, 'USA', 'ECU', (SELECT id FROM venues WHERE name = 'MetLife Stadium'), '2026-06-22T18:00:00-04:00', 'group'),
  ('D', 6, 'CHI', 'PER', (SELECT id FROM venues WHERE name = 'Q2 Stadium'), '2026-06-22T15:00:00-05:00', 'group');

-- SAMPLE ODDS
INSERT INTO odds (match_id, market_type, team_code, source, american_odds, implied_probability) VALUES
  ((SELECT id FROM matches WHERE home_team_code = 'USA' AND away_team_code = 'CHI' AND match_number = 1), 'futures_group_winner', 'USA', 'draftkings', 150, 0.4000);

-- SAMPLE PREDICTION MARKET
INSERT INTO prediction_prices (match_id, market_type, team_code, source, price_cents, implied_probability) VALUES
  ((SELECT id FROM matches WHERE home_team_code = 'USA' AND away_team_code = 'CHI' AND match_number = 1), 'group_winner', 'USA', 'kalshi', 45, 0.4500);
