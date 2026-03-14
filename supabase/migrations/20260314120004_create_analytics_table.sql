-- Portfolio analytics tracking
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'view', 'chat', 'fit_assessment'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (anonymous tracking)
CREATE POLICY "Anyone can insert analytics" ON portfolio_analytics
  FOR INSERT WITH CHECK (true);

-- Users can only view analytics for their own portfolios
CREATE POLICY "Users can view own analytics" ON portfolio_analytics
  FOR SELECT USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_analytics_portfolio ON portfolio_analytics(portfolio_id, event_type, created_at DESC);
