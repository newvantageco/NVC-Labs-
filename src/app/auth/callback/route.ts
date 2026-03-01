import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Auth callback route for email verification and magic links
 * Supabase redirects here after user clicks email confirmation link
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=verification_failed`
      )
    }

    // Successfully verified - redirect to dashboard
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
