# NVC Labs

**AI Recall Platform for UK Opticians**

NVC Labs is a SaaS AI call centre platform purpose-built for UK opticians. It automates patient recall and appointment booking using intelligent outbound voice calls, freeing practices from manual follow-up while recovering missed revenue from lapsed patients.

## 🎯 Product Vision

Become the leading AI recall automation platform for UK opticians, recovering appointment revenue and improving patient retention at scale — starting with independents and growing into regional chains.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Voice**: Bland AI
- **Telephony**: Twilio
- **Payments**: Stripe
- **Hosting**: Vercel
- **Email**: Resend
- **SMS**: Twilio

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Bland AI API key
- Twilio account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/newvantageco/NVC-Labs-.git
cd nvc-labs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- Supabase URL and keys
- Bland AI API key
- Twilio credentials
- Stripe keys

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
nvc-labs/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/        # Authentication routes
│   │   ├── (dashboard)/   # Protected dashboard routes
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── auth/         # Auth-related components
│   │   └── dashboard/    # Dashboard components
│   ├── lib/              # Utility functions and configurations
│   │   ├── supabase/     # Supabase client and helpers
│   │   ├── bland-ai/     # Bland AI integration
│   │   ├── twilio/       # Twilio integration
│   │   └── stripe/       # Stripe integration
│   └── types/            # TypeScript type definitions
├── public/               # Static files
└── supabase/            # Supabase migrations and config
```

## 🔑 Core Features (MVP)

### Phase 1 - Foundation (Weeks 1-4)
- [x] Project scaffold: Next.js + Supabase + Vercel setup
- [ ] Practice auth: sign up, login, account management
- [ ] Patient list: CSV upload, validation, storage
- [ ] Bland AI integration: outbound call trigger with custom script
- [ ] Twilio: UK number, call routing, webhooks
- [ ] Basic dashboard: call outcomes, conversion rate
- [ ] Stripe: subscription billing setup

### Phase 2 - Pilot Launch (Weeks 5-8)
- [ ] SMS confirmation via Twilio after booking
- [ ] Google Calendar integration for auto-booking
- [ ] Retry logic: 3 attempts over 48 hours for no-answers
- [ ] Opt-out management and GDPR compliance layer
- [ ] PDF report download from dashboard
- [ ] Onboard 2-3 pilot practices

### Phase 3 - Scale & Expand (Months 3-6)
- [ ] Multi-location dashboard for small groups
- [ ] Practice management software API integration (Optix, Optisoft)
- [ ] Inbound call handling (patients calling back)
- [ ] Advanced analytics: cohort recall rates, revenue recovered
- [ ] White-label option for optical buying groups

## 💳 Pricing Plans

| Plan | Price | Calls/Month | Locations | Support |
|------|-------|-------------|-----------|---------|
| **Starter** | £149/mo | 500 | 1 | Email |
| **Growth** | £299/mo | 2,000 | 3 | Priority |
| **Scale** | £549/mo | Unlimited | Unlimited | Dedicated |

**Setup Fee**: £199 one-time (script customization, onboarding, first campaign)

**Overage**: £0.08 per call over plan limit

**Pilot Offer**: First 3 practices get 50% off for 3 months in exchange for testimonial

## 🔒 GDPR & Compliance

- All patient data stored in UK/EU Supabase region
- Row-level security: practices can only access their own patients
- Opt-out honored immediately and permanently
- Data Processing Agreements (DPAs) required before go-live
- ICO-compliant call disclosure at start of every call
- Data retention: patient records deleted within 30 days on request

## 📊 Success Metrics

- **Call Answer Rate**: Target >35%
- **Booking Conversion**: Target 15-25% of answered calls
- **Pilot NPS**: Target >8/10
- **Time to First Call**: <24 hours from onboarding
- **ARR at 6 months**: £60,000 (≈20 paying practices)

## 📝 License

Proprietary - All rights reserved by NVC Labs

## 🤝 Contact

For questions or support, contact: [Your contact info]

---

**Built with ❤️ for UK Opticians**
