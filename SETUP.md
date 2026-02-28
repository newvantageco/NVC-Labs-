# NVC Labs Setup Guide

This guide will walk you through setting up NVC Labs from scratch. Follow each step carefully to get your AI call centre platform running.

## Prerequisites

Before you begin, make sure you have:
- [x] Node.js 18+ installed
- [x] npm package manager
- [ ] A Supabase account (free tier available)
- [ ] A Bland AI account
- [ ] A Twilio account
- [ ] A Stripe account (for payments)

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/create an account
2. Click "New Project"
3. Choose a name (e.g., "nvc-labs-production")
4. Set a strong database password (save this!)
5. Choose region: **Europe West (London)** for UK data residency (GDPR compliance)
6. Click "Create new project"

### 1.2 Run the Database Migration

1. In your Supabase project, go to the SQL Editor
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` from this repo
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

This will create:
- `practices` table (stores optician practice data)
- `patients` table (stores patient records)
- `call_logs` table (stores AI call outcomes)
- Row-level security policies (GDPR compliance)
- Indexes for performance

### 1.3 Get Your Supabase API Keys

1. In Supabase, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → This is your `SUPABASE_SERVICE_ROLE_KEY`

### 1.4 Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Configure email templates under **Email Templates**

## Step 2: Bland AI Setup

### 2.1 Create a Bland AI Account

1. Go to [bland.ai](https://www.bland.ai)
2. Sign up for an account
3. You'll get free credits to start testing

### 2.2 Get Your API Key

1. In the Bland AI dashboard, go to **API Keys**
2. Create a new API key
3. Copy it → This is your `BLAND_AI_API_KEY`

### 2.3 Configure Voice Settings (Optional for now)

You can customize the AI voice later. For MVP, default settings work fine.

## Step 3: Twilio Setup

### 3.1 Create a Twilio Account

1. Go to [twilio.com](https://www.twilio.com)
2. Sign up (you'll get free trial credits - around £14)
3. Verify your email and phone number

### 3.2 Get Your Account Credentials

1. In the Twilio Console Dashboard, find:
   - **Account SID** → This is your `TWILIO_ACCOUNT_SID`
   - **Auth Token** (click to reveal) → This is your `TWILIO_AUTH_TOKEN`

### 3.3 Buy a UK Phone Number

1. Go to **Phone Numbers** → **Buy a number**
2. Select **United Kingdom** as the country
3. Check **Voice** capability
4. Find a number you like (costs ~£1/month)
5. Purchase the number
6. Copy the number (format: +44...) → This is your `TWILIO_PHONE_NUMBER`

## Step 4: Stripe Setup (Optional for MVP Testing)

For initial testing with pilot practices, you can skip Stripe and add it later. Here's how to set it up when ready:

### 4.1 Create a Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete business verification

### 4.2 Get Your API Keys

1. In Stripe Dashboard, go to **Developers** → **API Keys**
2. Toggle "Test mode" ON (for development)
3. Copy:
   - **Publishable key** → This is your `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (click "Reveal") → This is your `STRIPE_SECRET_KEY`

### 4.3 Set Up Webhook (Later Phase)

You'll need this for subscription management. Skip for now.

## Step 5: Environment Variables

### 5.1 Configure Your .env.local File

1. Open `nvc-labs/.env.local` in a text editor
2. Fill in all the values you copied from Steps 1-4:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Bland AI Configuration
BLAND_AI_API_KEY=your-bland-ai-key-here

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+44xxxxxxxxxx

# Stripe Configuration (optional for now)
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file

**Important:** Never commit `.env.local` to Git. It's already in `.gitignore`.

## Step 6: Run the Application

### 6.1 Start the Development Server

```bash
cd nvc-labs
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 6.2 Test the Sign-Up Flow

1. Go to http://localhost:3000
2. Click "Get Started"
3. Fill in the practice sign-up form
4. Check your email for a Supabase confirmation link (if email confirmation is enabled)
5. Sign in and explore the dashboard

## Step 7: Deploy to Vercel (Production)

### 7.1 Push to GitHub

Your code is already pushed to GitHub at:
https://github.com/newvantageco/NVC-Labs-.git

### 7.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your `NVC-Labs-` repository
5. **Important:** Add all environment variables from `.env.local` in the Vercel Environment Variables section
6. Click "Deploy"

### 7.3 Update Environment Variables for Production

After deployment:
1. Copy your Vercel production URL (e.g., `https://nvc-labs.vercel.app`)
2. In Vercel, go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. Redeploy

## What's Built So Far

✅ **Authentication System**
- Sign up with practice details
- Login with email/password
- Protected routes with middleware

✅ **Database Schema**
- Practices table with subscription tiers
- Patients table with opt-out tracking
- Call logs table with status tracking
- Row-level security (GDPR compliant)

✅ **Dashboard**
- Stats overview (patients, calls, conversion rate)
- Subscription status and usage
- Recent calls table
- Quick actions navigation

## What's Next (To Build)

The following features still need to be built for the full MVP:

### Phase 1 - Core Functionality
- [ ] **Patient CSV Upload** - Build the upload component
- [ ] **Bland AI Integration** - Connect AI calling engine
- [ ] **Twilio Integration** - Connect telephony
- [ ] **Call Campaign Trigger** - Start outbound calls
- [ ] **Webhook Handlers** - Receive call status updates
- [ ] **Call Retry Logic** - Automatically retry no-answers

### Phase 2 - Polish & Features
- [ ] **Settings Page** - Edit AI script, calling hours, practice details
- [ ] **Patient Management** - View, edit, delete patients
- [ ] **Call Logs Page** - Full call history with filters
- [ ] **SMS Confirmations** - Send booking confirmations via Twilio
- [ ] **Google Calendar Integration** - Auto-book appointments
- [ ] **PDF Reports** - Downloadable campaign reports

### Phase 3 - Billing & Scale
- [ ] **Stripe Subscriptions** - Monthly billing
- [ ] **Usage Tracking** - Track calls per month
- [ ] **Overage Billing** - Charge for calls over limit
- [ ] **Multi-location Support** - For small optical groups

## Next Steps

Now that your foundation is set up, you can:

1. **Test the dashboard** - Sign up, explore the UI
2. **Build patient upload** - Let practices add CSV files
3. **Integrate Bland AI** - Make your first test call
4. **Find your first pilot practice** - Get real users!

## Getting Help

If you run into issues:
- Check the console for errors (`npm run dev` output)
- Verify all environment variables are set correctly
- Check Supabase logs (in Supabase Dashboard → Logs)
- Review this setup guide step-by-step

## Security Checklist

Before launching to real practices:
- [ ] Database is in UK/EU region (GDPR)
- [ ] Row-level security is enabled on all tables
- [ ] Environment variables are never committed to Git
- [ ] Production uses different API keys than development
- [ ] SSL/HTTPS is enabled (automatic with Vercel)
- [ ] Email verification is enabled in Supabase Auth

---

**You're ready to build NVC Labs!** 🚀

Start by testing the auth flow, then move on to building the patient upload feature and Bland AI integration.
