# NVC Labs - Production Deployment Guide

Complete guide to deploy NVC Labs to production on Vercel.

---

## 📋 **Pre-Deployment Checklist**

Before deploying, ensure you have accounts and credentials for:

- ✅ Vercel account (free tier works)
- ✅ Supabase project (production, UK region)
- ✅ Bland AI API key
- ✅ Twilio account with UK phone number
- ✅ Stripe account with products created
- ✅ Custom domain (optional but recommended)

---

## 1️⃣ **Set Up Supabase Production**

### Step 1: Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. **Name:** NVC Labs Production
4. **Database Password:** Create a strong password (save it!)
5. **Region:** **Europe West (London)** - CRITICAL for GDPR compliance
6. Click **Create new project**

### Step 2: Run Database Migrations

1. Go to SQL Editor in Supabase dashboard
2. Run `supabase/migrations/001_initial_schema.sql`
   - Copy entire file contents
   - Paste into SQL editor
   - Click Run
3. Run `supabase/migrations/002_clinical_compliance.sql`
   - Copy entire file contents
   - Paste into SQL editor
   - Click Run

### Step 3: Configure Auth Settings

1. Go to **Authentication** → **Providers**
2. **Email** provider:
   - Enable email authentication
   - ✅ Confirm email enabled
   - **Email confirmation URL:** `https://yourdomain.com/auth/callback`
   - **Reset password URL:** `https://yourdomain.com/auth/update-password`

3. **Email Templates:**
   - Go to **Authentication** → **Email Templates**
   - **Confirm signup template:**
     - Subject: Confirm your NVC Labs account
     - Body: Click here to confirm: {{ .ConfirmationURL }}
   - **Reset password template:**
     - Subject: Reset your NVC Labs password
     - Body: Click here to reset: {{ .ConfirmationURL }}

### Step 4: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2️⃣ **Set Up Bland AI**

### Step 1: Create Account

1. Go to [bland.ai](https://www.bland.ai)
2. Sign up for an account
3. Add billing info (you'll get free trial credits)

### Step 2: Get API Key

1. In Bland AI dashboard, go to **API Keys**
2. Create new API key
3. Copy it → `BLAND_AI_API_KEY`

### Step 3: Configure Webhook (After Deploy)

After deploying to Vercel, you'll need to set webhook URL:
1. Go to Bland AI **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/bland`
3. Save

---

## 3️⃣ **Set Up Twilio**

### Step 1: Create Account

1. Go to [twilio.com](https://www.twilio.com)
2. Sign up (free trial gives £14 credit)
3. Verify email and phone number

### Step 2: Get Credentials

1. In Twilio Console Dashboard:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** (click to reveal) → `TWILIO_AUTH_TOKEN`

### Step 3: Buy UK Phone Number

1. Go to **Phone Numbers** → **Buy a number**
2. **Country:** United Kingdom
3. **Capabilities:** ✅ Voice, ✅ SMS
4. Search and buy a number (costs ~£1/month)
5. Copy the number in E.164 format (e.g., +447700900123) → `TWILIO_PHONE_NUMBER`

---

## 4️⃣ **Set Up Stripe**

### Step 1: Create Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up and complete business verification
3. Enable **Test mode** for initial testing

### Step 2: Create Products

1. Go to **Products** → **Add product**
2. Create 3 subscription products:

**Product 1: Starter**
- Name: Starter
- Pricing: £149/month recurring
- Copy **Price ID** → `STRIPE_PRICE_STARTER`

**Product 2: Growth**
- Name: Growth
- Pricing: £299/month recurring
- Copy **Price ID** → `STRIPE_PRICE_GROWTH`

**Product 3: Clinical Compliance**
- Name: Clinical Compliance
- Pricing: £349/month recurring
- Copy **Price ID** → `STRIPE_PRICE_CLINICAL`

### Step 3: Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (click Reveal) → `STRIPE_SECRET_KEY`

### Step 4: Configure Webhook (After Deploy)

After deploying to Vercel:
1. Go to **Developers** → **Webhooks**
2. **Add endpoint:**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
3. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 5️⃣ **Deploy to Vercel**

### Step 1: Push to GitHub

```bash
cd nvc-labs
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. **Import Git Repository:**
   - Connect your GitHub account
   - Select `newvantageco/NVC-Labs-` repository
4. Click **Import**

### Step 3: Configure Build Settings

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)

### Step 4: Add Environment Variables

Click **Environment Variables** and add ALL of these:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Bland AI
BLAND_AI_API_KEY=sk_...

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+447700900123

# Stripe
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_WEBHOOK_SECRET=(add this AFTER webhook is created)
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_GROWTH=price_xxxxx
STRIPE_PRICE_CLINICAL=price_xxxxx

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com (or https://nvc-labs.vercel.app)
```

### Step 5: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Vercel will give you a URL like: `https://nvc-labs-xxx.vercel.app`

---

## 6️⃣ **Post-Deployment Configuration**

### Step 1: Update Bland AI Webhook

1. Go to Bland AI dashboard
2. **Settings** → **Webhooks**
3. Add: `https://your-vercel-url.vercel.app/api/webhooks/bland`

### Step 2: Update Stripe Webhook

1. Go to Stripe **Developers** → **Webhooks**
2. Add endpoint: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
3. Select all the events listed in Step 4️⃣
4. Copy **Signing secret**
5. Go back to Vercel:
   - **Settings** → **Environment Variables**
   - Add `STRIPE_WEBHOOK_SECRET` with the signing secret
   - **Redeploy** (click Deployments → latest → menu → Redeploy)

### Step 3: Update Supabase Auth URLs

1. Go to Supabase **Authentication** → **URL Configuration**
2. **Site URL:** `https://your-vercel-url.vercel.app`
3. **Redirect URLs:**
   - Add: `https://your-vercel-url.vercel.app/auth/callback`
   - Add: `https://your-vercel-url.vercel.app/auth/update-password`

---

## 7️⃣ **Add Custom Domain (Optional)**

### Step 1: Buy Domain

Buy a domain (e.g., `nvclabs.com`) from:
- Namecheap
- GoDaddy
- Google Domains

### Step 2: Add Domain to Vercel

1. In Vercel project, go to **Settings** → **Domains**
2. Enter your domain: `nvclabs.com`
3. Follow Vercel instructions to:
   - Add A record pointing to Vercel IP
   - Add CNAME for `www` subdomain
4. Wait for DNS propagation (5-30 minutes)
5. Vercel automatically provisions SSL certificate

### Step 3: Update Environment Variable

1. Go to **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to `https://nvclabs.com`
3. **Redeploy**

### Step 4: Update All Webhooks & Auth URLs

Update URLs in:
- Bland AI webhook
- Stripe webhook
- Supabase auth redirect URLs

---

## 8️⃣ **Verification & Testing**

### Test 1: Sign Up Flow

1. Go to `https://your-domain.com`
2. Click **Get Started**
3. Fill in practice signup form
4. Check email for confirmation link
5. Click link → should redirect to dashboard

✅ **Pass:** Dashboard loads with practice name

### Test 2: CSV Upload

1. Download CSV template from Patients page
2. Add 2-3 test patients with fake phone numbers
3. Upload CSV
4. Check Patients table in Supabase → should see patients

✅ **Pass:** Patients appear in database

### Test 3: Stripe Checkout

1. Click **Upgrade Plan** on dashboard
2. Select a plan
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check Stripe dashboard → subscription created

✅ **Pass:** Subscription shows in Stripe & practice.subscription_status = 'active'

### Test 4: Launch Campaign (CAUTION - Uses Real Credits!)

**⚠️ WARNING:** This will make REAL phone calls and use Bland AI credits!

1. Upload test patients with REAL phone numbers (your own)
2. Click **Launch Campaign** → **High-Risk**
3. Confirm launch
4. Wait for call to come through
5. Answer and test AI script

✅ **Pass:** Call received, script plays correctly

### Test 5: Webhook Processing

1. After test campaign call completes
2. Check `call_logs` table in Supabase
3. Verify status updated (answered, booked, etc.)
4. Check `compliance_audit_log` table

✅ **Pass:** Call outcomes logged correctly

---

## 9️⃣ **Production Checklist**

Before onboarding real customers:

**Security:**
- [ ] All environment variables set correctly
- [ ] Supabase project in UK/EU region
- [ ] Row-level security enabled on all tables
- [ ] Stripe webhook secret configured
- [ ] SSL certificate active (automatic with Vercel)

**Functionality:**
- [ ] Sign up flow works (with email confirmation)
- [ ] Password reset flow works
- [ ] CSV upload imports patients correctly
- [ ] Dashboard shows real data
- [ ] Campaign launch triggers Bland AI calls
- [ ] Webhooks update call_logs correctly
- [ ] SMS confirmations send via Twilio
- [ ] Stripe checkout completes successfully
- [ ] Subscription status updates in database

**Legal/Compliance:**
- [ ] Privacy Policy page created
- [ ] Terms of Service page created
- [ ] GDPR-compliant Data Processing Agreement ready
- [ ] GOC compliance features documented
- [ ] Support email configured (support@yourdomain.com)

**Monitoring:**
- [ ] Set up error logging (Sentry or similar - optional)
- [ ] Vercel analytics enabled
- [ ] Stripe email notifications enabled

---

## 🔟 **Go Live!**

### Switch to Stripe Live Mode

When ready for real customers:

1. Go to Stripe dashboard
2. Toggle **Test mode** OFF (top right)
3. Create same 3 products in **Live mode**
4. Copy new **Live** Price IDs
5. Update Vercel environment variables:
   - `STRIPE_SECRET_KEY` → use `sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → use `pk_live_...`
   - `STRIPE_PRICE_STARTER` → new live price ID
   - `STRIPE_PRICE_GROWTH` → new live price ID
   - `STRIPE_PRICE_CLINICAL` → new live price ID
6. **Redeploy** in Vercel

### Onboard First Pilot Practice

1. Send them link: `https://your-domain.com`
2. Guide them through signup
3. Help them upload patient CSV
4. Walk them through launching first campaign
5. Gather feedback

---

## 🚀 **You're Live!**

NVC Labs is now in production and ready for customers.

**Next Steps:**
- Onboard 3-5 pilot practices
- Gather testimonials
- Iterate based on feedback
- Build PMS integrations (Optix first)
- Scale to 10+ paying practices

---

**Questions or Issues?**

Check:
- Vercel deployment logs for build errors
- Supabase logs for database errors
- Stripe dashboard for payment issues
- Bland AI dashboard for call logs
- Twilio logs for SMS issues

---

**Last Updated:** February 2026
