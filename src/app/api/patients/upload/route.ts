import { createClient } from '@/lib/supabase/server'
import { parseAndValidateCSV } from '@/lib/utils/csv-parser'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get the CSV file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()

    // Parse and validate CSV
    const { valid, errors, skipped } = parseAndValidateCSV(text)

    // If no valid rows, return error
    if (valid.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid patients found in CSV',
          errors: errors.slice(0, 10), // Return first 10 errors
          total_errors: errors.length,
        },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get practice ID
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (practiceError || !practice) {
      return NextResponse.json(
        { error: 'Practice not found' },
        { status: 404 }
      )
    }

    // Prepare patients for insertion
    const patientsToInsert = valid.map(patient => ({
      practice_id: practice.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      phone_number: patient.phone_number,
      last_eye_test_date: patient.last_eye_test_date || null,
      risk_category: patient.risk_category || 'standard',
      last_clinical_test_date: patient.last_clinical_test_date || null,
      clinical_condition_notes: patient.clinical_condition_notes || null,
    }))

    // Insert patients (upsert to handle duplicates by phone number)
    const { data: insertedPatients, error: insertError } = await supabase
      .from('patients')
      .upsert(patientsToInsert, {
        onConflict: 'practice_id,phone_number',
        ignoreDuplicates: false, // Update if exists
      })
      .select()

    if (insertError) {
      console.error('Error inserting patients:', insertError)
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Return success with stats
    return NextResponse.json({
      success: true,
      message: 'Patients imported successfully',
      stats: {
        total_rows: valid.length + skipped,
        imported: valid.length,
        skipped: skipped,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined, // Return first 5 errors as warning
    })

  } catch (error) {
    console.error('CSV upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    )
  }
}
