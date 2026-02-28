# Practice Management Software Integrations

NVC Labs integrates with all major UK optometry practice management systems to automatically sync patient data, appointment bookings, and clinical records.

## Supported Systems

### 1. Optix (Cloud-based)

**What is Optix?**
Optix is a cloud-based practice management system popular with modern independent opticians in the UK.

**Integration Capabilities:**
- ✅ Patient data sync (name, phone, address, DOB)
- ✅ Appointment history
- ✅ Clinical records (last eye test date, conditions)
- ✅ Real-time appointment booking
- ✅ Automatic recall date calculation

**How to Connect:**

1. Go to **Settings** → **Integrations** → **Optix**
2. Click **Connect Optix**
3. You'll need your Optix API credentials:
   - API Key (get from Optix Settings → Integrations)
   - Practice ID
4. Click **Authorize** and grant NVC Labs access
5. Data will sync automatically every night at 2am

**What Gets Synced:**
- **From Optix to NVC Labs:** Patient list, phone numbers, last appointment date, clinical conditions
- **From NVC Labs to Optix:** When a patient books via AI call, appointment is automatically created in Optix

**API Documentation:**
- Optix API Docs: https://developer.optix.app

---

### 2. Acuitas (Ocuco)

**What is Acuitas?**
Acuitas is Ocuco's comprehensive optical practice management system, widely used across independent and small chain opticians in the UK.

**Integration Capabilities:**
- ✅ Patient demographics sync
- ✅ Appointment history
- ✅ Clinical exam data
- ✅ Recall management
- ✅ Stock and frame data (for future features)

**How to Connect:**

1. Go to **Settings** → **Integrations** → **Acuitas**
2. Click **Connect Acuitas**
3. Enter your Acuitas server details:
   - Server URL (provided by Ocuco)
   - Database name
   - API Username (created in Acuitas admin panel)
   - API Password
4. Test connection and authorize
5. Initial sync will run immediately, then nightly at 2am

**What Gets Synced:**
- **From Acuitas to NVC Labs:**
  - Patient records with phone numbers
  - Last eye test date
  - Clinical flags (diabetic, glaucoma suspect, etc.)
  - Recall due dates
- **From NVC Labs to Acuitas:**
  - Appointment bookings from AI calls
  - Call outcome notes

**Setup Requirements:**
- Your Acuitas system must be version 8.0 or later
- API access must be enabled (contact Ocuco support if needed)
- You'll need admin access to create API user credentials

**API Documentation:**
- Contact Ocuco support for API access: support@ocuco.com

---

### 3. Optisoft

**What is Optisoft?**
Optisoft is a UK optical management system used by many independent opticians and small groups.

**Integration Capabilities:**
- ✅ Patient records sync
- ✅ Appointment diary integration
- ✅ Recall management
- ✅ Clinical notes access
- ✅ GOC registration verification

**How to Connect:**

1. Go to **Settings** → **Integrations** → **Optisoft**
2. Click **Connect Optisoft**
3. Enter connection details:
   - Optisoft Server IP (usually local network)
   - Database credentials
   - Practice code
4. Install Optisoft Connector (small Windows service that bridges your local Optisoft to NVC Labs cloud)
5. Authorize sync and set preferences

**What Gets Synced:**
- **From Optisoft to NVC Labs:**
  - Patient database with contact details
  - Appointment history
  - Eye test dates and recall intervals
  - Clinical conditions and risk factors
- **From NVC Labs to Optisoft:**
  - Confirmed appointments from AI calls
  - Call attempt logs for patient records

**Special Note:**
Optisoft often runs on local servers, not cloud-based. You'll need to install our lightweight "Optisoft Connector" Windows service to bridge the connection securely.

**Setup Requirements:**
- Windows PC/Server running Optisoft
- Network access to Optisoft database
- Admin rights to install Optisoft Connector service

---

### 4. Sycle

**What is Sycle?**
Sycle is a comprehensive practice management and EHR system used in optometry practices.

**Integration Capabilities:**
- ✅ Patient demographics
- ✅ Appointment scheduling
- ✅ Clinical exam data
- ✅ Recall tracking
- ✅ Insurance/billing data (for future features)

**How to Connect:**

1. Go to **Settings** → **Integrations** → **Sycle**
2. Click **Connect Sycle**
3. Provide Sycle credentials:
   - Sycle account URL
   - API token (generated in Sycle admin)
   - Location ID (if multi-location)
4. Map data fields (one-time setup)
5. Enable auto-sync

**What Gets Synced:**
- **From Sycle to NVC Labs:**
  - Active patient records
  - Phone and mobile numbers
  - Last exam date
  - Recall recommendations
  - Clinical alerts (diabetes, glaucoma risk, etc.)
- **From NVC Labs to Sycle:**
  - Booked appointments with call notes
  - Patient contact attempt history

**API Documentation:**
- Sycle API: https://developer.sycle.net

---

## Generic CSV Export/Import

**Don't use practice management software?**

You can still use NVC Labs! Simply export your patient list to CSV from whatever system you use (Excel, Google Sheets, manual records, etc.).

**Required CSV Format:**
```csv
first_name,last_name,phone_number,last_eye_test_date,risk_category,last_clinical_test_date,clinical_condition_notes
John,Smith,07700900123,2024-01-15,diabetic,2024-01-15,Type 2 diabetes - annual review required
Sarah,Jones,07700900456,2023-06-20,glaucoma_suspect,2023-06-20,Family history glaucoma - IOP 22mmHg
```

**Download Template:**
Go to **Patients** → **Download CSV Template** to get a pre-formatted file with examples.

---

## Data Sync Schedule

All integrations sync automatically:
- **Initial Sync:** Runs immediately after connection
- **Daily Sync:** Every night at 2:00 AM UK time
- **Manual Sync:** Available in Settings → Integrations → "Sync Now" button
- **Real-time Booking:** When AI books an appointment, it's created in your PMS within 60 seconds

---

## Security & GDPR Compliance

**How is your data protected?**

✅ **Encrypted in Transit:** All data transfers use TLS 1.3 encryption
✅ **Encrypted at Rest:** Patient data stored in UK/EU Supabase region with AES-256 encryption
✅ **Row-Level Security:** Your practice can only access your own patients (Supabase RLS)
✅ **API Keys:** Securely stored in environment variables, never exposed to frontend
✅ **Audit Logs:** All data access logged for compliance
✅ **GDPR Compliant:** UK data residency, right to erasure, data portability
✅ **DPA Available:** Data Processing Agreement for practices upon request

**Integration Permissions:**

When you connect a PMS integration, NVC Labs requests:
- **Read:** Patient demographics, appointment history, clinical records
- **Write:** Appointment bookings, call attempt notes
- **No Delete:** We never delete data from your PMS

You can disconnect integrations anytime in Settings.

---

## Troubleshooting

### "Connection Failed" Error

**Optix:**
- Verify your API key is correct (check for typos)
- Ensure API access is enabled in Optix Settings → Integrations
- Check Practice ID matches your Optix account

**Acuitas:**
- Confirm your server URL is accessible from the internet (not behind firewall)
- Verify database name and credentials
- Check API user has correct permissions in Acuitas admin

**Optisoft:**
- Install Optisoft Connector on Windows PC/server running Optisoft
- Check firewall allows outbound HTTPS connections
- Verify database credentials and practice code

**Sycle:**
- Ensure API token hasn't expired
- Confirm Location ID if multi-location practice
- Check Sycle account URL is correct (including https://)

### Data Not Syncing

1. Go to **Settings** → **Integrations**
2. Click **View Sync Log** next to your connected system
3. Check for error messages
4. Try **Sync Now** to force manual sync
5. If issues persist, contact support: support@nvclabs.com

### Duplicate Patients

If you see duplicate patient records after sync:
- NVC Labs matches patients by phone number
- If a patient has multiple phone numbers in your PMS, they may appear as duplicates
- Merge duplicates in **Patients** → click patient → **Merge**

---

## Coming Soon

🔜 **Two-way appointment sync:** Appointments booked in your PMS automatically update NVC Labs
🔜 **SMS notifications from your PMS number:** Confirmation texts come from your practice number
🔜 **Clinical records auto-tagging:** Automatically detect diabetic/glaucoma patients from exam notes
🔜 **Multi-location support:** Manage multiple branches with one NVC Labs account

---

## Need Help?

**Integration Setup Assistance:**
- Email: integrations@nvclabs.com
- Live chat: Available in Settings → Help
- Book a setup call: https://nvclabs.com/book-integration-help

**For PMS-Specific Issues:**
- Optix: contact@optix.app
- Acuitas/Ocuco: support@ocuco.com
- Optisoft: support@optisoft.co.uk
- Sycle: support@sycle.net

---

**Last Updated:** February 2026
