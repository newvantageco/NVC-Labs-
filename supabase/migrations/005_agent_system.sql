-- Autonomous Agent System Tables

-- Agent issues tracking
CREATE TABLE agent_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Issue classification
    severity TEXT NOT NULL CHECK (severity IN ('P0', 'P1', 'P2', 'P3', 'P4')),
    issue_type TEXT NOT NULL, -- api_error, database_error, performance, frontend_crash, etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,

    -- Impact metrics
    affected_users INTEGER DEFAULT 0,
    error_frequency INTEGER DEFAULT 1,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

    -- Resolution tracking
    status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'diagnosing', 'fixing', 'testing', 'deploying', 'resolved', 'failed', 'ignored')),
    root_cause TEXT,
    fix_strategy TEXT,
    fix_commit_sha TEXT,
    fix_branch_name TEXT,
    deployed_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Context
    context JSONB, -- error context, request params, etc.
    resolution_notes TEXT
);

-- Agent actions audit log
CREATE TABLE agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    issue_id UUID REFERENCES agent_issues(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- detect, diagnose, fix, test, deploy, rollback, notify
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed')),

    details JSONB, -- Action-specific data
    error_message TEXT,

    human_approved BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Agent configuration
CREATE TABLE agent_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Autonomy settings
    autonomy_level INTEGER DEFAULT 1 CHECK (autonomy_level IN (1, 2, 3)), -- 1=monitor, 2=auto-fix-low-risk, 3=full-autonomy
    is_active BOOLEAN DEFAULT true,

    -- Limits
    max_deployments_per_day INTEGER DEFAULT 10,
    max_fixes_per_hour INTEGER DEFAULT 5,

    -- Protected files (agent cannot modify)
    protected_files TEXT[] DEFAULT ARRAY[
        'supabase/migrations/*.sql',
        'src/app/api/billing/**',
        'src/app/api/webhooks/stripe/**',
        '.env*',
        'vercel.json'
    ],

    -- Notifications
    slack_webhook_url TEXT,
    notification_emails TEXT[],

    -- Deployment settings
    require_staging_approval BOOLEAN DEFAULT true,
    staging_monitor_duration_minutes INTEGER DEFAULT 10,
    auto_rollback_enabled BOOLEAN DEFAULT true
);

-- Health checks log
CREATE TABLE health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    check_type TEXT NOT NULL, -- api, database, external_api, performance
    endpoint TEXT,
    status TEXT NOT NULL, -- healthy, degraded, down
    response_time_ms INTEGER,
    error_message TEXT,

    details JSONB
);

-- Create indexes
CREATE INDEX idx_agent_issues_severity_status ON agent_issues(severity, status);
CREATE INDEX idx_agent_issues_created_at ON agent_issues(created_at DESC);
CREATE INDEX idx_agent_issues_status ON agent_issues(status) WHERE status NOT IN ('resolved', 'ignored');
CREATE INDEX idx_agent_actions_issue_id ON agent_actions(issue_id);
CREATE INDEX idx_agent_actions_created_at ON agent_actions(created_at DESC);
CREATE INDEX idx_health_checks_checked_at ON health_checks(checked_at DESC);
CREATE INDEX idx_health_checks_status ON health_checks(status) WHERE status != 'healthy';

-- Enable RLS (only accessible by service role / admin)
ALTER TABLE agent_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies (service role has full access)
CREATE POLICY "Service role has full access to agent tables"
    ON agent_issues FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to agent actions"
    ON agent_actions FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to agent config"
    ON agent_config FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to health checks"
    ON health_checks FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert default agent configuration
INSERT INTO agent_config (autonomy_level, is_active) VALUES (1, true);

-- Create trigger to update updated_at
CREATE TRIGGER update_agent_issues_updated_at BEFORE UPDATE ON agent_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_config_updated_at BEFORE UPDATE ON agent_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE agent_issues IS 'Tracks issues detected by the autonomous agent';
COMMENT ON TABLE agent_actions IS 'Audit log of all agent actions';
COMMENT ON TABLE agent_config IS 'Configuration for autonomous agent behavior';
COMMENT ON TABLE health_checks IS 'Historical health check results';
