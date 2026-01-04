-- Create table to cache daily AI recommendations per user
-- Only one record per user per day, AI is called only on first access each day

CREATE TABLE IF NOT EXISTS user_daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendations_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recommendations_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recommendations_date)
);

-- Enable RLS
ALTER TABLE user_daily_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own recommendations
CREATE POLICY "Users can read own recommendations"
  ON user_daily_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service role can insert/update (for Edge Functions)
CREATE POLICY "Service role can manage recommendations"
  ON user_daily_recommendations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for fast lookup by user_id and date
CREATE INDEX idx_user_daily_recommendations_user_date 
  ON user_daily_recommendations(user_id, recommendations_date);

-- Comment
COMMENT ON TABLE user_daily_recommendations IS 'Caches AI-generated study recommendations per user per day to reduce API calls';
