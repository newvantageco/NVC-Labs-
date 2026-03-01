# NVC Labs - Production Launch Checklist

**Use this checklist before deploying to production and onboarding real customers.**

---

## 🔐 Security & Data Protection

### Supabase Configuration
- [ ] Production project created in **UK/EU region** (GDPR compliance)
- [ ] All database migrations applied successfully
- [ ] Row-level security (RLS) policies enabled on ALL tables
- [ ] Service role key stored securely in Vercel (never exposed client-side)
- [ ] Database password is strong and securely stored
- [ ] No test data in production database

### Environment Variables
- [ ] All env vars set in Vercel production environment
- [ ] No secrets committed to git repository
- [ ] `.env.local` added to `.gitignore`
- [ ] All API keys are production keys (not test/development)
- [ ] `NEXT_PUBLIC_APP_URL` set to correct production domain

### Authentication & Auth Flow
- [ ] Email confirmation enabled in Supabase
- [ ] Password reset flow tested end-to-end
- [ ] Auth callback URLs configured correctly
- [ ] Session timeout configured appropriately
- [ ] No default/test user accounts exist

---

## 💳 Payment & Billing

### Stripe Configuration
- [ ] Stripe account verified and business info complete
- [ ] **Switched to LIVE mode** (not test mode)
- [ ] All 3 subscription products created in live mode:
  - [ ] Starter (£149/month)
  - [ ] Growth (£299/month)
  - [ ] Clinical Compliance (£349/month)
- [ ] Live API keys added to Vercel environment
- [ ] Webhook endpoint configured: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Webhook signing secret added to Vercel
- [ ] Webhook listening to required events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Test checkout flow completed with live test card
- [ ] Subscription status updates correctly in database
- [ ] Email receipts configured in Stripe

---

## 📞 Communication Integrations

### Bland AI Configuration
- [ ] Production API key added to Vercel
- [ ] Billing information added (credits available)
- [ ] Webhook configured: `https://yourdomain.com/api/webhooks/bland`
- [ ] Test call completed successfully
- [ ] Call script reviewed for accuracy and compliance
- [ ] Call outcomes mapping verified (answered, booked, voicemail, etc.)

### Twilio Configuration
- [ ] Production account created and verified
- [ ] UK phone number purchased with Voice + SMS capabilities
- [ ] Account SID and Auth Token added to Vercel
- [ ] Phone number in E.164 format (+447...)
- [ ] Test SMS sent successfully
- [ ] SMS confirmations working correctly

---

## 🧪 Functionality Testing

### Core User Flows
- [ ] **Sign Up Flow:**
  - [ ] Form validation works
  - [ ] Email confirmation sent
  - [ ] Confirmation link works
  - [ ] User redirected to dashboard
  - [ ] Practice profile created correctly
- [ ] **Login Flow:**
  - [ ] Credentials validated correctly
  - [ ] Error messages clear
  - [ ] Successful login redirects to dashboard
  - [ ] Session persists correctly
- [ ] **Password Reset:**
  - [ ] Reset email sent
  - [ ] Reset link works
  - [ ] New password saves
  - [ ] Can login with new password

### Patient Management
- [ ] CSV template downloads correctly
- [ ] CSV upload validates data
- [ ] Patients imported to database
- [ ] Patient list displays correctly
- [ ] Patient data stored with correct `practice_id`
- [ ] RLS policies prevent cross-practice data access

### Campaign Management
- [ ] Risk stratification displayed correctly
- [ ] Campaign launch triggers Bland AI calls
- [ ] Calls reach real phone numbers
- [ ] Call outcomes logged in database
- [ ] Call logs visible in dashboard
- [ ] Compliance audit trail created

### Subscription Management
- [ ] Upgrade plan UI displays correctly
- [ ] Stripe checkout opens
- [ ] Payment processed successfully
- [ ] Subscription status updates in database
- [ ] Features unlock based on subscription tier
- [ ] Downgrade/cancel flows work (if implemented)

---

## 🚀 Deployment & Infrastructure

### Vercel Deployment
- [ ] GitHub repository connected
- [ ] Build succeeds without errors
- [ ] Production deployment live
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic)
- [ ] No build warnings or errors in logs

### DNS & Domain
- [ ] Domain purchased (if using custom domain)
- [ ] DNS records configured correctly
- [ ] HTTPS working on all pages
- [ ] `www` redirect configured (if applicable)
- [ ] No mixed content warnings

### Performance
- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 90 (SEO)
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] All images optimized (WebP, lazy loading)
- [ ] No console errors in browser
- [ ] Page load time < 3 seconds

---

## 📋 Legal & Compliance

### Documentation
- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] Cookie Policy (if using analytics)
- [ ] GDPR-compliant data processing agreement prepared
- [ ] GOC compliance features documented
- [ ] Support contact info clearly visible

### Data Protection
- [ ] Data stored in UK/EU region only
- [ ] No unnecessary data collected
- [ ] Data retention policy defined
- [ ] Backup strategy implemented
- [ ] Incident response plan documented

### Clinical Compliance (GOC)
- [ ] Appointment confirmation system working
- [ ] Call recording consent mechanism in place (if recording)
- [ ] Audit trail captures all required events
- [ ] Compliance dashboard functional
- [ ] Emergency opt-out mechanism working

---

## 📧 Communications

### Email Configuration
- [ ] Support email created (e.g., support@nvclabs.com)
- [ ] Email forwarding configured
- [ ] Supabase email templates customized with branding
- [ ] Test emails received in inbox (not spam)
- [ ] Email signature professional

### Customer Onboarding
- [ ] Welcome email template ready
- [ ] Onboarding documentation prepared
- [ ] CSV template link shared
- [ ] Tutorial videos/guides ready (optional)
- [ ] FAQ page created

---

## 🔍 Monitoring & Analytics

### Error Tracking
- [ ] Error logging configured (Sentry, LogRocket, or similar - optional but recommended)
- [ ] Vercel error notifications enabled
- [ ] Monitoring alerts set up for critical failures

### Analytics
- [ ] Vercel Analytics enabled
- [ ] Google Analytics configured (optional)
- [ ] Conversion tracking set up (sign-ups, subscriptions)
- [ ] Dashboard usage metrics tracked

### Logs
- [ ] Able to access Vercel function logs
- [ ] Supabase logs accessible
- [ ] Stripe dashboard monitored
- [ ] Bland AI call logs reviewed regularly

---

## 👥 Customer Support

### Support Infrastructure
- [ ] Support email monitored daily
- [ ] Response time expectation set (e.g., 24 hours)
- [ ] Escalation process defined
- [ ] Knowledge base started (FAQ)
- [ ] Refund policy defined

### Internal Tools
- [ ] Admin access to Supabase dashboard
- [ ] Admin access to Stripe dashboard
- [ ] Admin access to Bland AI dashboard
- [ ] Admin access to Twilio dashboard
- [ ] Ability to debug customer issues quickly

---

## 🧑‍⚕️ Pilot Program

### Pre-Launch
- [ ] 3-5 pilot practices identified
- [ ] Pilot agreement signed (discount/free trial terms)
- [ ] Feedback collection method prepared (survey, interviews)
- [ ] Success criteria defined (e.g., 80% satisfaction, 50+ appointments booked)

### Launch Day
- [ ] Pilot practices invited to sign up
- [ ] Personal onboarding calls scheduled
- [ ] Screen sharing support available
- [ ] First campaigns launched with supervision
- [ ] Initial feedback collected

### Post-Launch (Week 1)
- [ ] Check-in call with each pilot practice
- [ ] Bug reports triaged and fixed
- [ ] Feature requests documented
- [ ] Success metrics measured
- [ ] Testimonials collected

---

## 🎯 Success Metrics (First 30 Days)

Track these KPIs to measure MVP success:

### Customer Metrics
- [ ] Number of sign-ups: _____
- [ ] Number of paying subscribers: _____
- [ ] Average subscription tier: _____
- [ ] Churn rate: _____
- [ ] Customer satisfaction score (NPS): _____

### Usage Metrics
- [ ] Total patients uploaded: _____
- [ ] Total campaigns launched: _____
- [ ] Total AI calls made: _____
- [ ] Total appointments booked: _____
- [ ] Conversion rate (calls → appointments): _____%

### Technical Metrics
- [ ] Uptime percentage: _____%
- [ ] Average page load time: _____
- [ ] Number of critical bugs: _____
- [ ] Support tickets resolved: _____

---

## 🚦 Go/No-Go Decision

**Only proceed to full launch if ALL of these are YES:**

- [ ] ✅ All security checklist items completed
- [ ] ✅ All payment integration tests passed
- [ ] ✅ All core user flows tested successfully
- [ ] ✅ Legal documentation published
- [ ] ✅ Support infrastructure in place
- [ ] ✅ At least 2 pilot practices onboarded successfully
- [ ] ✅ No critical bugs outstanding
- [ ] ✅ Team confident in handling production issues

---

## 📞 Emergency Contacts

**Have these ready before launch:**

| Service | Emergency Action | Contact |
|---------|------------------|---------|
| **Vercel** | Rollback deployment | [Vercel Dashboard](https://vercel.com) |
| **Supabase** | Restore database backup | support@supabase.io |
| **Stripe** | Pause subscriptions | [Stripe Support](https://support.stripe.com) |
| **Bland AI** | Stop all campaigns | support@bland.ai |
| **Twilio** | Disable SMS | [Twilio Console](https://console.twilio.com) |

---

## ✅ Final Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Lead Developer** | ___________ | ______ | _______ |
| **Product Owner** | ___________ | ______ | _______ |
| **QA/Tester** | ___________ | ______ | _______ |

---

**Last Updated:** March 2026

**Status:** Ready for Production Launch 🚀
