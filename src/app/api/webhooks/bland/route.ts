import { createClient } from '@/lib/supabase/server'
import { analyzeCallOutcome } from '@/lib/bland-ai/client'
import { sendBookingConfirmation } from '@/lib/twilio/client'
import { NextResponse } from 'next/server'
import type { CallStatus } from '@/lib/bland-ai/client'

/**
 * Webhook handler for Bland AI call status updates
 * Called by Bland AI when call completes
 */
export async function POST(request: Request) {
  try {
    const callStatus: CallStatus = await request.json()

    console.log('Bland AI webhook received:', {
      call_id: callStatus.call_id,
      status: callStatus.status,
      to: callStatus.to,
    })

    // Analyze call outcome
    const outcome = analyzeCallOutcome(callStatus)

    // Get metadata from Bland AI (patient_id, practice_id)
    const metadata = (callStatus as any).metadata
    if (!metadata || !metadata.patient_id || !metadata.practice_id) {
      console.error('Missing metadata in Bland AI webhook')
      return NextResponse.json({ received: true })
    }

    const { patient_id, practice_id, risk_category } = metadata

    // Create server-side Supabase client (bypasses RLS for webhooks)
    const supabase = createClient()

    // Find the call_log entry
    const { data: callLog } = await supabase
      .from('call_logs')
      .select('*')
      .eq('patient_id', patient_id)
      .eq('call_sid', callStatus.call_id)
      .single()

    if (!callLog) {
      console.error('Call log not found for call_id:', callStatus.call_id)
      return NextResponse.json({ received: true })
    }

    // Update call_log with outcome
    const updateData: any = {
      call_status: outcome.status,
      call_duration_seconds: callStatus.duration || 0,
      call_recording_url: callStatus.recording_url || null,
      appointment_booked: outcome.appointment_booked,
    }

    // If booked, set appointment time
    if (outcome.appointment_booked) {
      updateData.appointment_booked_at = new Date().toISOString()
    }

    // If should retry, schedule next retry
    if (outcome.should_retry && callLog.retry_count < 3) {
      const hoursUntilRetry = callLog.retry_count === 0 ? 4 : 24 // 4 hours first retry, then 24 hours
      const nextRetry = new Date()
      nextRetry.setHours(nextRetry.getHours() + hoursUntilRetry)

      updateData.next_retry_at = nextRetry.toISOString()
      updateData.retry_count = callLog.retry_count + 1
    }

    await supabase
      .from('call_logs')
      .update(updateData)
      .eq('id', callLog.id)

    // If patient booked, send SMS confirmation
    if (outcome.appointment_booked) {
      // Get patient and practice details
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patient_id)
        .single()

      const { data: practice } = await supabase
        .from('practices')
        .select('*')
        .eq('id', practice_id)
        .single()

      if (patient && practice) {
        // Send SMS confirmation
        await sendBookingConfirmation({
          to: patient.phone_number,
          practiceName: practice.practice_name,
          bookingUrl: practice.booking_url || `${process.env.NEXT_PUBLIC_APP_URL}/book`,
        })

        // Log to compliance_audit_log
        await supabase
          .from('compliance_audit_log')
          .insert({
            practice_id: practice_id,
            patient_id: patient_id,
            recall_reason: metadata.recall_reason || 'Patient recall',
            attempt_date: new Date().toISOString(),
            outcome: 'booked',
            call_duration_seconds: callStatus.duration || 0,
            call_recording_url: callStatus.recording_url || null,
            notes: `Appointment booked via AI call. Call duration: ${callStatus.duration}s`,
          })
      }
    }

    // If opted out, mark patient as opted out
    if (outcome.status === 'opted_out') {
      await supabase
        .from('patients')
        .update({
          opted_out: true,
          opted_out_at: new Date().toISOString(),
        })
        .eq('id', patient_id)

      // Log to compliance
      await supabase
        .from('compliance_audit_log')
        .insert({
          practice_id: practice_id,
          patient_id: patient_id,
          recall_reason: metadata.recall_reason || 'Patient recall',
          attempt_date: new Date().toISOString(),
          outcome: 'opted_out',
          call_duration_seconds: callStatus.duration || 0,
          notes: 'Patient requested to opt out of future calls',
        })
    }

    // Log other outcomes to compliance audit
    if (outcome.status === 'answered' || outcome.status === 'no_answer' || outcome.status === 'voicemail') {
      await supabase
        .from('compliance_audit_log')
        .insert({
          practice_id: practice_id,
          patient_id: patient_id,
          recall_reason: metadata.recall_reason || 'Patient recall',
          attempt_date: new Date().toISOString(),
          outcome: outcome.status,
          call_duration_seconds: callStatus.duration || 0,
          call_recording_url: callStatus.recording_url || null,
          next_action_required: outcome.should_retry ? 'Retry scheduled' : 'No further action',
        })
    }

    return NextResponse.json({ received: true, outcome: outcome.status })

  } catch (error) {
    console.error('Bland AI webhook error:', error)
    // Return 200 anyway so Bland AI doesn't retry
    return NextResponse.json({ received: true, error: 'Processing error' })
  }
}
