import { createClient } from '@/lib/supabase/server'
import { batchTriggerCalls } from '@/lib/bland-ai/client'
import { NextResponse } from 'next/server'
import type { RiskCategory } from '@/lib/ai-scripts/clinical-recall-scripts'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaignType } = body as { campaignType: 'high-risk' | 'standard' | 'all' }

    if (!campaignType) {
      return NextResponse.json(
        { error: 'Campaign type is required' },
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

    // Get practice
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (practiceError || !practice) {
      return NextResponse.json(
        { error: 'Practice not found' },
        { status: 404 }
      )
    }

    // Check subscription status
    if (practice.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active. Please activate your subscription to launch campaigns.' },
        { status: 403 }
      )
    }

    // Check if within call limit
    if (practice.calls_used_this_month >= practice.monthly_call_limit) {
      return NextResponse.json(
        {
          error: 'Monthly call limit reached',
          details: {
            used: practice.calls_used_this_month,
            limit: practice.monthly_call_limit,
            message: 'Upgrade your plan or wait until next month to make more calls'
          }
        },
        { status: 403 }
      )
    }

    // Build patient query based on campaign type
    let query = supabase
      .from('patients')
      .select('*')
      .eq('practice_id', practice.id)
      .eq('opted_out', false)

    const today = new Date().toISOString().split('T')[0]

    if (campaignType === 'high-risk') {
      // High-risk patients overdue for clinical reviews
      query = query
        .neq('risk_category', 'standard')
        .lt('next_clinical_due_date', today)
    } else if (campaignType === 'standard') {
      // Standard patients (not high-risk)
      query = query.eq('risk_category', 'standard')
    }
    // 'all' = no additional filters, call everyone

    const { data: patients, error: patientsError } = await query

    if (patientsError) {
      console.error('Error fetching patients:', patientsError)
      return NextResponse.json(
        { error: 'Failed to fetch patients' },
        { status: 500 }
      )
    }

    if (!patients || patients.length === 0) {
      return NextResponse.json(
        { error: 'No patients found for this campaign type' },
        { status: 404 }
      )
    }

    // Check if campaign would exceed call limit
    const remainingCalls = practice.monthly_call_limit - practice.calls_used_this_month
    if (patients.length > remainingCalls) {
      return NextResponse.json(
        {
          error: 'Campaign exceeds monthly call limit',
          details: {
            patients_to_call: patients.length,
            remaining_calls: remainingCalls,
            message: `This campaign would call ${patients.length} patients but you only have ${remainingCalls} calls remaining this month.`
          }
        },
        { status: 403 }
      )
    }

    // Create call_logs entries for all patients (status: 'scheduled')
    const callLogsToInsert = patients.map(patient => ({
      practice_id: practice.id,
      patient_id: patient.id,
      call_status: 'scheduled' as const,
      retry_count: 0,
    }))

    const { data: callLogs, error: callLogsError } = await supabase
      .from('call_logs')
      .insert(callLogsToInsert)
      .select()

    if (callLogsError || !callLogs) {
      console.error('Error creating call logs:', callLogsError)
      return NextResponse.json(
        { error: 'Failed to create call logs' },
        { status: 500 }
      )
    }

    // Prepare calls for Bland AI
    const callsToTrigger = patients.map(patient => ({
      phoneNumber: patient.phone_number,
      firstName: patient.first_name,
      practiceName: practice.practice_name,
      riskCategory: patient.risk_category as RiskCategory,
      patientId: patient.id,
      practiceId: practice.id,
    }))

    // Trigger calls via Bland AI (batched to handle rate limits)
    const results = await batchTriggerCalls(callsToTrigger)

    // Update call_logs with Bland AI call IDs
    const updates = results
      .filter(r => r.success && r.callId)
      .map(r => {
        const callLog = callLogs.find(cl => cl.patient_id === r.patientId)
        return {
          id: callLog?.id,
          call_sid: r.callId,
          call_status: 'calling' as const,
        }
      })

    if (updates.length > 0) {
      await supabase
        .from('call_logs')
        .upsert(updates)
    }

    // Update practice calls_used_this_month
    await supabase
      .from('practices')
      .update({
        calls_used_this_month: practice.calls_used_this_month + results.filter(r => r.success).length
      })
      .eq('id', practice.id)

    // Return success with campaign stats
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: 'Campaign launched successfully',
      campaign: {
        type: campaignType,
        total_patients: patients.length,
        calls_triggered: successful,
        calls_failed: failed,
        estimated_completion: `Calls will be made during your calling hours (${practice.calling_hours_start}-${practice.calling_hours_end})`,
      },
      errors: results
        .filter(r => !r.success)
        .map(r => ({ patientId: r.patientId, error: r.error }))
    })

  } catch (error) {
    console.error('Campaign launch error:', error)
    return NextResponse.json(
      { error: 'Failed to launch campaign' },
      { status: 500 }
    )
  }
}
