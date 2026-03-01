import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

/**
 * Zapier Action: Upload Patient
 *
 * Allows Zapier to add a patient to NVC Labs from any source
 * (Optix, Google Sheets, Airtable, etc.)
 */
export const POST = withApiAuth(async (request: NextRequest, practiceId: string) => {
  try {
    const body = await request.json()

    // Validate required fields
    const { first_name, last_name, phone_number, last_eye_test_date } = body

    if (!first_name || !last_name || !phone_number) {
      return NextResponse.json(
        { error: 'Missing required fields: first_name, last_name, phone_number' },
        { status: 400 }
      )
    }

    // Validate phone number format (UK format)
    const phoneRegex = /^(\+44|0)[0-9]{9,10}$/
    if (!phoneRegex.test(phone_number.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid UK phone number format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if patient already exists (deduplication)
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('practice_id', practiceId)
      .eq('phone_number', phone_number.replace(/\s/g, ''))
      .maybeSingle()

    if (existingPatient) {
      // Patient exists - update instead of insert
      const { data: updatedPatient, error: updateError } = await supabase
        .from('patients')
        .update({
          first_name,
          last_name,
          last_eye_test_date: last_eye_test_date || null,
          notes: body.notes || null,
        })
        .eq('id', existingPatient.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating patient:', updateError)
        return NextResponse.json(
          { error: 'Failed to update patient' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        action: 'updated',
        patient: updatedPatient,
      })
    }

    // Insert new patient
    const { data: newPatient, error: insertError } = await supabase
      .from('patients')
      .insert({
        practice_id: practiceId,
        first_name,
        last_name,
        phone_number: phone_number.replace(/\s/g, ''),
        last_eye_test_date: last_eye_test_date || null,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting patient:', insertError)
      return NextResponse.json(
        { error: 'Failed to create patient' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      action: 'created',
      patient: newPatient,
    })
  } catch (error) {
    console.error('Zapier action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
