import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

/**
 * Zapier Polling Trigger: New Appointment Booked
 *
 * Zapier will poll this endpoint every 5-15 minutes to check for new appointments
 * Returns appointments booked since the last poll
 */
export const GET = withApiAuth(async (request: NextRequest, practiceId: string) => {
  try {
    const supabase = await createClient()

    // Get 'since' parameter for deduplication (Zapier provides this)
    const url = new URL(request.url)
    const since = url.searchParams.get('since') || new Date(Date.now() - 15 * 60 * 1000).toISOString()

    // Fetch appointments booked since the last poll
    const { data: appointments, error } = await supabase
      .from('call_logs')
      .select(`
        id,
        created_at,
        appointment_booked_at,
        patient_id,
        patients (
          id,
          first_name,
          last_name,
          phone_number,
          last_eye_test_date
        )
      `)
      .eq('practice_id', practiceId)
      .eq('appointment_booked', true)
      .gte('appointment_booked_at', since)
      .order('appointment_booked_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    // Format data for Zapier
    const formattedAppointments = appointments.map((apt: any) => ({
      id: apt.id,
      booked_at: apt.appointment_booked_at,
      patient_first_name: apt.patients?.first_name,
      patient_last_name: apt.patients?.last_name,
      patient_phone: apt.patients?.phone_number,
      patient_id: apt.patient_id,
      last_eye_test_date: apt.patients?.last_eye_test_date,
      // Zapier uses 'id' for deduplication
      created_at: apt.appointment_booked_at,
    }))

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error('Zapier trigger error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

/**
 * Test endpoint for Zapier authentication test
 */
export async function POST(request: NextRequest) {
  // Zapier sends a test request during setup
  const auth = await withApiAuth(async () => {
    return NextResponse.json({
      status: 'ok',
      message: 'Authentication successful',
    })
  })(request)

  return auth
}
