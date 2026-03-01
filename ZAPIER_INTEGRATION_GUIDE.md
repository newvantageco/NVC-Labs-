# NVC Labs - Zapier Integration Guide

Connect NVC Labs with 2,000+ apps using Zapier to automate your patient recall workflow.

---

## 🎯 What You Can Do with Zapier

### Popular Automations:

1. **Auto-import patients from Google Sheets** → NVC Labs
2. **Push NVC Labs appointments** → Optix/Acuitas/Your PMS
3. **Log all AI calls** → Google Sheets or Airtable
4. **Send Slack notifications** when appointments are booked
5. **Create calendar events** when patients confirm
6. **Update CRM** with patient contact attempts

---

## 🔑 Step 1: Get Your API Key

1. Go to **Settings** → **Integrations** in your NVC Labs dashboard
2. Scroll down to **API Keys** section
3. Click **Create Key**
4. Enter a name: `Zapier Integration`
5. **Copy the API key immediately** (it's only shown once!)
6. Store it safely (use a password manager)

Your API key looks like: `nvc_AbCdEfGh1234567890XyZ`

---

## 🔌 Step 2: Connect NVC Labs to Zapier

### For Pre-Built Zaps (Coming Soon):

Once NVC Labs is published on Zapier marketplace:

1. Search for "NVC Labs" in Zapier
2. Click **Connect**
3. Paste your API key
4. Click **Test Connection**

### For Custom Zaps (Available Now):

Use **Webhooks by Zapier** to connect manually:

1. In Zapier, click **Create Zap**
2. Choose your trigger app (e.g., Google Sheets, Optix, etc.)
3. For the action, search: **Webhooks by Zapier**
4. Select **POST** request
5. Enter URL: `https://yourdomain.com/api/integrations/zapier/actions/upload-patient`
6. Add Header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_API_KEY_HERE`

---

## 📥 Use Case 1: Import Patients from Google Sheets

**Goal:** Automatically add patients to NVC Labs from a Google Sheet

### Setup:

1. **Trigger:** Google Sheets → New Row
2. **Action:** Webhooks by Zapier → POST

### Configuration:

**URL:**
```
https://your-nvc-labs-domain.vercel.app/api/integrations/zapier/actions/upload-patient
```

**Headers:**
```json
{
  "Authorization": "Bearer nvc_YOUR_API_KEY_HERE",
  "Content-Type": "application/json"
}
```

**Data (JSON):**
```json
{
  "first_name": "{{First Name}}",
  "last_name": "{{Last Name}}",
  "phone_number": "{{Phone Number}}",
  "last_eye_test_date": "{{Last Eye Test Date}}",
  "notes": "{{Notes}}"
}
```

### Google Sheet Format:

| First Name | Last Name | Phone Number  | Last Eye Test Date | Notes |
|------------|-----------|---------------|-------------------|-------|
| Sarah      | Williams  | 07700900123   | 2023-01-15        | Diabetic |
| James      | Thompson  | 02071234567   | 2022-12-20        | High myopia |

### Test It:

1. Add a new row to your Google Sheet
2. Wait 1-2 minutes
3. Check NVC Labs **Patients** page → patient should appear

---

## 📤 Use Case 2: Push Appointments to Your PMS

**Goal:** When NVC Labs books an appointment, create it in your PMS (Optix, Acuitas, etc.)

### Setup:

1. **Trigger:** Webhooks by Zapier → GET (Retrieve Poll)
2. **Action:** Your PMS → Create Appointment

### Trigger Configuration:

**URL:**
```
https://your-nvc-labs-domain.vercel.app/api/integrations/zapier/triggers/appointments
```

**Headers:**
```json
{
  "Authorization": "Bearer nvc_YOUR_API_KEY_HERE"
}
```

**Polling Frequency:** Every 5 minutes

### Action Configuration (Example for Optix):

Map fields:
- Patient Name → `{{patient_first_name}} {{patient_last_name}}`
- Phone Number → `{{patient_phone}}`
- Appointment Type → `Eye Examination`
- Status → `Booked`

---

## 📊 Use Case 3: Log All Calls to Google Sheets

**Goal:** Track every AI call attempt in a Google Sheet for reporting

### Setup:

1. **Trigger:** Webhooks by Zapier → GET (Retrieve Poll)
   - URL: `https://yourdomain.com/api/integrations/zapier/triggers/appointments`
2. **Action:** Google Sheets → Create Spreadsheet Row

### Google Sheet Columns:

| Timestamp | Patient Name | Phone Number | Outcome | Date |
|-----------|-------------|--------------|---------|------|
| {{booked_at}} | {{patient_first_name}} {{patient_last_name}} | {{patient_phone}} | Booked | {{last_eye_test_date}} |

---

## 🔔 Use Case 4: Slack Notifications

**Goal:** Get notified in Slack every time an appointment is booked

### Setup:

1. **Trigger:** Webhooks by Zapier → GET (Retrieve Poll)
   - URL: `https://yourdomain.com/api/integrations/zapier/triggers/appointments`
2. **Action:** Slack → Send Channel Message

### Slack Message Template:

```
🎉 New Appointment Booked!

Patient: {{patient_first_name}} {{patient_last_name}}
Phone: {{patient_phone}}
Booked At: {{booked_at}}
Last Eye Test: {{last_eye_test_date}}

View in NVC Labs: https://yourdomain.com/dashboard/patients/{{patient_id}}
```

---

## 🛠️ API Reference

### Authentication

All API requests require authentication via header:

```
Authorization: Bearer nvc_YOUR_API_KEY_HERE
```

---

### Endpoint 1: Upload Single Patient

**POST** `/api/integrations/zapier/actions/upload-patient`

**Request Body:**
```json
{
  "first_name": "Sarah",
  "last_name": "Williams",
  "phone_number": "07700900123",
  "last_eye_test_date": "2023-01-15",
  "notes": "Diabetic patient, annual recall"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "action": "created",
  "patient": {
    "id": "uuid-here",
    "first_name": "Sarah",
    "last_name": "Williams",
    "phone_number": "07700900123",
    "last_eye_test_date": "2023-01-15",
    "created_at": "2026-03-01T10:30:00Z"
  }
}
```

**Response (200 Updated - if patient already exists):**
```json
{
  "success": true,
  "action": "updated",
  "patient": { ... }
}
```

**Required Fields:**
- `first_name` (string)
- `last_name` (string)
- `phone_number` (string, UK format)

**Optional Fields:**
- `last_eye_test_date` (ISO date string)
- `notes` (string)

---

### Endpoint 2: Bulk Upload Patients

**POST** `/api/integrations/zapier/actions/bulk-upload`

**Request Body:**
```json
{
  "patients": [
    {
      "first_name": "Sarah",
      "last_name": "Williams",
      "phone_number": "07700900123",
      "last_eye_test_date": "2023-01-15"
    },
    {
      "first_name": "James",
      "last_name": "Thompson",
      "phone_number": "02071234567",
      "last_eye_test_date": "2022-12-20"
    }
  ]
}
```

**Limits:**
- Maximum 500 patients per request
- Duplicates (same phone number) will be updated, not created

**Response (200 OK):**
```json
{
  "success": true,
  "uploaded": 2,
  "skipped": 0,
  "errors": []
}
```

---

### Endpoint 3: Poll for New Appointments (Trigger)

**GET** `/api/integrations/zapier/triggers/appointments`

**Query Parameters:**
- `since` (optional) - ISO timestamp to filter appointments after this time

**Example:**
```
GET /api/integrations/zapier/triggers/appointments?since=2026-03-01T09:00:00Z
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid-call-log-id",
    "booked_at": "2026-03-01T10:30:00Z",
    "patient_first_name": "Sarah",
    "patient_last_name": "Williams",
    "patient_phone": "07700900123",
    "patient_id": "uuid-patient-id",
    "last_eye_test_date": "2023-01-15",
    "created_at": "2026-03-01T10:30:00Z"
  }
]
```

**How Zapier Uses This:**
- Zapier polls this endpoint every 5-15 minutes
- Returns appointments booked since the last poll
- Zapier uses `id` field for deduplication (won't trigger duplicate Zaps)

---

## 🔒 Security Best Practices

1. **Never share your API key publicly** (GitHub, Slack, etc.)
2. **Use a separate API key per integration** (easier to revoke if compromised)
3. **Regenerate keys if compromised** (delete old key, create new one)
4. **Monitor "Last Used" timestamps** in your dashboard
5. **Delete unused API keys** to minimize security surface

---

## 🐛 Troubleshooting

### Error: "Unauthorized" (401)

**Cause:** Invalid or missing API key

**Fix:**
- Check you added `Authorization: Bearer nvc_...` header
- Verify API key is active in Settings → Integrations
- Ensure no extra spaces in the API key

---

### Error: "Missing required fields" (400)

**Cause:** Missing `first_name`, `last_name`, or `phone_number`

**Fix:**
- Check your Zap field mapping
- Ensure Google Sheets columns map correctly
- Phone number must be UK format (+44 or 07...)

---

### Error: "Invalid UK phone number format" (400)

**Cause:** Phone number doesn't match UK format

**Fix:**
- Valid formats: `07700900123`, `+447700900123`, `020 7123 4567`
- Remove country codes other than +44
- Ensure 10-11 digits after country code

---

### Patients Not Appearing in NVC Labs

**Debugging Steps:**

1. Check Zap History in Zapier dashboard
2. Look for red error icons
3. Click error → see full error message
4. Verify API key is still active
5. Test API manually with curl:

```bash
curl -X POST https://yourdomain.com/api/integrations/zapier/actions/upload-patient \
  -H "Authorization: Bearer nvc_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Patient",
    "phone_number": "07700900123"
  }'
```

---

### Appointments Not Triggering Zap

**Debugging Steps:**

1. Verify trigger is set to **Retrieve Poll** (not Catch Hook)
2. Check polling frequency (5-15 minutes)
3. Ensure appointments were booked AFTER Zap was created
4. Test trigger manually in Zapier
5. Check URL is correct and includes `/triggers/appointments`

---

## 💡 Advanced Use Cases

### Multi-Step Zap: PMS → NVC Labs → Slack

**Workflow:**
1. **Trigger:** New lapsed patient in Optix (via Zapier Optix integration)
2. **Action 1:** Upload patient to NVC Labs
3. **Action 2:** Send Slack notification
4. **Action 3:** Add to Google Sheet tracking log

### Scheduled Daily Import

**Workflow:**
1. **Trigger:** Schedule by Zapier → Every day at 8am
2. **Action 1:** Google Sheets → Lookup Rows (get all lapsed patients)
3. **Action 2:** NVC Labs → Bulk Upload
4. **Action 3:** Email report to practice manager

### Two-Way Sync

**Zap 1 (PMS → NVC Labs):**
- Trigger: New patient in PMS
- Action: Upload to NVC Labs

**Zap 2 (NVC Labs → PMS):**
- Trigger: New appointment booked
- Action: Create appointment in PMS

---

## 📞 Support

**Stuck? Need help?**

- Email: support@nvclabs.com
- Include:
  - Screenshot of your Zap configuration
  - Error message (if any)
  - API key name (not the full key!)

**Response Time:** Within 24 hours on weekdays

---

## 🚀 What's Next?

### Coming Soon:

- **Make.com integration** (Zapier alternative)
- **Native Optix plugin** (no Zapier needed)
- **Native Acuitas integration** (direct sync)
- **Pre-built Zap templates** (1-click install)

### Request an Integration:

Missing an integration? Email us: integrations@nvclabs.com

We prioritize integrations based on customer requests!

---

**Last Updated:** March 2026
**API Version:** v1
