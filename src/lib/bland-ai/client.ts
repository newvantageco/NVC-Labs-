/**
 * Bland AI API Client
 * Handles AI phone calls for patient recalls
 * Documentation: https://docs.bland.ai
 */

import { generateBlandAIScript, getRecallReason } from '@/lib/ai-scripts/clinical-recall-scripts'
import type { RiskCategory } from '@/lib/ai-scripts/clinical-recall-scripts'

export interface CallOptions {
  phoneNumber: string
  firstName: string
  practiceName: string
  riskCategory: RiskCategory
  patientId: string
  practiceId: string
}

export interface CallResponse {
  success: boolean
  call_id?: string
  status?: string
  error?: string
}

export interface CallStatus {
  call_id: string
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled'
  from: string
  to: string
  duration?: number
  recording_url?: string
  transcripts?: Array<{
    text: string
    user: 'user' | 'assistant'
    created_at: string
  }>
  analysis?: {
    appointment_booked?: boolean
    call_successful?: boolean
    answered?: boolean
  }
}

/**
 * Trigger an AI call via Bland AI
 */
export async function triggerCall(options: CallOptions): Promise<CallResponse> {
  try {
    const apiKey = process.env.BLAND_AI_API_KEY

    if (!apiKey) {
      throw new Error('BLAND_AI_API_KEY not configured')
    }

    // Generate the AI script based on risk category
    const script = generateBlandAIScript(
      options.riskCategory,
      options.practiceName,
      options.firstName
    )

    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: options.phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        task: script,
        voice: 'maya', // Professional UK female voice
        voice_settings: {
          speed: 1.0,
          stability: 0.8,
        },
        model: 'enhanced', // Better quality for medical calls
        max_duration: 5, // 5 minutes max per call
        wait_for_greeting: true, // Wait for person to say hello
        record: true, // Record for compliance
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bland`,
        metadata: {
          patient_id: options.patientId,
          practice_id: options.practiceId,
          risk_category: options.riskCategory,
          recall_reason: getRecallReason(options.riskCategory),
        },
        // Keypad detection
        transfer_phone_number: process.env.TWILIO_PHONE_NUMBER, // If patient presses 9 for live person
        language: 'en-GB', // British English
        pronunciation_guide: [
          // Add practice-specific pronunciations if needed
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to trigger call',
      }
    }

    return {
      success: true,
      call_id: data.call_id,
      status: data.status,
    }

  } catch (error) {
    console.error('Bland AI error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get call status from Bland AI
 */
export async function getCallStatus(callId: string): Promise<CallStatus | null> {
  try {
    const apiKey = process.env.BLAND_AI_API_KEY

    if (!apiKey) {
      throw new Error('BLAND_AI_API_KEY not configured')
    }

    const response = await fetch(`https://api.bland.ai/v1/calls/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data as CallStatus

  } catch (error) {
    console.error('Error fetching call status:', error)
    return null
  }
}

/**
 * Analyze call outcome to determine if appointment was booked
 * Uses AI analysis from Bland AI transcript
 */
export function analyzeCallOutcome(callStatus: CallStatus): {
  status: 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'booked' | 'opted_out' | 'failed'
  appointment_booked: boolean
  should_retry: boolean
} {
  // Call never connected
  if (callStatus.status === 'failed' || callStatus.status === 'canceled') {
    return {
      status: 'failed',
      appointment_booked: false,
      should_retry: false, // Don't retry technical failures
    }
  }

  // No answer
  if (callStatus.status === 'no-answer') {
    return {
      status: 'no_answer',
      appointment_booked: false,
      should_retry: true, // Retry up to 3 times
    }
  }

  // Busy signal
  if (callStatus.status === 'busy') {
    return {
      status: 'busy',
      appointment_booked: false,
      should_retry: true,
    }
  }

  // Call was answered - check AI analysis
  if (callStatus.status === 'completed' && callStatus.analysis) {
    const { appointment_booked, answered } = callStatus.analysis

    // Patient booked appointment
    if (appointment_booked) {
      return {
        status: 'booked',
        appointment_booked: true,
        should_retry: false,
      }
    }

    // Check transcripts for opt-out keywords
    const transcripts = callStatus.transcripts || []
    const userMessages = transcripts
      .filter(t => t.user === 'user')
      .map(t => t.text.toLowerCase())
      .join(' ')

    if (
      userMessages.includes('opt out') ||
      userMessages.includes('remove') ||
      userMessages.includes('stop calling') ||
      userMessages.includes('do not call')
    ) {
      return {
        status: 'opted_out',
        appointment_booked: false,
        should_retry: false,
      }
    }

    // Voicemail detected
    if (!answered || userMessages.includes('voicemail') || userMessages.includes('leave a message')) {
      return {
        status: 'voicemail',
        appointment_booked: false,
        should_retry: true,
      }
    }

    // Answered but didn't book
    return {
      status: 'answered',
      appointment_booked: false,
      should_retry: false, // They answered, don't call again
    }
  }

  // Default: answered
  return {
    status: 'answered',
    appointment_booked: false,
    should_retry: false,
  }
}

/**
 * Batch trigger calls for a campaign
 * Handles rate limiting (max 10 calls/second for Bland AI)
 */
export async function batchTriggerCalls(
  calls: CallOptions[],
  onProgress?: (completed: number, total: number) => void
): Promise<Array<{ patientId: string; success: boolean; callId?: string; error?: string }>> {
  const results: Array<{ patientId: string; success: boolean; callId?: string; error?: string }> = []
  const batchSize = 10 // Process 10 at a time
  const delayBetweenBatches = 1000 // 1 second between batches

  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize)

    // Trigger calls in parallel within batch
    const batchResults = await Promise.all(
      batch.map(async (call) => {
        const result = await triggerCall(call)
        return {
          patientId: call.patientId,
          success: result.success,
          callId: result.call_id,
          error: result.error,
        }
      })
    )

    results.push(...batchResults)

    // Report progress
    if (onProgress) {
      onProgress(results.length, calls.length)
    }

    // Wait before next batch (rate limiting)
    if (i + batchSize < calls.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }

  return results
}
