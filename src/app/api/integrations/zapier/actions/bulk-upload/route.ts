import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

/**
 * Zapier Action: Bulk Upload Patients
 *
 * Upload multiple patients at once (useful for initial sync from PMS)
 * Accepts array of patients
 */
export const POST = withApiAuth(async (request: NextRequest, practiceId: string) => {
  try {
    const body = await request.json()

    // Expect { patients: [...] } format
    const { patients } = body

    if (!Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json(
        { error: 'Expected "patients" array in request body' },
        { status: 400 }
      )
    }

    if (patients.length > 500) {
      return NextResponse.json(
        { error: 'Maximum 500 patients per request' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Validate all patients
    const validPatients = []
    const errors = []

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i]

      if (!patient.first_name || !patient.last_name || !patient.phone_number) {
        errors.push({
          index: i,
          error: 'Missing required fields',
          patient,
        })
        continue
      }

      // Clean phone number
      const cleanPhone = patient.phone_number.replace(/\s/g, '')

      validPatients.push({
        practice_id: practiceId,
        first_name: patient.first_name.trim(),
        last_name: patient.last_name.trim(),
        phone_number: cleanPhone,
        last_eye_test_date: patient.last_eye_test_date || null,
        notes: patient.notes || null,
      })
    }

    if (validPatients.length === 0) {
      return NextResponse.json(
        { error: 'No valid patients to upload', errors },
        { status: 400 }
      )
    }

    // Bulk insert with ON CONFLICT to handle duplicates
    const { data: insertedPatients, error: insertError } = await supabase
      .from('patients')
      .upsert(validPatients, {
        onConflict: 'practice_id,phone_number',
        ignoreDuplicates: false,
      })
      .select()

    if (insertError) {
      console.error('Bulk upload error:', insertError)
      return NextResponse.json(
        { error: 'Failed to upload patients', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      uploaded: insertedPatients?.length || 0,
      skipped: patients.length - validPatients.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
