# NVC Labs - Autonomous Agent Architecture

**Self-Healing, Self-Maintaining AI Agent System**

---

## 🎯 Vision

An AI agent that autonomously monitors, troubleshoots, fixes, and deploys updates to NVC Labs without human intervention - but with safeguards and human override capabilities.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NVC Labs Web Application                     │
│  (Frontend + Backend + Database + External APIs)                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Logs, Metrics, Errors
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Monitoring & Observability Layer               │
│  • Error Tracking (Sentry)                                       │
│  • Application Logs (Vercel)                                     │
│  • Database Logs (Supabase)                                      │
│  • Health Checks (Custom endpoints)                              │
│  • Performance Metrics                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Events, Alerts, Anomalies
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Intelligence Layer                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Detection Agent (Watcher)                                  │ │
│  │  • Monitors logs every 5 minutes                           │ │
│  │  • Detects errors, performance degradation                 │ │
│  │  • Classifies issue severity (P0-P4)                       │ │
│  │  • Triggers appropriate response agent                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Diagnosis Agent (Investigator)                            │ │
│  │  • Reads error logs and stack traces                       │ │
│  │  • Searches codebase for related code                      │ │
│  │  • Identifies root cause using Claude API                  │ │
│  │  • Proposes fix strategy                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Fix Agent (Implementer)                                   │ │
│  │  • Generates code fix using Claude API                     │ │
│  │  • Writes fix to file system                               │ │
│  │  • Runs tests to verify fix                                │ │
│  │  • Creates git commit with detailed message                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Deployment Agent (Releaser)                               │ │
│  │  • Pushes to staging branch                                │ │
│  │  • Monitors staging for 10 minutes                         │ │
│  │  • Auto-promotes to production if healthy                  │ │
│  │  • Rolls back if errors detected                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Actions, Deployments, Notifications
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Integration Layer                           │
│  • GitHub API (commits, PRs, deployments)                        │
│  • Vercel API (deployments, logs)                                │
│  • Supabase API (database queries)                               │
│  • Slack/Email (notifications)                                   │
│  • Claude API (AI reasoning and code generation)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Components

### **1. Detection Agent (Watcher)**

**Purpose:** Continuously monitors for issues

**Capabilities:**
- Polls error logs every 5 minutes
- Detects API errors, database errors, frontend crashes
- Monitors performance metrics (slow queries, high latency)
- Identifies anomalies (sudden traffic spikes, unusual patterns)
- Classifies severity: P0 (critical), P1 (high), P2 (medium), P3 (low), P4 (info)

**Triggers:**
- P0/P1: Immediate fix + deploy
- P2: Fix within 1 hour
- P3: Fix within 24 hours
- P4: Log for weekly review

**Output:**
```json
{
  "issue_id": "uuid",
  "severity": "P1",
  "type": "api_error",
  "message": "POST /api/campaigns/launch returning 500",
  "frequency": "15 times in last 5 minutes",
  "affected_users": 3,
  "first_seen": "2026-03-01T10:30:00Z",
  "stack_trace": "...",
  "context": {...}
}
```

---

### **2. Diagnosis Agent (Investigator)**

**Purpose:** Understands the root cause

**Capabilities:**
- Reads full error context (logs, stack trace, request params)
- Searches codebase for relevant files
- Identifies which function/line caused the error
- Checks recent commits (was this introduced recently?)
- Uses Claude API to reason about the issue
- Proposes fix strategy

**Example Workflow:**
```
Error: "TypeError: Cannot read property 'id' of undefined"
Location: src/app/api/campaigns/launch/route.ts:42

Agent thinks:
1. Read route.ts file
2. Line 42: `const practiceId = practice.id`
3. `practice` is undefined - why?
4. Check line above: `const { data: practice } = await supabase...`
5. Likely: database query returned null
6. Root cause: Missing error handling for "practice not found"
7. Proposed fix: Add null check before accessing practice.id
```

**Output:**
```json
{
  "issue_id": "uuid",
  "root_cause": "Missing null check on database query result",
  "affected_file": "src/app/api/campaigns/launch/route.ts",
  "affected_lines": [40-45],
  "fix_strategy": "Add null check and return 404 if practice not found",
  "confidence": 0.95,
  "estimated_fix_time": "2 minutes"
}
```

---

### **3. Fix Agent (Implementer)**

**Purpose:** Writes and tests the fix

**Capabilities:**
- Reads affected file
- Uses Claude API to generate fix code
- Applies fix to file
- Runs relevant tests
- Creates git commit with descriptive message
- Can rollback if tests fail

**Safety Checks:**
1. **Never touches certain files** (database migrations, auth, billing)
2. **Requires tests to pass** before commit
3. **Creates feature branch** (not main)
4. **Human approval required for P0 issues** affecting >100 users

**Example Fix:**

**Before:**
```typescript
const { data: practice } = await supabase
  .from('practices')
  .select('id')
  .eq('user_id', user.id)
  .single()

const practiceId = practice.id // ERROR: practice might be null
```

**After:**
```typescript
const { data: practice, error } = await supabase
  .from('practices')
  .select('id')
  .eq('user_id', user.id)
  .single()

if (error || !practice) {
  return NextResponse.json(
    { error: 'Practice not found' },
    { status: 404 }
  )
}

const practiceId = practice.id // SAFE: null check added
```

**Git Commit:**
```
Fix: Add null check for practice query in campaign launch

Issue: POST /api/campaigns/launch was returning 500 error
Root Cause: Missing null check on database query result
Affected: 3 users, 15 requests in 5 minutes
Severity: P1
Fix: Added error handling for missing practice record

Changes:
- Added null check after supabase query
- Return 404 if practice not found
- Tests passing: ✅

Auto-fixed by Autonomous Agent
Issue ID: abc-123
```

---

### **4. Deployment Agent (Releaser)**

**Purpose:** Safely deploys fixes to production

**Capabilities:**
- Pushes to `staging` branch first
- Triggers Vercel staging deployment
- Runs smoke tests on staging
- Monitors staging for 10 minutes
- Auto-promotes to `main` if healthy
- Rolls back if errors increase

**Deployment Flow:**
```
1. Agent fixes code locally
2. Run tests → Pass ✅
3. Commit to feature branch: `agent/fix-abc-123`
4. Push to GitHub
5. Create PR: `agent/fix-abc-123` → `staging`
6. Auto-merge (agent has admin rights)
7. Vercel deploys to staging.nvclabs.com
8. Agent monitors staging for 10 minutes:
   - No errors? ✅
   - Same error count? ✅
   - New errors? ❌ Rollback
9. If healthy: Create PR `staging` → `main`
10. Auto-merge → Production deployment
11. Monitor production for 30 minutes
12. Send Slack notification: "Agent deployed fix for issue abc-123"
```

**Rollback Triggers:**
- Error rate increases >20%
- New errors appear
- Health checks fail
- Response time >2x normal

---

## 🛡️ Safety & Controls

### **Autonomous Mode Levels:**

#### **Level 1: Monitor Only (Default for new deployments)**
- Agent detects issues
- Agent diagnoses problems
- Agent proposes fixes
- **Human approves before deployment**
- Sends Slack notification with proposed fix

#### **Level 2: Auto-Fix Low Risk (Recommended for production)**
- Autonomous for: P2-P4 issues, <10 affected users
- Human approval for: P0-P1 issues, >10 affected users
- Auto-deploys to staging always
- Auto-promotes to production if low risk

#### **Level 3: Full Autonomy (Advanced)**
- Agent handles everything autonomously
- Notifies humans after deployment
- Humans can override/rollback anytime
- Requires 30 days of successful Level 2 operation

### **Human Override:**
- Dashboard shows all agent actions in real-time
- "Pause Agent" button stops all autonomous actions
- Manual rollback button
- Approve/reject pending fixes

### **Protected Files (Agent Cannot Touch):**
```
- supabase/migrations/*.sql
- src/app/api/billing/**
- src/app/api/webhooks/stripe/**
- .env*
- vercel.json
- package.json (without approval)
```

### **Limits:**
- Max 10 deployments per day (prevents runaway fixing)
- Max 3 rollbacks per issue (if fix doesn't work 3 times, human required)
- No deployments outside business hours (9am-6pm UK) for P2-P4

---

## 📊 Agent Dashboard

**Location:** `/dashboard/agent-control`

**Features:**
1. **Real-time Activity Feed**
   - Issues detected in last 24 hours
   - Fixes in progress
   - Recent deployments

2. **Agent Status**
   - Current mode (Monitor / Auto-Fix / Full Autonomy)
   - Health (Healthy / Degraded / Offline)
   - Last action timestamp

3. **Controls**
   - Pause/Resume agent
   - Change autonomy level
   - Manual trigger scan
   - Review pending fixes

4. **Metrics**
   - Issues detected this week
   - Issues fixed automatically
   - Average time to fix
   - Success rate
   - Rollback count

5. **Logs**
   - Full audit trail of agent actions
   - Decision reasoning
   - Code changes made
   - Test results

---

## 🔧 Technical Implementation

### **Stack:**
- **Agent Runtime:** Vercel Cron Job (runs every 5 minutes)
- **AI:** Claude API (Sonnet 4.5 for reasoning, Haiku for fast checks)
- **Storage:** Supabase (agent_logs, agent_issues tables)
- **Notifications:** Slack API, Email (SendGrid)
- **Version Control:** GitHub API (commits, PRs, deployments)
- **Deployment:** Vercel API (trigger deploys, get logs)

### **Database Schema:**

```sql
-- Agent issues log
CREATE TABLE agent_issues (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    severity TEXT, -- P0, P1, P2, P3, P4
    type TEXT, -- api_error, database_error, performance, etc.
    message TEXT,
    stack_trace TEXT,
    affected_users INTEGER,
    frequency INTEGER,
    status TEXT, -- detected, diagnosing, fixing, fixed, failed
    root_cause TEXT,
    fix_strategy TEXT,
    fix_commit_sha TEXT,
    deployed_at TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Agent actions audit log
CREATE TABLE agent_actions (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    issue_id UUID REFERENCES agent_issues(id),
    action_type TEXT, -- detect, diagnose, fix, deploy, rollback
    status TEXT, -- started, completed, failed
    details JSONB,
    human_approved BOOLEAN DEFAULT false
);

-- Agent configuration
CREATE TABLE agent_config (
    id UUID PRIMARY KEY,
    autonomy_level INTEGER, -- 1, 2, 3
    is_active BOOLEAN DEFAULT true,
    max_deployments_per_day INTEGER DEFAULT 10,
    protected_files TEXT[],
    updated_at TIMESTAMP
);
```

---

## 🚀 Deployment Plan

### **Phase 1: Foundation (Week 1)**
✅ Set up monitoring infrastructure
✅ Health check endpoints
✅ Error aggregation
✅ Detection agent (monitor only)
✅ Agent dashboard (read-only)

### **Phase 2: Semi-Autonomous (Week 2)**
✅ Diagnosis agent with Claude API
✅ Fix agent (creates PRs, requires approval)
✅ Human-in-loop workflow
✅ Slack notifications

### **Phase 3: Auto-Deployment (Week 3)**
✅ Deployment agent with staging
✅ Automated testing
✅ Auto-promotion with safeguards
✅ Rollback mechanism

### **Phase 4: Full Autonomy (Week 4)**
✅ Level 2 autonomy (auto-fix low risk)
✅ Advanced anomaly detection
✅ Performance optimization agent
✅ Self-healing database queries

---

## 📈 Success Metrics

**After 30 days:**
- 80%+ of P2-P4 issues fixed automatically
- <5 minute median time to fix
- Zero failed auto-deployments
- 95%+ fix success rate
- <1% false positive detection rate

---

## 🎓 Agent Learning

The agent improves over time:

1. **Learn from failures:** If a fix doesn't work, analyze why
2. **Pattern recognition:** Similar errors get fixed faster
3. **Code style learning:** Matches your coding patterns
4. **User feedback:** Humans can rate fix quality
5. **Performance optimization:** Learns which fixes are fastest

---

## 🔐 Security Considerations

1. **Agent credentials stored in Vercel env vars** (encrypted)
2. **Agent commits signed** with GPG key
3. **Rate limiting** on all external APIs
4. **Audit log** of every action (immutable)
5. **Emergency kill switch** via Vercel dashboard
6. **No access to production database** (read-only for diagnostics)

---

## 💰 Cost Estimate

**Monthly operating cost:**
- Claude API: ~$50-100 (depends on error volume)
- Vercel Cron: Free (included in plan)
- GitHub API: Free
- Slack API: Free
- Supabase storage: ~$5

**Total: ~$55-105/month**

**ROI:**
- Saves 10-20 hours/month of manual debugging
- Faster issue resolution (minutes vs hours)
- Reduced downtime
- Better customer experience

---

## 🎯 Next Steps

1. **Approve architecture** ✅
2. **Build Phase 1** (monitoring foundation)
3. **Deploy in Level 1 mode** (monitor only)
4. **Observe for 1 week**
5. **Gradually increase autonomy**
6. **Full autonomy after 30 days of successful operation**

---

**Last Updated:** March 2026
**Status:** Architecture Complete → Ready for Implementation
