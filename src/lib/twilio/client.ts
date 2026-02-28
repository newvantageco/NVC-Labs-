/**
 * Twilio SMS Client
 * Sends booking confirmations and notifications to patients
 */

import twilio from 'twilio'

let twilioClient: ReturnType<typeof twilio> | null = null

/**
 * Get Twilio client (singleton)
 */
function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured')
    }

    twilioClient = twilio(accountSid, authToken)
  }

  return twilioClient
}

export interface BookingConfirmationOptions {
  to: string
  practiceName: string
  appointmentDate?: string
  bookingUrl: string
}

/**
 * Send booking confirmation SMS to patient
 */
export async function sendBookingConfirmation(options: BookingConfirmationOptions) {
  try {
    const client = getTwilioClient()
    const from = process.env.TWILIO_PHONE_NUMBER

    if (!from) {
      throw new Error('TWILIO_PHONE_NUMBER not configured')
    }

    const message = options.appointmentDate
      ? `Thank you for booking with ${options.practiceName}! Your appointment is confirmed for ${options.appointmentDate}. View details: ${options.bookingUrl}`
      : `Thank you for booking with ${options.practiceName}! Your appointment is confirmed. View booking details: ${options.bookingUrl}`

    const result = await client.messages.create({
      body: message,
      from: from,
      to: options.to,
    })

    return {
      success: true,
      sid: result.sid,
      status: result.status,
    }

  } catch (error) {
    console.error('Twilio SMS error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export interface ReminderSMSOptions {
  to: string
  practiceName: string
  appointmentDate: string
  appointmentTime: string
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminder(options: ReminderSMSOptions) {
  try {
    const client = getTwilioClient()
    const from = process.env.TWILIO_PHONE_NUMBER

    if (!from) {
      throw new Error('TWILIO_PHONE_NUMBER not configured')
    }

    const message = `Reminder: You have an appointment at ${options.practiceName} on ${options.appointmentDate} at ${options.appointmentTime}. Please call if you need to reschedule.`

    const result = await client.messages.create({
      body: message,
      from: from,
      to: options.to,
    })

    return {
      success: true,
      sid: result.sid,
    }

  } catch (error) {
    console.error('Twilio reminder SMS error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export interface OptOutSMSOptions {
  to: string
  practiceName: string
}

/**
 * Send opt-out confirmation SMS
 */
export async function sendOptOutConfirmation(options: OptOutSMSOptions) {
  try {
    const client = getTwilioClient()
    const from = process.env.TWILIO_PHONE_NUMBER

    if (!from) {
      throw new Error('TWILIO_PHONE_NUMBER not configured')
    }

    const message = `You have been successfully removed from ${options.practiceName}'s recall list. You will not receive further automated calls. To opt back in, please contact the practice directly.`

    const result = await client.messages.create({
      body: message,
      from: from,
      to: options.to,
    })

    return {
      success: true,
      sid: result.sid,
    }

  } catch (error) {
    console.error('Twilio opt-out SMS error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
