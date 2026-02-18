-- ══════════════════════════════════════
-- SCHEMA ENHANCEMENTS (20260217000001)
-- ══════════════════════════════════════

-- 1. ODDS ENHANCEMENTS
-- Add devigged_probability for accurate edge calculation (Hole 6)
-- Add group_letter for futures not tied to a specific match
-- Add selection to support three-way markets (Home/Away/Draw)
ALTER TABLE odds ADD COLUMN devigged_probability DECIMAL(5, 4);
ALTER TABLE odds ADD COLUMN group_letter CHAR(1);
ALTER TABLE odds ADD COLUMN selection TEXT DEFAULT 'team';
ALTER TABLE odds ALTER COLUMN match_id DROP NOT NULL;

-- 2. EDGES ENHANCEMENTS
-- Add liquidity signals for confidence filtering (Hole 4)
ALTER TABLE edges ADD COLUMN prediction_volume_usd DECIMAL(12, 2);
ALTER TABLE edges ADD COLUMN confidence TEXT CHECK (confidence IN ('high', 'medium', 'low'));

-- 3. UPDATED_AT AUTOMATION
-- Auto-update timestamps for data freshness signals
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON matches
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 4. DATA CORRECTION
-- Move the sample futures entry to use group_letter instead of match_id
UPDATE odds 
SET group_letter = 'D', match_id = NULL 
WHERE market_type = 'futures_group_winner';
