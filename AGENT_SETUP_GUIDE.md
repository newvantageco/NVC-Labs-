# Autonomous Agent - Setup Guide

**Get your self-healing, self-maintaining AI agent operational in 15 minutes.**

---

## 🎯 What The Agent Does

The Autonomous Agent:
- ✅ **Monitors** your app 24/7 (every 5 minutes)
- ✅ **Detects** errors, performance issues, API failures
- ✅ **Diagnoses** root causes using AI
- ✅ **Fixes** code automatically (with safeguards)
- ✅ **Deploys** fixes to production
- ✅ **Notifies** you via Slack/Email
- ✅ **Rolls back** if anything goes wrong

---

## 📋 Prerequisites

- ✅ NVC Labs deployed on Vercel
- ✅ Database migrations applied (up to `005_agent_system.sql`)
- ✅ Anthropic API key (Claude API for AI reasoning)
- ⭐ Optional: Slack webhook for notifications

---

## 🚀 Quick Start (5 Steps)

### **Step 1: Run Database Migration**

```bash
# Apply agent system tables
supabase db push
```

This creates:
- `agent_issues` - Tracks detected problems
- `agent_actions` - Audit log of agent actions
- `agent_config` - Agent settings
- `health_checks` - System health history

---

### **Step 2: Set Environment Variables**

Add these to your Vercel project:

```bash
# Required
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Recommended (for AI-powered diagnosis & fixes)
ANTHROPIC_API_KEY=sk-ant-... # Get from console.anthropic.com

# Optional (for cron security)
CRON_SECRET=generate-random-string-here

# Optional (for Slack notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**How to add in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable
3. Redeploy

---

### **Step 3: Verify Cron Job**

The cron job is configured in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/agent-scan",
    "schedule": "*/5 * * * *"
  }]
}
```

This runs the agent every 5 minutes.

**After deployment, verify:**
1. Go to Vercel Dashboard → Your Project → Cron Jobs
2. You should see `/api/cron/agent-scan` listed
3. Check execution logs

---

### **Step 4: Activate The Agent**

1. Go to `https://your-domain.com/dashboard/agent`
2. You'll see the **Agent Control Panel**
3. Click **"Activate Agent"**
4. Select **Autonomy Level:**
   - **Level 1 (Recommended for first week):** Monitor Only
   - **Level 2 (Recommended for production):** Auto-Fix Low Risk
   - **Level 3 (Advanced):** Full Autonomy

---

### **Step 5: Test The Agent**

**Manual Test:**
```bash
# Trigger agent scan manually
curl -X GET https://your-domain.com/api/cron/agent-scan \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "status": "completed",
  "scan_duration_ms": 1234,
  "issues_detected": 0,
  "issues": [],
  "timestamp": "2026-03-01T10:30:00Z"
}
```

**View Results:**
- Go to `/dashboard/agent`
- Check "Recent Issues" section
- Should show "No issues detected" (if all healthy)

---

## 📊 Agent Dashboard

**URL:** `https://your-domain.com/dashboard/agent`

### **Dashboard Sections:**

1. **Agent Status**
   - Green dot = Active
   - Shows autonomy level
   - Pause/Resume button

2. **Stats**
   - Total issues detected
   - Resolved today
   - Average resolution time

3. **Autonomy Level Control**
   - Switch between Level 1, 2, 3
   - Each level explained

4. **Recent Issues**
   - Live feed of detected problems
   - Severity badges (P0-P4)
   - Status (detected, fixing, resolved)
   - Affected users count

---

## 🤖 How The Agent Works

### **Detection (Every 5 Minutes)**

The agent scans:
1. **Health Endpoint** (`/api/health`)
   - Database connectivity
   - Response times
   - Memory usage

2. **Call Logs**
   - Failed AI calls
   - High failure rates
   - Bland AI availability

3. **Database Performance**
   - Query response times
   - Connection errors

4. **External APIs**
   - Bland AI status
   - Twilio status
   - Stripe status

### **Classification**

Issues are classified by severity:
- **P0 (Critical):** All users affected, immediate fix required
- **P1 (High):** Multiple users affected, fix within 1 hour
- **P2 (Medium):** Few users affected, fix within 24 hours
- **P3 (Low):** Minor issue, fix when convenient
- **P4 (Info):** Informational, no action needed

### **Response (Based on Autonomy Level)**

#### **Level 1: Monitor Only**
- Agent detects → Logs → Notifies
- Human reviews dashboard
- Human approves fix

#### **Level 2: Auto-Fix Low Risk**
- P0/P1: Human approval required
- P2/P3/P4: Agent auto-fixes
- Always deploys to staging first
- Auto-promotes if tests pass

#### **Level 3: Full Autonomy**
- Agent handles everything
- Notifies after deployment
- Human can override anytime

---

## 🛡️ Safety Features

### **Protected Files**

The agent CANNOT modify:
- `supabase/migrations/*.sql`
- `src/app/api/billing/**`
- `src/app/api/webhooks/stripe/**`
- `.env*` files
- `vercel.json`
- `package.json` (without approval)

### **Deployment Safeguards**

1. **Staging First:** Always deploys to staging branch
2. **Test Before Promote:** Runs tests on staging
3. **Monitor Period:** Watches staging for 10 minutes
4. **Auto-Rollback:** Reverts if errors increase
5. **Rate Limits:** Max 10 deployments/day

### **Human Override**

- **Pause Button:** Stops all agent actions immediately
- **Manual Rollback:** Revert any deployment
- **Approval Queue:** Review pending fixes before deployment

---

## 🔔 Notifications

### **Slack Integration (Recommended)**

1. Create Slack incoming webhook:
   - Go to https://api.slack.com/apps
   - Create New App → From Scratch
   - Name: "NVC Labs Agent"
   - Add Incoming Webhooks
   - Copy Webhook URL

2. Add to Vercel:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Update agent config in database:
   ```sql
   UPDATE agent_config
   SET slack_webhook_url = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
   WHERE id = (SELECT id FROM agent_config LIMIT 1);
   ```

**You'll receive:**
- 🚨 P0/P1 issues detected
- ✅ Issues resolved
- 🚀 Deployments completed
- ❌ Rollbacks performed

---

## 📈 Monitoring The Agent

### **Check Agent Health:**

```bash
# Manual scan
curl https://your-domain.com/api/cron/agent-scan \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Check app health
curl https://your-domain.com/api/health
```

### **View Logs:**

**Vercel Logs:**
1. Vercel Dashboard → Your Project → Logs
2. Filter by `/api/cron/agent-scan`
3. See all scans

**Database Logs:**
```sql
-- Recent issues
SELECT * FROM agent_issues
ORDER BY created_at DESC
LIMIT 10;

-- Recent agent actions
SELECT * FROM agent_actions
ORDER BY created_at DESC
LIMIT 20;

-- Health check history
SELECT * FROM health_checks
WHERE check_type = 'agent_scan'
ORDER BY checked_at DESC
LIMIT 10;
```

---

## 🔧 Troubleshooting

### **Agent Not Running**

**Check:**
1. Is agent active? Go to `/dashboard/agent`
2. Is cron job configured? Check `vercel.json`
3. Are env vars set? Check Vercel settings
4. Check Vercel logs for errors

**Fix:**
```bash
# Redeploy to apply vercel.json
vercel --prod
```

---

### **No Issues Detected (But There Are Problems)**

**Possible Causes:**
1. Detection logic too conservative
2. Health check endpoint not working
3. Database connection issue

**Fix:**
- Test health endpoint: `curl https://your-domain.com/api/health`
- Check database logs
- Lower detection thresholds if needed

---

### **Agent Detected Issue But Didn't Fix**

**Check Autonomy Level:**
- Level 1: Requires manual approval
- Level 2: Only auto-fixes P2-P4
- Level 3: Auto-fixes everything

**Check Issue Severity:**
- P0/P1 on Level 2 requires approval
- Check dashboard for pending approvals

---

### **False Positives**

**Too many non-issues detected:**

1. Adjust detection thresholds in `src/lib/agent/detector.ts`
2. Mark issues as "ignored" in database
3. Increase minimum frequency thresholds

---

## 🎓 Best Practices

### **Week 1: Learn Mode**
- Set to Level 1 (Monitor Only)
- Observe what agent detects
- Review false positives
- Adjust detection thresholds

### **Week 2-4: Semi-Autonomous**
- Upgrade to Level 2 (Auto-Fix Low Risk)
- Agent handles P2-P4 automatically
- You approve P0-P1 fixes
- Monitor for false positives

### **Month 2+: Full Autonomy**
- Upgrade to Level 3 (if confident)
- Agent handles everything
- You receive notifications
- Weekly review of actions

---

## 💰 Cost Breakdown

**Monthly Costs:**
- **Claude API:** $50-100 (depends on error volume)
  - Detection: ~$5/month (cheap Haiku model)
  - Diagnosis: ~$20-40/month (Sonnet for reasoning)
  - Code fixes: ~$20-40/month (Sonnet for generation)
  - Testing: ~$5/month (Haiku for validation)

- **Vercel Cron:** Free (included in plan)
- **Database storage:** ~$2/month (agent tables)

**Total:** ~$52-102/month

**ROI:** Saves 10-20 hours/month of manual debugging = $500-2000 value

---

## 📊 Success Metrics (After 30 Days)

**Target Goals:**
- ✅ 80%+ of P2-P4 issues fixed automatically
- ✅ <5 minute median time to fix
- ✅ Zero failed auto-deployments
- ✅ 95%+ fix success rate
- ✅ <1% false positive rate

---

## 🚀 Advanced Features (Future)

Coming soon:
- **Performance Optimization Agent:** Auto-optimizes slow queries
- **Security Scanning Agent:** Detects vulnerabilities
- **Cost Optimization Agent:** Reduces API usage
- **User Experience Agent:** Monitors user flows
- **Predictive Maintenance:** Prevents issues before they occur

---

## 📞 Support

**Agent not working as expected?**

1. Check `/dashboard/agent` for status
2. Review Vercel cron logs
3. Test health endpoint manually
4. Check database for logged issues

**Still stuck?**
- Email: support@nvclabs.com
- Include: Agent logs, error messages, dashboard screenshots

---

**Last Updated:** March 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
