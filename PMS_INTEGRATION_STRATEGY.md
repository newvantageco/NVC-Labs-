# NVC Labs - PMS Integration Strategy

**The Problem:** Opticians use Practice Management Software (PMS) to manage patients. NVC Labs needs patient data from PMS to make calls, and needs to send appointment bookings back to PMS.

---

## 🎯 Integration Goals

### What We Need From PMS:
1. **Patient data** (name, phone, email, last exam date, clinical risk level)
2. **Appointment slots** (available times for booking)
3. **Practice settings** (opening hours, phone numbers, practitioner names)

### What We Send Back to PMS:
1. **Appointment bookings** (patient booked via AI call)
2. **Call outcomes** (answered, voicemail, declined, wrong number)
3. **Patient contact updates** (updated phone numbers, opt-outs)

---

## 🇬🇧 UK Optical PMS Landscape

### Top PMS Systems (Market Share):
1. **Optix** (~30%) - Modern cloud-based, REST API available
2. **Acuitas** (~25%) - Traditional desktop software, limited API
3. **OptiSoft** (~15%) - Desktop software, CSV export only
4. **4Sight** (~10%) - Mixed cloud/desktop
5. **Vision Experts** (~8%) - Desktop software
6. **Others** (~12%) - Various smaller systems

### Key Insight:
**60%+ of UK opticians use desktop-based PMS without public APIs.**

This means **CSV export is the ONLY universal integration method** that works for everyone.

---

## 📊 Integration Options Comparison

| Method | Setup Time | Coverage | Maintenance | Cost | Best For |
|--------|------------|----------|-------------|------|----------|
| **CSV Export** | 10 mins | 100% | Low | £0 | MVP & all practices |
| **Zapier** | 30 mins | ~40% | Medium | £20-50/mo | Early growth |
| **Make.com** | 45 mins | ~35% | Medium | £10-30/mo | Budget-conscious |
| **Native API** | 2-4 weeks | 5-10% per PMS | High | Dev time | Scale phase |
| **Embedded/White-label** | 3-6 months | Single PMS | Very high | Enterprise deal | Late stage |

---

## 🚀 Recommended Phased Approach

### **Phase 1: MVP (Current) - CSV Only**
**Timeline:** Now (Already built)
**Coverage:** 100% of UK opticians

**How it works:**
1. Optician exports lapsed patients as CSV from any PMS
2. Upload CSV to NVC Labs dashboard
3. NVC Labs makes calls and logs outcomes
4. Optician manually books appointments in PMS
5. (Optional) Export call results as CSV to import back

**Pros:**
- ✅ Works with EVERY PMS system
- ✅ No API keys, no integration complexity
- ✅ Opticians already know how to do CSV exports
- ✅ Zero integration maintenance

**Cons:**
- ❌ Manual step (CSV upload)
- ❌ Not real-time
- ❌ Appointments don't auto-book back to PMS

**Why this is enough for MVP:**
- Opticians do CSV exports all the time (for NHS submissions, backups, etc.)
- The value prop is the AI calls, not the data transfer
- You'll learn which PMS systems your customers actually use before building integrations

---

### **Phase 2: Early Growth - Zapier Integration**
**Timeline:** After 10+ paying customers
**Coverage:** ~40% of practices (Optix, Acuitas cloud users)

**What to build:**
1. NVC Labs Zapier app with triggers & actions:
   - **Trigger:** "New appointment booked" (when AI books appointment)
   - **Action:** "Upload patient list" (from PMS to NVC Labs)
   - **Action:** "Update patient record" (with call outcome)

2. Pre-built Zap templates:
   - "Optix → NVC Labs: Auto-import lapsed patients weekly"
   - "NVC Labs → Optix: Auto-book AI appointments"
   - "NVC Labs → Google Sheets: Log all call outcomes"

**How to build:**
1. Create Zapier Developer account
2. Build NVC Labs Zapier integration:
   - Authentication: API key from NVC Labs dashboard
   - Triggers: Webhook when appointment booked
   - Actions: POST to `/api/integrations/patients` endpoint
3. Publish to Zapier marketplace (free)
4. Create 5-10 pre-built Zap templates

**Effort:** 1-2 weeks development time

**Pros:**
- ✅ Automated for practices with modern PMS
- ✅ Low maintenance (Zapier handles auth, rate limits, retries)
- ✅ Works with 2,000+ apps (not just PMS)
- ✅ Practices can customize workflows
- ✅ Marketing value: "Integrates with your existing tools"

**Cons:**
- ❌ Requires Zapier subscription (£20-50/mo per practice)
- ❌ Only works with PMS that have Zapier integrations
- ❌ Some latency (5-15 min delays)
- ❌ Desktop PMS users still can't use it

**When to build:** After you have 10+ customers and can survey which PMS they use

---

### **Phase 3: Scale - Native API Integrations**
**Timeline:** After 50+ customers, 6-12 months post-launch
**Coverage:** 30-40% with top 2-3 PMS (Optix, Acuitas cloud, 4Sight)

**Priority order:**
1. **Optix** (largest market share, best API documentation)
2. **Acuitas Cloud** (growing, modern API)
3. **4Sight Cloud** (if you have 5+ customers using it)

**What to build (per PMS):**

#### Optix Integration (Example):
1. **OAuth 2.0 authentication flow:**
   - Practice clicks "Connect Optix" in NVC Labs dashboard
   - Redirected to Optix for authorization
   - NVC Labs receives access token
   - Store token encrypted in database

2. **Data sync endpoints:**
   ```
   GET /api/integrations/optix/patients
   POST /api/integrations/optix/appointments
   PATCH /api/integrations/optix/patients/:id
   ```

3. **Webhook listeners:**
   - Optix sends webhook when patient data changes
   - NVC Labs updates internal records

4. **Bi-directional sync:**
   - Every 15 minutes: Pull lapsed patients from Optix
   - Real-time: Push booked appointments to Optix
   - Daily: Sync call outcomes back to patient notes

**Technical architecture:**
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Optix PMS  │ ←──────→│  NVC Labs    │ ←──────→│  Bland AI    │
│              │  OAuth   │  Middleware  │  API    │  (Calls)     │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │
       │ Webhooks               │ Database
       ↓                        ↓
   Patient data          Synced records
   Appointment slots     Call outcomes
```

**Effort per PMS:** 3-4 weeks development + 2 weeks testing

**Pros:**
- ✅ Fully automated (zero manual steps)
- ✅ Real-time or near real-time sync
- ✅ Appointments auto-book in PMS
- ✅ Professional, enterprise-ready
- ✅ Huge competitive advantage

**Cons:**
- ❌ High development cost per PMS (3-4 weeks each)
- ❌ Ongoing maintenance (API changes, auth issues)
- ❌ Need partnership/API access from PMS vendor
- ❌ Each PMS has different API quirks

**When to build:** After you have 50+ customers and can identify top 2-3 PMS systems used

---

### **Phase 4: Enterprise - White-Label Embedded**
**Timeline:** 12-18 months, after £500K+ ARR
**Coverage:** Single PMS, 100% of their customers

**What this is:**
- NVC Labs becomes a **module inside the PMS**
- Optix customers click "AI Recall" button in Optix itself
- You provide white-label version of NVC Labs
- PMS vendor sells it to their customers (revenue share)

**Example deal structure:**
- Partner with Optix (largest UK PMS)
- Build white-label "Optix AI Recall" powered by NVC Labs
- Optix sells to their 3,000+ customers at £99/mo
- You get 60% (£59/customer), Optix gets 40%
- Instant access to massive customer base

**Effort:** 3-6 months custom development + ongoing support

**Pros:**
- ✅ Instant distribution to thousands of practices
- ✅ Fully embedded (no separate login)
- ✅ PMS vendor handles sales & support
- ✅ Massive scale potential

**Cons:**
- ❌ Requires enterprise sales process
- ❌ Revenue share (lower margins)
- ❌ PMS vendor controls pricing
- ❌ High dependence on single partner

**When to pursue:** After proven PMF, strong revenue, and multiple large enterprise inquiries

---

## 🛠️ Technical Implementation Plan

### Phase 1: CSV (Already Built ✅)
**Status:** Complete

**Current capabilities:**
- CSV upload in `/patients` page
- Risk stratification on import
- Export call outcomes as CSV

**No action needed.**

---

### Phase 2: Zapier Integration (Next Priority)

#### Step 1: Create Zapier Developer Account
1. Go to https://zapier.com/app/developer
2. Sign up as developer (free)
3. Create new integration: "NVC Labs"

#### Step 2: Build NVC Labs API Endpoints
Create these new API routes:

**`/api/integrations/webhooks/zapier`**
- Handles Zapier polling for new appointments
- Returns list of bookings since last poll

**`/api/integrations/patients/bulk`**
- Accepts patient data from Zapier
- Validates and imports to database

**`/api/integrations/auth/zapier`**
- API key authentication for Zapier
- Generate API keys in dashboard

#### Step 3: Define Zapier Triggers & Actions

**Triggers:**
1. **New Appointment Booked** (Polling)
   - Polls `/api/integrations/webhooks/zapier` every 5 mins
   - Returns new bookings since last poll

**Actions:**
1. **Upload Patient** (Write)
   - Takes patient data from any source
   - POST to `/api/integrations/patients/bulk`

2. **Update Patient Call Outcome** (Write)
   - Updates patient record with call result
   - PATCH to `/api/integrations/patients/:id`

#### Step 4: Create Pre-Built Zap Templates

**Template 1: Optix → NVC Labs**
```
Trigger: New patient in Optix (lapsed > 12 months)
Filter: Only if patient has phone number
Action: Upload patient to NVC Labs
```

**Template 2: NVC Labs → Optix**
```
Trigger: New appointment booked in NVC Labs
Action: Create appointment in Optix
Action: Send confirmation email
```

**Template 3: NVC Labs → Google Sheets**
```
Trigger: Call completed in NVC Labs
Action: Add row to Google Sheet with outcome
```

#### Step 5: Publish to Zapier
1. Submit for Zapier review
2. Get listed in Zapier App Directory
3. Create help docs with integration guides

**Total effort:** 1-2 weeks

---

### Phase 3: Native Optix Integration (Later)

#### Prerequisites:
1. Have 10+ customers using Optix
2. Reach out to Optix for API partnership
3. Get sandbox API access

#### Development Steps:

**1. OAuth Setup**
```typescript
// src/lib/integrations/optix/oauth.ts
export async function initiateOptixAuth(practiceId: string) {
  const authUrl = `https://api.optix.com/oauth/authorize?client_id=${OPTIX_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=patients.read appointments.write`
  return authUrl
}

export async function handleOptixCallback(code: string) {
  // Exchange code for access token
  // Store token encrypted in database
}
```

**2. Patient Sync**
```typescript
// src/lib/integrations/optix/sync.ts
export async function syncLapsedPatients(practiceId: string) {
  const optixClient = await getOptixClient(practiceId)

  // Fetch lapsed patients from Optix
  const lapsedPatients = await optixClient.getPatients({
    lastExamBefore: '12 months ago',
    status: 'active'
  })

  // Import to NVC Labs database
  await importPatients(practiceId, lapsedPatients)
}
```

**3. Appointment Booking**
```typescript
// src/lib/integrations/optix/appointments.ts
export async function bookAppointmentInOptix(
  practiceId: string,
  patientId: string,
  datetime: Date
) {
  const optixClient = await getOptixClient(practiceId)

  // Create appointment in Optix
  const appointment = await optixClient.createAppointment({
    patientId,
    datetime,
    type: 'eye_exam',
    duration: 30,
    practitioner: 'auto-assign'
  })

  return appointment
}
```

**4. Webhook Handler**
```typescript
// src/app/api/webhooks/optix/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get('X-Optix-Signature')
  const body = await request.json()

  // Verify webhook signature
  if (!verifyOptixWebhook(signature, body)) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Handle patient update
  if (body.event === 'patient.updated') {
    await updatePatientRecord(body.data)
  }

  return new Response('OK', { status: 200 })
}
```

**5. Dashboard UI**
```typescript
// src/components/integrations/OptixConnect.tsx
export function OptixConnect() {
  const handleConnect = async () => {
    const authUrl = await initiateOptixAuth(practiceId)
    window.location.href = authUrl
  }

  return (
    <button onClick={handleConnect}>
      Connect Optix
    </button>
  )
}
```

**Total effort:** 3-4 weeks per PMS

---

## 💡 Recommended Action Plan

### **Right Now (Weeks 1-2):**
1. ✅ Keep CSV as primary method (it's working!)
2. ✅ Add "Coming Soon: Zapier Integration" banner on dashboard
3. ✅ Survey first 10 customers: "Which PMS do you use?"

### **After 10 Customers (Month 2-3):**
1. Build Zapier integration (1-2 weeks)
2. Create 5 pre-built Zap templates
3. Publish to Zapier marketplace
4. Update landing page: "Integrates with 2,000+ apps via Zapier"

### **After 50 Customers (Month 6-9):**
1. Analyze data: Which PMS systems do customers use?
2. Reach out to #1 PMS vendor (likely Optix) for API partnership
3. Build native integration for top PMS
4. Market as "Native Optix Integration" feature
5. Charge premium tier for native integrations (£449/mo "Enterprise" plan)

### **After £500K ARR (Year 2):**
1. Approach top PMS vendor for white-label deal
2. Negotiate revenue share partnership
3. Build embedded white-label version
4. Scale to thousands of practices instantly

---

## 🎯 Quick Decision Matrix

**"Which integration should I build next?"**

| If you have... | Build this | ETA |
|----------------|------------|-----|
| 0-10 customers | Nothing (CSV is fine) | N/A |
| 10-50 customers | Zapier integration | 1-2 weeks |
| 50+ customers | Native API for top PMS | 3-4 weeks |
| £500K+ ARR | White-label partnership | 3-6 months |

---

## 📋 Integration Checklist (Zapier - Next Priority)

When you're ready to build Zapier:

**Week 1: Backend**
- [ ] Create Zapier developer account
- [ ] Build `/api/integrations/webhooks/zapier` endpoint
- [ ] Build `/api/integrations/patients/bulk` endpoint
- [ ] Add API key generation to dashboard settings
- [ ] Test authentication with Zapier CLI

**Week 2: Zapier App**
- [ ] Define triggers (New Appointment Booked)
- [ ] Define actions (Upload Patient, Update Outcome)
- [ ] Create 5 pre-built Zap templates
- [ ] Write integration documentation
- [ ] Submit to Zapier for review
- [ ] Publish to Zapier App Directory

**Week 3: Marketing**
- [ ] Update landing page: "Integrates with 2,000+ apps"
- [ ] Create Zapier integration demo video
- [ ] Write blog post: "How to Connect Optix to NVC Labs via Zapier"
- [ ] Email existing customers about new feature
- [ ] Add "Zapier" badge to footer

---

## 🔑 Key Takeaways

1. **CSV is not a weakness** - It's universal coverage
2. **Zapier before native APIs** - 80% of value, 20% of effort
3. **Build what customers actually use** - Survey before building
4. **Don't over-engineer the MVP** - You already have 100% coverage with CSV
5. **Phase integrations with revenue** - Each phase requires more resources

---

## 📞 Next Steps

**Immediate (This Week):**
- Keep CSV upload as primary method
- Add "Which PMS do you use?" field to signup form
- Track PMS usage in database

**Short-term (Month 2-3):**
- After 10 customers: Build Zapier integration
- Create pre-built Zap templates
- Market Zapier integration

**Long-term (Month 6+):**
- After 50 customers: Build native Optix API integration
- Charge premium for native integrations
- Consider white-label partnerships

---

**Last Updated:** March 2026
**Status:** CSV ✅ | Zapier 📋 Planned | Native API 🔮 Future
