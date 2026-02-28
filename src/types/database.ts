export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      practices: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          practice_name: string
          address: string
          phone_number: string
          nhs_registration_number: string | null
          calling_hours_start: string
          calling_hours_end: string
          ai_script_template: string | null
          booking_url: string | null
          stripe_customer_id: string | null
          subscription_tier: 'starter' | 'growth' | 'scale'
          subscription_status: 'active' | 'inactive' | 'cancelled'
          monthly_call_limit: number
          calls_used_this_month: number
          avg_clinical_appointment_value: number
          track_clinical_revenue: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          practice_name: string
          address: string
          phone_number: string
          nhs_registration_number?: string | null
          calling_hours_start?: string
          calling_hours_end?: string
          ai_script_template?: string | null
          booking_url?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: 'starter' | 'growth' | 'scale'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          monthly_call_limit?: number
          calls_used_this_month?: number
          avg_clinical_appointment_value?: number
          track_clinical_revenue?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          practice_name?: string
          address?: string
          phone_number?: string
          nhs_registration_number?: string | null
          calling_hours_start?: string
          calling_hours_end?: string
          ai_script_template?: string | null
          booking_url?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: 'starter' | 'growth' | 'scale'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          monthly_call_limit?: number
          calls_used_this_month?: number
          avg_clinical_appointment_value?: number
          track_clinical_revenue?: boolean
        }
      }
      patients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          practice_id: string
          first_name: string
          last_name: string
          phone_number: string
          last_eye_test_date: string | null
          opted_out: boolean
          opted_out_at: string | null
          notes: string | null
          risk_category: 'standard' | 'glaucoma_suspect' | 'diabetic' | 'myopia_child' | 'other_clinical'
          last_clinical_test_date: string | null
          next_clinical_due_date: string | null
          clinical_condition_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          practice_id: string
          first_name: string
          last_name: string
          phone_number: string
          last_eye_test_date?: string | null
          opted_out?: boolean
          opted_out_at?: string | null
          notes?: string | null
          risk_category?: 'standard' | 'glaucoma_suspect' | 'diabetic' | 'myopia_child' | 'other_clinical'
          last_clinical_test_date?: string | null
          next_clinical_due_date?: string | null
          clinical_condition_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          practice_id?: string
          first_name?: string
          last_name?: string
          phone_number?: string
          last_eye_test_date?: string | null
          opted_out?: boolean
          opted_out_at?: string | null
          notes?: string | null
          risk_category?: 'standard' | 'glaucoma_suspect' | 'diabetic' | 'myopia_child' | 'other_clinical'
          last_clinical_test_date?: string | null
          next_clinical_due_date?: string | null
          clinical_condition_notes?: string | null
        }
      }
      compliance_audit_log: {
        Row: {
          id: string
          created_at: string
          practice_id: string
          patient_id: string
          recall_reason: string
          attempt_date: string
          outcome: 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'opted_out' | 'booked'
          call_recording_url: string | null
          call_duration_seconds: number | null
          next_action_required: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          practice_id: string
          patient_id: string
          recall_reason: string
          attempt_date?: string
          outcome: 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'opted_out' | 'booked'
          call_recording_url?: string | null
          call_duration_seconds?: number | null
          next_action_required?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          practice_id?: string
          patient_id?: string
          recall_reason?: string
          attempt_date?: string
          outcome?: 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'opted_out' | 'booked'
          call_recording_url?: string | null
          call_duration_seconds?: number | null
          next_action_required?: string | null
          notes?: string | null
        }
      }
      call_logs: {
        Row: {
          id: string
          created_at: string
          practice_id: string
          patient_id: string
          call_status: 'scheduled' | 'calling' | 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'failed' | 'opted_out' | 'booked'
          call_duration_seconds: number | null
          call_sid: string | null
          call_recording_url: string | null
          appointment_booked: boolean
          appointment_booked_at: string | null
          retry_count: number
          next_retry_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          practice_id: string
          patient_id: string
          call_status?: 'scheduled' | 'calling' | 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'failed' | 'opted_out' | 'booked'
          call_duration_seconds?: number | null
          call_sid?: string | null
          call_recording_url?: string | null
          appointment_booked?: boolean
          appointment_booked_at?: string | null
          retry_count?: number
          next_retry_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          practice_id?: string
          patient_id?: string
          call_status?: 'scheduled' | 'calling' | 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'failed' | 'opted_out' | 'booked'
          call_duration_seconds?: number | null
          call_sid?: string | null
          call_recording_url?: string | null
          appointment_booked?: boolean
          appointment_booked_at?: string | null
          retry_count?: number
          next_retry_at?: string | null
          notes?: string | null
        }
      }
    }
  }
}
