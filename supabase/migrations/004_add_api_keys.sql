-- Create API keys table for Zapier and other integrations
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    UNIQUE(practice_id, key_name)
);

-- Create index for API key lookups (performance)
CREATE INDEX idx_api_keys_key ON api_keys(api_key) WHERE is_active = true;
CREATE INDEX idx_api_keys_practice ON api_keys(practice_id);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Practices can view their own API keys"
    ON api_keys FOR SELECT
    USING (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Practices can create their own API keys"
    ON api_keys FOR INSERT
    WITH CHECK (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Practices can delete their own API keys"
    ON api_keys FOR DELETE
    USING (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

-- Create webhook events log table (for Zapier polling triggers)
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('appointment.booked', 'call.completed', 'patient.created')),
    event_data JSONB NOT NULL,
    consumed BOOLEAN DEFAULT false NOT NULL
);

-- Index for polling queries
CREATE INDEX idx_webhook_events_practice_type ON webhook_events(practice_id, event_type, created_at DESC);
CREATE INDEX idx_webhook_events_unconsumed ON webhook_events(practice_id, consumed) WHERE consumed = false;

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS policies (only accessible via API)
CREATE POLICY "Service role can access webhook events"
    ON webhook_events FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
    -- Generate a random 32-character API key prefixed with 'nvc_'
    RETURN 'nvc_' || encode(gen_random_bytes(24), 'base64');
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE api_keys IS 'API keys for external integrations (Zapier, custom integrations, etc.)';
COMMENT ON TABLE webhook_events IS 'Event log for webhook-based integrations. Zapier polls this for triggers.';
