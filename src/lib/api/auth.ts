import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

/**
 * Authenticate API requests using API keys
 * Used for Zapier and other external integrations
 */
export async function authenticateApiKey(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid Authorization header',
      status: 401,
    }
  }

  const apiKey = authHeader.replace('Bearer ', '')

  if (!apiKey.startsWith('nvc_')) {
    return {
      authenticated: false,
      error: 'Invalid API key format',
      status: 401,
    }
  }

  try {
    const supabase = await createClient()

    // Lookup API key and get practice_id
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, practice_id, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      return {
        authenticated: false,
        error: 'Invalid or inactive API key',
        status: 401,
      }
    }

    // Update last_used_at timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id)

    return {
      authenticated: true,
      practiceId: keyData.practice_id,
    }
  } catch (error) {
    console.error('API key authentication error:', error)
    return {
      authenticated: false,
      error: 'Authentication failed',
      status: 500,
    }
  }
}

/**
 * Middleware wrapper for API routes that require authentication
 */
export function withApiAuth(
  handler: (request: NextRequest, practiceId: string) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const auth = await authenticateApiKey(request)

    if (!auth.authenticated) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        {
          status: auth.status || 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return handler(request, auth.practiceId!)
  }
}
