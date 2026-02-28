/**
 * CSV Parser and Validator for Patient Upload
 * Handles UK phone numbers, date formats, and risk categories
 */

export interface CSVRow {
  first_name: string
  last_name: string
  phone_number: string
  last_eye_test_date?: string
  risk_category?: string
  last_clinical_test_date?: string
  clinical_condition_notes?: string
}

export interface ValidationError {
  row: number
  field: string
  message: string
  value: any
}

export interface ParsedCSV {
  valid: CSVRow[]
  errors: ValidationError[]
  skipped: number
}

const VALID_RISK_CATEGORIES = ['standard', 'diabetic', 'glaucoma_suspect', 'myopia_child', 'other_clinical']

/**
 * Parse CSV text into structured data
 */
export function parseCSVText(text: string): string[][] {
  const lines = text.split('\n').filter(line => line.trim())
  return lines.map(line => {
    // Handle quoted fields with commas
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g
    const fields: string[] = []
    let match

    while ((match = regex.exec(line)) !== null) {
      let field = match[1]
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.slice(1, -1).replace(/""/g, '"')
      }
      fields.push(field.trim())
    }

    return fields.filter(f => f !== '')
  })
}

/**
 * Normalize UK phone number to E.164 format
 * Accepts: 07700900123, 07700 900 123, +447700900123, 020 1234 5678
 * Returns: +447700900123 or +442012345678
 */
export function normalizeUKPhoneNumber(phone: string): string | null {
  // Remove all spaces, hyphens, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '')

  // Already in E.164 format
  if (cleaned.startsWith('+44')) {
    return cleaned
  }

  // Remove leading 0 and add +44
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }

  // Mobile numbers (07xxx)
  if (cleaned.startsWith('7') && cleaned.length === 10) {
    return `+44${cleaned}`
  }

  // Landline (020, 0121, etc.)
  if (cleaned.length === 10 || cleaned.length === 11) {
    return `+44${cleaned}`
  }

  // Invalid format
  return null
}

/**
 * Validate date in YYYY-MM-DD format
 */
export function validateDate(dateStr: string): Date | null {
  if (!dateStr) return null

  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return null

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null

  return date
}

/**
 * Validate risk category
 */
export function validateRiskCategory(category: string): string {
  const normalized = category.toLowerCase().trim()

  if (VALID_RISK_CATEGORIES.includes(normalized)) {
    return normalized
  }

  return 'standard' // Default to standard if invalid
}

/**
 * Validate and parse CSV data
 */
export function validateCSVData(rows: string[][]): ParsedCSV {
  const valid: CSVRow[] = []
  const errors: ValidationError[] = []
  let skipped = 0

  if (rows.length === 0) {
    return { valid, errors, skipped }
  }

  // Get headers
  const headers = rows[0].map(h => h.toLowerCase().trim())

  // Validate required headers
  const requiredHeaders = ['first_name', 'last_name', 'phone_number']
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

  if (missingHeaders.length > 0) {
    errors.push({
      row: 0,
      field: 'headers',
      message: `Missing required columns: ${missingHeaders.join(', ')}`,
      value: headers
    })
    return { valid, errors, skipped }
  }

  // Get column indexes
  const getIndex = (name: string) => headers.indexOf(name)
  const firstNameIdx = getIndex('first_name')
  const lastNameIdx = getIndex('last_name')
  const phoneIdx = getIndex('phone_number')
  const lastTestIdx = getIndex('last_eye_test_date')
  const riskIdx = getIndex('risk_category')
  const lastClinicalIdx = getIndex('last_clinical_test_date')
  const clinicalNotesIdx = getIndex('clinical_condition_notes')

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const rowErrors: ValidationError[] = []

    // Skip empty rows
    if (row.every(cell => !cell || cell.trim() === '')) {
      skipped++
      continue
    }

    // Extract fields
    const firstName = row[firstNameIdx]?.trim()
    const lastName = row[lastNameIdx]?.trim()
    const phoneRaw = row[phoneIdx]?.trim()
    const lastTestDate = row[lastTestIdx]?.trim()
    const riskCategory = row[riskIdx]?.trim() || 'standard'
    const lastClinicalDate = row[lastClinicalIdx]?.trim()
    const clinicalNotes = row[clinicalNotesIdx]?.trim()

    // Validate required fields
    if (!firstName) {
      rowErrors.push({
        row: i + 1,
        field: 'first_name',
        message: 'First name is required',
        value: firstName
      })
    }

    if (!lastName) {
      rowErrors.push({
        row: i + 1,
        field: 'last_name',
        message: 'Last name is required',
        value: lastName
      })
    }

    if (!phoneRaw) {
      rowErrors.push({
        row: i + 1,
        field: 'phone_number',
        message: 'Phone number is required',
        value: phoneRaw
      })
    }

    // Validate phone number
    const phoneNumber = phoneRaw ? normalizeUKPhoneNumber(phoneRaw) : null
    if (phoneRaw && !phoneNumber) {
      rowErrors.push({
        row: i + 1,
        field: 'phone_number',
        message: `Invalid UK phone number format: ${phoneRaw}`,
        value: phoneRaw
      })
    }

    // Validate dates
    if (lastTestDate) {
      const date = validateDate(lastTestDate)
      if (!date) {
        rowErrors.push({
          row: i + 1,
          field: 'last_eye_test_date',
          message: `Invalid date format (must be YYYY-MM-DD): ${lastTestDate}`,
          value: lastTestDate
        })
      }
    }

    if (lastClinicalDate) {
      const date = validateDate(lastClinicalDate)
      if (!date) {
        rowErrors.push({
          row: i + 1,
          field: 'last_clinical_test_date',
          message: `Invalid date format (must be YYYY-MM-DD): ${lastClinicalDate}`,
          value: lastClinicalDate
        })
      }
    }

    // If any errors, add to errors list and skip row
    if (rowErrors.length > 0) {
      errors.push(...rowErrors)
      skipped++
      continue
    }

    // All valid - add to valid rows
    valid.push({
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber!,
      last_eye_test_date: lastTestDate || undefined,
      risk_category: validateRiskCategory(riskCategory),
      last_clinical_test_date: lastClinicalDate || undefined,
      clinical_condition_notes: clinicalNotes || undefined,
    })
  }

  return { valid, errors, skipped }
}

/**
 * Main CSV parsing function
 */
export function parseAndValidateCSV(csvText: string): ParsedCSV {
  const rows = parseCSVText(csvText)
  return validateCSVData(rows)
}
