# MVP Shipping Checklist
## What's Missing to Launch NVC Labs

---

## ✅ **What We HAVE (Complete)**

- [x] Complete UI/UX (all pages designed and built)
- [x] Database schema (Supabase with RLS, migrations ready)
- [x] Authentication pages (login, signup)
- [x] Dashboard with widgets (high-risk alert, ROI calculator)
- [x] Patient management UI (CSV upload interface, PMS links)
- [x] Campaign launcher UI (modal, campaign types)
- [x] Settings page (4 tabs: Practice, Calling Hours, Integrations, AI Scripts)
- [x] Onboarding wizard (5-step visual flow)
- [x] TypeScript types for database
- [x] AI script templates (5 clinical scripts)
- [x] Documentation (USER_GUIDE.md, PMS_INTEGRATIONS.md, SETUP.md)
- [x] Frontend validation and error handling
- [x] Responsive design (mobile-friendly)

**Status:** Frontend is 100% production-ready.

---

## ❌ **What's MISSING (Critical for MVP)**

### **Priority 1: BLOCKER - Must Ship Before Launch**

#### 1. **Backend API Routes** (CRITICAL)
Currently all buttons and forms don't actually DO anything - they're just UI.

**Missing API endpoints:**

```
POST /api/patients/upload
- Parse CSV file from upload
- Validate data (phone numbers, dates, risk categories)
- Insert into Supabase patients table
- Handle duplicates (upsert by phone number)
- Return success/error stats

POST /api/campaigns/launch
- Fetch patients based on campaign type (high-risk, standard, all)
- Queue calls for Bland AI
- Create call_logs entries
- Trigger Bland AI API
- Return campaign ID

POST /api/webhooks/twilio
- Receive call status updates from Twilio
- Update call_logs table
- Handle call outcomes (answered, no_answer, voicemail, booked)
- Trigger retry logic if no answer
- Send SMS confirmation if booked

GET /api/dashboard/stats
- Query Supabase for patient counts
- Calculate call stats
- Fetch high-risk overdue patients
- Return JSON for dashboard widgets

GET /api/patients
- Fetch patient list with filters
- Support pagination
- Return risk categories and due dates

PUT /api/settings/practice
- Update practice details in Supabase
- Save calling hours, clinical appointment value
- Return updated practice data
```

**Estimated work:** 2-3 days

---

#### 2. **Bland AI Integration** (CRITICAL - This is the core product!)

Currently there's NO connection to Bland AI. The campaign launcher is just a button that shows a success message.

**What's needed:**

```typescript
// src/lib/bland-ai/client.ts
export async function triggerCall(options: {
  phoneNumber: string
  firstName: string
  practiceName: string
  script: string
}) {
  const response = await fetch('https://api.bland.ai/v1/calls', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BLAND_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: options.phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      task: options.script,
      voice: 'maya', // Professional UK female voice
      model: 'enhanced',
      max_duration: 5, // 5 minutes max
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bland`,
    }),
  })

  return response.json()
}
```

**Tasks:**
- [ ] Create Bland AI API wrapper (`/src/lib/bland-ai/client.ts`)
- [ ] Build campaign launcher API route (`/src/app/api/campaigns/launch/route.ts`)
- [ ] Implement batch calling (handle rate limits)
- [ ] Build webhook handler for Bland AI callbacks (`/api/webhooks/bland/route.ts`)
- [ ] Store call SID in call_logs table
- [ ] Handle call outcomes and update database

**Estimated work:** 1-2 days

---

#### 3. **Twilio Integration** (CRITICAL - For SMS confirmations)

Bland AI handles the voice calls, but we need Twilio for SMS confirmations when patients book.

**What's needed:**

```typescript
// src/lib/twilio/client.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendBookingConfirmation(options: {
  to: string
  practiceName: string
  appointmentDate?: string
  bookingUrl: string
}) {
  await client.messages.create({
    body: `Thank you for booking with ${options.practiceName}! Your appointment is confirmed. Booking details: ${options.bookingUrl}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: options.to,
  })
}
```

**Tasks:**
- [ ] Create Twilio API wrapper (`/src/lib/twilio/client.ts`)
- [ ] Build SMS sending function
- [ ] Trigger SMS after patient presses 1 (booked)
- [ ] Handle SMS delivery status webhooks

**Estimated work:** 0.5 days

---

#### 4. **CSV Upload Processing** (CRITICAL - Can't add patients otherwise)

The drag-and-drop UI exists, but `handleFile()` function doesn't actually insert data into Supabase.

**What's needed:**

```typescript
// src/app/api/patients/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // Parse CSV
  const text = await file.text()
  const rows = parseCSV(text)

  // Validate
  const validatedPatients = validatePatients(rows)

  // Get practice ID from auth
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: practice } = await supabase
    .from('practices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Insert patients (upsert to handle duplicates)
  const { data, error } = await supabase
    .from('patients')
    .upsert(validatedPatients.map(p => ({
      ...p,
      practice_id: practice.id
    })), {
      onConflict: 'practice_id,phone_number'
    })

  return Response.json({
    success: true,
    imported: data.length
  })
}
```

**Tasks:**
- [ ] Build CSV parsing logic with validation
- [ ] Create API route `/api/patients/upload`
- [ ] Handle phone number normalization (remove spaces, validate UK format)
- [ ] Validate risk categories (only allow valid enum values)
- [ ] Handle date parsing (YYYY-MM-DD)
- [ ] Return detailed error messages for invalid rows

**Estimated work:** 1 day

---

#### 5. **Real Dashboard Data** (CRITICAL - Currently showing fake "0" stats)

Dashboard is hardcoded with placeholder data. Need to fetch real stats from Supabase.

**What's needed:**

```typescript
// src/app/(dashboard)/dashboard/page.tsx - UPDATE existing code
// Replace hardcoded 0s with actual Supabase queries

// This already exists but returns 0 - need to make it work properly
const { count: patientCount } = await supabase
  .from('patients')
  .select('*', { count: 'exact', head: true })
  .eq('practice_id', practice.id)
  .eq('opted_out', false)
```

**Tasks:**
- [ ] Verify Supabase queries work (test with real data)
- [ ] Add error handling for failed queries
- [ ] Show loading states while fetching
- [ ] Cache dashboard stats (React Server Components already cache)

**Estimated work:** 0.5 days

---

### **Priority 2: IMPORTANT - Needed for Good UX**

#### 6. **Stripe Billing Integration**

Can't charge customers without payment processing.

**What's needed:**

```typescript
// src/app/api/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { priceId } = await request.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return Response.json({ url: session.url })
}
```

**Tasks:**
- [ ] Create Stripe products (Starter £149, Growth £299, Clinical £349)
- [ ] Build checkout API route
- [ ] Add "Upgrade Plan" button to dashboard
- [ ] Build webhook handler for subscription events (`/api/webhooks/stripe`)
- [ ] Update practice.subscription_status based on Stripe events
- [ ] Handle usage-based billing (call overage at £0.08/call)
- [ ] Build customer portal for managing subscription

**Estimated work:** 2 days

---

#### 7. **Email Verification Flow**

Supabase auth works, but email confirmation links aren't handled properly.

**What's needed:**

```typescript
// src/app/auth/callback/route.ts
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
```

**Tasks:**
- [ ] Create auth callback route for email confirmation
- [ ] Configure Supabase email templates with proper redirect URLs
- [ ] Add "Resend confirmation email" button if not verified
- [ ] Show email verification banner on dashboard

**Estimated work:** 0.5 days

---

#### 8. **Password Reset Flow**

Login page has "Forgot Password" link but it doesn't work.

**What's needed:**

```typescript
// src/app/(auth)/reset-password/page.tsx
'use client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')

  const handleReset = async () => {
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    // Show success message
  }

  return (/* form UI */)
}
```

**Tasks:**
- [ ] Create reset password request page
- [ ] Create update password page (after clicking email link)
- [ ] Configure Supabase password reset email template

**Estimated work:** 1 day

---

### **Priority 3: NICE-TO-HAVE - Can Ship Without**

#### 9. **Compliance PDF Reports**

Dashboard has "Download Compliance Report" mentioned but button doesn't exist.

**What's needed:**
- [ ] Install PDF generation library (e.g., `jspdf` or `pdfmake`)
- [ ] Create PDF template with practice logo, GOC compliance language
- [ ] Query compliance_audit_log table
- [ ] Generate PDF with all high-risk patients and call attempts
- [ ] Add download button to dashboard

**Estimated work:** 1 day
**Ship without this?** Yes - can manually query database for pilot

---

#### 10. **Campaign History Table**

Calls page shows "No campaigns yet" but no way to view past campaigns.

**What's needed:**
- [ ] Create campaigns table in Supabase
- [ ] Store campaign metadata (type, launch date, patient count)
- [ ] Build API route to fetch campaign history
- [ ] Display table with campaign stats

**Estimated work:** 1 day
**Ship without this?** Yes - v1 can just show call logs

---

#### 11. **PMS API Integrations**

Settings page has "Connect Optix/Acuitas/etc." buttons but they don't work.

**What's needed:**
- [ ] Research each PMS API (Optix, Acuitas, Optisoft, Sycle)
- [ ] Build OAuth flows or API key authentication
- [ ] Create sync jobs (nightly at 2am)
- [ ] Map PMS fields to NVC Labs schema
- [ ] Handle rate limits and errors

**Estimated work:** 2-3 weeks (complex, varies by PMS)
**Ship without this?** **YES** - Start with CSV upload only for MVP

---

#### 12. **Google Calendar Integration**

Settings page mentions Google Calendar but no integration built.

**What's needed:**
- [ ] OAuth flow for Google Calendar
- [ ] Create calendar events when patient books
- [ ] Send calendar invites to patients

**Estimated work:** 1-2 days
**Ship without this?** **YES** - Use booking URL instead for MVP

---

#### 13. **Automated Tests**

No tests written.

**What's needed:**
- [ ] Unit tests for utility functions
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows (signup → upload → launch)

**Estimated work:** 3-4 days
**Ship without this?** **YES** - Manual testing for MVP, add tests after pilot

---

## 📋 **Absolute Minimum to Ship MVP**

### **Week 1: Core Backend (MUST HAVE)**

**Day 1-2: Patient Upload**
- [ ] Build `/api/patients/upload` route
- [ ] CSV parsing with validation
- [ ] Insert into Supabase
- [ ] Test with sample CSV

**Day 3-4: Bland AI Integration**
- [ ] Create Bland AI API wrapper
- [ ] Build `/api/campaigns/launch` route
- [ ] Test making actual AI calls
- [ ] Build `/api/webhooks/bland` to receive outcomes

**Day 5: Twilio SMS**
- [ ] Twilio API wrapper
- [ ] Send SMS confirmations
- [ ] Test SMS delivery

**Day 6-7: Dashboard Data**
- [ ] Connect dashboard to real Supabase queries
- [ ] Test all stats display correctly
- [ ] Fix any bugs

**Deliverable:** Working MVP that can upload patients and launch AI campaigns

---

### **Week 2: Billing & Polish (IMPORTANT)**

**Day 8-9: Stripe Integration**
- [ ] Create Stripe products
- [ ] Build checkout flow
- [ ] Webhook handler
- [ ] Test subscription signup

**Day 10: Auth Flows**
- [ ] Email verification callback
- [ ] Password reset flow
- [ ] Test auth edge cases

**Day 11-12: Testing & Bug Fixes**
- [ ] End-to-end manual testing
- [ ] Fix critical bugs
- [ ] Performance optimization

**Day 13-14: Deployment**
- [ ] Deploy to Vercel
- [ ] Configure production environment variables
- [ ] Set up custom domain
- [ ] SSL certificates
- [ ] Final production test

**Deliverable:** Production-ready MVP deployed and accessible

---

## 🚀 **MVP Launch Checklist**

### **Pre-Launch (Before First Customer)**

- [ ] Supabase production project created (UK region)
- [ ] Bland AI account with API key
- [ ] Twilio account with UK phone number
- [ ] Stripe products created (3 pricing tiers)
- [ ] Environment variables configured in Vercel
- [ ] Custom domain connected (e.g., nvclabs.com)
- [ ] SSL certificate active
- [ ] Terms of Service page created
- [ ] Privacy Policy page created
- [ ] GDPR-compliant data processing agreement prepared
- [ ] Support email set up (support@nvclabs.com)

### **Technical Launch Checklist**

- [ ] All API routes deployed and tested
- [ ] Database migrations run on production
- [ ] RLS policies verified working
- [ ] CSV upload tested with 100+ patients
- [ ] Campaign launch tested with real Bland AI calls
- [ ] SMS confirmations sending correctly
- [ ] Stripe checkout flow tested
- [ ] Dashboard loading real data
- [ ] Mobile responsive on iPhone/Android
- [ ] Error logging set up (Sentry or similar)

### **User Onboarding Checklist**

- [ ] Onboarding wizard tested end-to-end
- [ ] CSV template downloadable
- [ ] USER_GUIDE.md accessible from help menu
- [ ] Email confirmation working
- [ ] Password reset working
- [ ] First campaign can be launched within 10 minutes of signup

---

## ⏱️ **Realistic Timeline**

| Task | Duration | Can Ship Without? |
|------|----------|-------------------|
| Patient CSV upload API | 1 day | ❌ NO - Critical |
| Bland AI integration | 2 days | ❌ NO - This IS the product |
| Twilio SMS | 0.5 days | ❌ NO - Part of booking flow |
| Dashboard real data | 0.5 days | ❌ NO - Otherwise looks broken |
| Stripe billing | 2 days | ⚠️ Maybe - Can do manual invoicing for pilot |
| Email verification | 0.5 days | ⚠️ Maybe - Can manually verify in Supabase |
| Password reset | 1 day | ⚠️ Maybe - Can manually reset via Supabase |
| PDF reports | 1 day | ✅ YES - Manual export for pilot |
| Campaign history | 1 day | ✅ YES - Call logs table exists |
| PMS integrations | 3+ weeks | ✅ YES - CSV upload is enough for MVP |
| Google Calendar | 2 days | ✅ YES - Use booking URL instead |
| Automated tests | 4 days | ✅ YES - Manual test for pilot |

**Absolute minimum:** 4-5 days of focused development
**Recommended for pilot:** 10-12 days (includes billing and auth flows)
**Full-featured MVP:** 3-4 weeks (includes PMS integrations)

---

## 🎯 **Recommended Launch Strategy**

### **Option 1: Ultra-Lean Pilot (4-5 days work)**

**Ship with:**
- ✅ CSV upload (no PMS integrations)
- ✅ Bland AI calling
- ✅ SMS confirmations
- ✅ Real dashboard data
- ❌ Manual invoicing (no Stripe yet)
- ❌ Manual password resets

**Best for:** Quick validation with 1-2 friendly practices who will tolerate rough edges

---

### **Option 2: Polished Pilot (10-12 days work)** ⭐ RECOMMENDED

**Ship with:**
- ✅ CSV upload (no PMS integrations)
- ✅ Bland AI calling
- ✅ SMS confirmations
- ✅ Real dashboard data
- ✅ Stripe billing (subscription checkout)
- ✅ Email verification
- ✅ Password reset

**Best for:** Onboarding 3-5 pilot practices who will pay and expect polish

---

### **Option 3: Full MVP (3-4 weeks work)**

**Ship with everything including:**
- ✅ At least 1 PMS integration (Optix - easiest)
- ✅ Google Calendar auto-booking
- ✅ Compliance PDF reports
- ✅ Campaign history

**Best for:** Public launch, scaling to 10+ practices

---

## 🛠️ **What to Build Next (Priority Order)**

1. **CSV Upload API** (Day 1) - Can't add patients without this
2. **Bland AI Integration** (Days 2-3) - This IS the product
3. **Twilio SMS** (Day 4 morning) - Completes booking flow
4. **Dashboard Real Data** (Day 4 afternoon) - Otherwise looks broken
5. **Stripe Checkout** (Days 5-6) - Need to charge for service
6. **Email Verification** (Day 7 morning) - Security requirement
7. **Password Reset** (Day 7 afternoon) - UX requirement
8. **Deploy to Production** (Day 8) - Make it live
9. **Manual Testing** (Day 9) - Catch bugs
10. **First Pilot Practice** (Day 10+) - Real user feedback

**After pilot feedback:**
- PMS integration (Optix first)
- PDF compliance reports
- Campaign history table
- Automated tests

---

## 💡 **Key Insight**

**Current state:** You have a beautiful, complete frontend with zero backend.
**To ship MVP:** Focus on backend API routes + integrations (Bland AI, Twilio, Stripe).
**Timeline:** 10-12 days of focused development for polished pilot.

**The good news:** UI is 100% done. No more frontend work needed. Just wire up the backend and you're ready to launch.

---

**Last Updated:** February 2026
