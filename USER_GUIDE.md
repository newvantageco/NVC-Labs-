# NVC Labs User Guide
## AI Recall Platform for UK Opticians - Complete Guide for Non-Technical Users

Welcome to NVC Labs! This guide will walk you through everything you need to know to start automating your patient recalls with AI.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Uploading Your First Patients](#uploading-patients)
3. [Understanding Risk Categories](#risk-categories)
4. [Launching Your First Campaign](#launching-campaigns)
5. [Understanding the Dashboard](#dashboard)
6. [Settings & Customization](#settings)
7. [GOC/FODO Compliance](#compliance)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started {#getting-started}

### What is NVC Labs?

NVC Labs is an AI-powered system that automatically calls your patients when they're due for eye examinations. It's like having a receptionist working 24/7 to book appointments - but it never gets tired, never forgets, and creates a complete audit trail for GOC compliance.

### What Makes It Special?

✅ **Saves Time:** No more manual recall calls
✅ **GOC Compliant:** Automatic audit trail for high-risk patients (diabetic, glaucoma, myopia)
✅ **Higher Revenue:** Clinical recalls book appointments worth £75-95 vs £15-25 standard
✅ **Better Conversion:** 35-50% of high-risk patients book (vs 15-25% with postcards)
✅ **Easy to Use:** Upload patients, click a button, done

### Your First Login

After creating your account, you'll see the **Onboarding Wizard**. This walks you through:

1. **Practice Details** - Your name, address, phone number
2. **Calling Hours** - When should we call patients? (We recommend 9am-6pm Mon-Fri)
3. **PMS Integration** - Do you use Optix, Acuitas, Optisoft, or Sycle?
4. **Clinical Value** - What do you charge for diabetic/glaucoma appointments? (Average is £75-85)

**Takes 5 minutes, no technical knowledge needed.**

---

## Uploading Your First Patients {#uploading-patients}

### Method 1: CSV Upload (Recommended for First Time)

**Step 1: Download the Template**
1. Go to **Patients** page
2. Click **Download CSV Template**
3. Open the file in Excel or Google Sheets

**Step 2: Add Your Patients**

The template has these columns:

| Column | Required? | Example | What It Means |
|--------|-----------|---------|---------------|
| `first_name` | ✅ Yes | John | Patient's first name |
| `last_name` | ✅ Yes | Smith | Patient's surname |
| `phone_number` | ✅ Yes | 07700900123 | Mobile or landline |
| `last_eye_test_date` | Optional | 2024-01-15 | Date of last test (YYYY-MM-DD) |
| `risk_category` | Optional | diabetic | See Risk Categories below |
| `last_clinical_test_date` | Optional | 2024-01-15 | Date of last clinical exam |
| `clinical_condition_notes` | Optional | Type 2 diabetes | Your internal notes |

**Step 3: Upload the File**
1. Go to **Patients** page
2. **Drag and drop** your CSV file into the upload box (or click "Choose File")
3. Wait for the success message
4. Check the dashboard - your patients are now ready for recalls!

**Common Mistakes to Avoid:**
- ❌ Phone numbers with spaces: `07700 900 123` - **Remove spaces!**
- ❌ Dates in DD/MM/YYYY format - **Must be YYYY-MM-DD**
- ❌ Wrong risk_category spelling: `Diabetic` - **Must be lowercase: `diabetic`**
- ❌ Missing required columns (first_name, last_name, phone_number)

### Method 2: Practice Management Software Sync

If you use Optix, Acuitas, Optisoft, or Sycle:

1. Go to **Settings** → **Integrations**
2. Click **Connect** next to your system
3. Follow the on-screen steps (enter API key, authorize, etc.)
4. First sync happens immediately, then automatically every night at 2am

**Benefits:**
- ✅ Always up to date (automatic nightly sync)
- ✅ No manual CSV uploads
- ✅ Appointments booked by AI automatically appear in your diary

---

## Understanding Risk Categories {#risk-categories}

NVC Labs has **5 patient risk categories**. This determines which AI script they hear and how urgent their recall is.

### 1. **Standard** (Default)
- Regular patients due for routine eye tests
- AI Script: Generic "time for your eye test" message
- Recall Interval: 24 months
- Conversion Rate: ~15-25%
- Appointment Value: £15-25

### 2. **Diabetic** ⭐ Clinical Priority
- Patients with diabetes (Type 1 or Type 2)
- AI Script: "Diabetic eye health check due - early detection protects vision"
- Recall Interval: **12 months** (COO guideline)
- Conversion Rate: ~40-50%
- Appointment Value: £75-95
- **GOC Compliance:** Mandatory recall for duty of care

### 3. **Glaucoma Suspect** ⭐ Clinical Priority
- Family history of glaucoma
- Elevated IOP (ocular hypertension)
- Narrow angles or other risk factors
- AI Script: "Glaucoma monitoring due - pressure check and visual fields recommended"
- Recall Interval: **12 months** (COO guideline)
- Conversion Rate: ~35-45%
- Appointment Value: £85-120
- **GOC Compliance:** Mandatory recall for duty of care

### 4. **Myopia Child** ⭐ Clinical Priority
- Children with myopia progression
- Myopia control patients (atropine, ortho-k, etc.)
- AI Script: "Your child's myopia progression monitoring is due"
- Recall Interval: **6 months**
- Conversion Rate: ~45-55% (parents are proactive)
- Appointment Value: £60-80

### 5. **Other Clinical**
- Any other clinical condition requiring monitoring
- Cataracts, macular degeneration suspects, keratoconus, etc.
- AI Script: Generic clinical recall message
- Recall Interval: Practitioner-determined
- Conversion Rate: ~25-35%
- Appointment Value: £50-75

### How to Set Risk Categories

**Method 1: CSV Upload**
In the `risk_category` column, enter one of these exact values:
- `standard`
- `diabetic`
- `glaucoma_suspect`
- `myopia_child`
- `other_clinical`

**Method 2: Manual Entry** (Coming Soon)
Edit individual patient records in the Patients page.

---

## Launching Your First Campaign {#launching-campaigns}

### What is a Campaign?

A **campaign** is a batch of AI calls to your patients. NVC Labs calls them during your calling hours, automatically retries if no answer, and logs all outcomes.

### Step-by-Step: Launch Your First Campaign

**1. Go to the Calls Page**
Click **Calls** in the navigation menu.

**2. Click "Launch New Campaign"**
A popup will appear with campaign options.

**3. Choose Campaign Type**

You have 3 options:

| Campaign Type | Who Gets Called | Best For |
|---------------|-----------------|----------|
| **High-Risk Clinical Recalls** ⭐ Recommended | Diabetic, glaucoma, myopia patients overdue for reviews | Maximum revenue + GOC compliance |
| **Standard Recall Campaign** | All patients due for routine eye tests | General recall |
| **All Patients** | Everyone | Mass recall for lapsed patients |

**Why We Recommend High-Risk First:**
- ✅ Higher booking rate (35-50% vs 15-25%)
- ✅ Higher value per appointment (£75-95 vs £15-25)
- ✅ GOC compliance protection (duty of care fulfilled)
- ✅ Patients know it's important (medical language = urgency)

**4. Review Campaign Details**

The popup shows:
- **How many patients** will be called
- **Expected conversion rate**
- **Average appointment value**
- **Estimated revenue**

**5. Click "Launch Campaign"**

That's it! NVC Labs takes over from here.

### What Happens Next?

**During Calling Hours (9am-6pm):**
- Our AI calls patients from your practice phone number (via Twilio)
- Patients hear: "Hello [First Name], this is [Your Practice Name] calling about your diabetic eye health check..."
- They can press 1 to book, 2 for SMS link, 3 for callback, or 0 to opt out

**If No Answer:**
- Automatic retry in 4-6 hours
- Up to 3 attempts over 48 hours
- Then marked as "no answer" in logs

**If Patient Books:**
- SMS confirmation sent immediately
- Appointment logged in your dashboard
- If PMS connected, appointment appears in your diary automatically
- You get a notification

**Compliance Audit Trail:**
- Every call logged to `compliance_audit_log` table
- Downloadable PDF reports for GOC inspections
- Shows you attempted recall (protects from negligence claims)

---

## Understanding the Dashboard {#dashboard}

When you log in, the **Dashboard** is your command center.

### Top Section: Key Stats

**Active Patients**
- How many patients you have uploaded (excluding opted-out)

**Total Calls**
- How many AI calls have been made

**Appointments Booked**
- How many patients confirmed bookings via AI call

**Conversion Rate**
- % of answered calls that resulted in bookings
- Industry standard: 15-25% for general recalls
- NVC Labs clinical recalls: 35-50%

### High-Risk Patient Alert (Red Box)

If you have diabetic, glaucoma, or myopia patients **overdue** for clinical reviews, you'll see a red alert box:

**What it shows:**
- Number of high-risk patients overdue
- Breakdown by type (X diabetic, Y glaucoma, Z myopia)
- "Start Clinical Recall Campaign" button
- GOC compliance warning

**Why this matters:**
- GOC/FODO 2026 Clinical Governance Standards require documented recall systems
- If a diabetic patient loses vision and you didn't recall them = potential negligence claim
- NVC Labs creates audit trail proving you attempted recall

**What to do:**
Click **Start Clinical Recall Campaign** → Those patients get called with medical urgency scripts.

### Clinical ROI Calculator (Blue Box)

**Shows you the money:**
- High-risk patients recalled this month
- Appointments booked
- Conversion rate
- Revenue generated vs. standard recalls
- **Revenue Uplift** (usually +250-350%)

**Example:**
- 50 diabetic patients called
- 20 booked (40% conversion)
- £85 average appointment value
- Revenue: **£1,700**
- vs. Standard: £400
- Uplift: **+325%** 🚀

### Recent Calls Table

Shows last 5 calls with:
- Patient name
- Call status (answered, booked, no_answer, etc.)
- Date/time
- Call duration

---

## Settings & Customization {#settings}

Go to **Settings** to customize NVC Labs.

### Practice Details Tab

Update your practice information:
- Practice name (used in AI scripts: "This is [Your Practice] calling...")
- Address
- Phone number
- Average clinical appointment value (for ROI calculator)

### Calling Hours Tab

**When should AI call patients?**
- Start time (default: 09:00)
- End time (default: 18:00)

**Best Practices:**
- 9am-6pm Monday to Friday = highest answer rates
- Avoid calling before 9am (people at work)
- Avoid calling after 6pm (dinner time, low answer rate)
- System automatically skips weekends and bank holidays

### Integrations Tab

**Connect your practice management software:**
- Optix
- Acuitas (Ocuco)
- Optisoft
- Sycle

**Connect Google Calendar:**
- When AI books appointment, it appears in your calendar automatically
- Sends calendar invite to patient

### AI Script Tab

**Customize what the AI says** (Advanced users only)

We've pre-written scripts optimized for conversion rates and GOC compliance:
- Diabetic patient script
- Glaucoma suspect script
- Myopia child script
- Standard recall script

You can view them here. Customization is available, but we recommend keeping the default scripts - they're proven to work.

---

## GOC/FODO Compliance {#compliance}

### Why Compliance Matters

**New 2026 Clinical Governance Standards (published Feb 24, 2026):**
- Healthcare Improvement Scotland + FODO require **documented recall systems**
- Practices must prove they attempted to recall high-risk patients
- Failure to recall = potential GOC complaint + negligence claim

**High-Risk Patients:**
- Diabetic patients: **12-month recall** (COO guideline)
- Glaucoma suspects: **12-month recall** (COO guideline)
- Myopia children: **6-month recall** (best practice)

### How NVC Labs Protects You

✅ **Automatic Audit Trail**
- Every call logged to `compliance_audit_log` database table
- Records: patient name, date/time, call outcome, reason for recall
- Stored securely with UK/EU data residency (GDPR compliant)

✅ **Downloadable Compliance Reports**
- Go to **Dashboard** → **Download Compliance Report**
- PDF showing all high-risk patients and recall attempts
- Use this for GOC inspections or in case of complaints

✅ **Opt-Out Tracking**
- If patient presses 0 to opt out, they're flagged immediately
- Never called again (respects patient wishes)
- Logged for compliance: "Patient opted out on [date]"

✅ **Retry Logic**
- If no answer, system retries 3 times over 48 hours
- Proves you made "reasonable efforts" to contact patient
- Meets GOC "duty of care" standard

✅ **Medical Language in Scripts**
- AI scripts emphasize clinical importance: "diabetic eye health check," "early detection protects vision"
- Increases conversion AND demonstrates you communicated urgency
- Compliance-friendly: "This call may be recorded for quality and compliance purposes"

### What to Do If GOC Asks for Evidence

If you receive a GOC complaint or inspection request:

1. Go to **Dashboard**
2. Click **Download Compliance Report**
3. Select date range (e.g., last 12 months)
4. PDF includes:
   - All high-risk patients in your database
   - Recall attempts made (dates, times, outcomes)
   - Proof of 3-attempt retry logic
   - Opt-out records

Hand this to GOC inspector or include in complaint response.

**This proves you had a system in place and made reasonable efforts to recall patients.**

---

## Troubleshooting {#troubleshooting}

### "No patients showing up after CSV upload"

**Check:**
- ✅ CSV file has required columns: `first_name`, `last_name`, `phone_number`
- ✅ Phone numbers don't have spaces (should be `07700900123` not `07700 900 123`)
- ✅ File is saved as CSV, not Excel (.xls or .xlsx)

**Try:**
- Download template again and copy your data carefully
- Check for error message after upload (red box at top)

### "Campaign launched but no calls being made"

**Check:**
- ✅ It's within your calling hours (default 9am-6pm Mon-Fri)
- ✅ Patients have valid UK phone numbers
- ✅ You have calls remaining in your monthly plan

**Try:**
- Go to **Settings** → **Calling Hours** - adjust if needed
- Wait until calling hours - campaigns queue until 9am if launched outside hours

### "Low answer rate / lots of no-answers"

**Normal answer rates:**
- Landlines: 20-35%
- Mobiles: 30-45%
- High-risk patients: 35-50% (medical urgency)

**Tips to improve:**
- Call mobiles instead of landlines (higher answer rate)
- Call between 10am-12pm or 2pm-4pm (best times)
- Ensure caller ID shows your practice number (set in Twilio)
- Use high-risk scripts (medical language = better answer rate)

### "Conversion rate lower than expected"

**Expected conversion (of answered calls):**
- Standard recalls: 15-25%
- High-risk clinical: 35-50%

**If yours is lower:**
- ✅ Check you're using correct AI script (Settings → AI Script)
- ✅ Verify patients marked as correct risk_category
- ✅ Ensure your practice name is pronounced correctly by AI (we can adjust)
- ✅ Make sure booking link/calendar integration works

### "Patients saying they didn't receive SMS confirmation"

**Check:**
- ✅ Phone number is mobile, not landline (SMS needs mobile)
- ✅ Number is correct in patient record
- ✅ Twilio SMS is enabled (Settings → Integrations)

**Ask patient to:**
- Check spam/junk folder
- Check they didn't block unknown numbers
- Provide alternative number if needed

### "PMS integration not syncing"

**Check:**
- ✅ API credentials are correct
- ✅ Integration status says "Connected" (Settings → Integrations)
- ✅ Last sync time updated recently

**Try:**
- Click **Sync Now** to force manual sync
- Disconnect and reconnect integration
- Check **View Sync Log** for error messages

### "Can't log in / forgot password"

**Reset password:**
1. Go to login page
2. Click "Forgot Password"
3. Enter your email
4. Check inbox for reset link (check spam)
5. Create new password

**Still can't log in:**
- Email: support@nvclabs.com
- We'll help you regain access within 24 hours

---

## Getting Help

### In-App Help
- Click **Help** button (bottom right of any page)
- Live chat with our team (Mon-Fri 9am-6pm)

### Email Support
- General questions: support@nvclabs.com
- Integration help: integrations@nvclabs.com
- Billing questions: billing@nvclabs.com

### Book a Setup Call
- One-on-one setup assistance (free)
- Screen sharing to walk you through
- Book here: https://nvclabs.com/book-setup-call

### Knowledge Base
- Video tutorials: https://nvclabs.com/tutorials
- FAQ: https://nvclabs.com/faq

---

## Next Steps

Now that you know how NVC Labs works:

1. ✅ **Upload your patients** (CSV or PMS integration)
2. ✅ **Review high-risk patient alert** on dashboard
3. ✅ **Launch your first clinical recall campaign**
4. ✅ **Watch appointments book automatically**
5. ✅ **Download compliance report** for GOC records

**Welcome to automated patient recalls. Welcome to NVC Labs.** 🚀

---

**Last Updated:** February 2026
**Version:** 1.0
