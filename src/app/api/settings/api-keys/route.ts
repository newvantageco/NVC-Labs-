import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET: List all API keys for the authenticated practice
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get practice ID
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (practiceError || !practice) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 })
    }

    // Fetch API keys (mask the actual key, only show last 4 chars)
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, key_name, created_at, last_used_at, is_active, api_key')
      .eq('practice_id', practice.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      )
    }

    // Mask API keys (show only last 4 characters)
    const maskedKeys = apiKeys?.map((key) => ({
      id: key.id,
      key_name: key.key_name,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      is_active: key.is_active,
      api_key_preview: '•••• ' + key.api_key.slice(-4),
    }))

    return NextResponse.json(maskedKeys || [])
  } catch (error) {
    console.error('API keys GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST: Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get practice ID
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (practiceError || !practice) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 })
    }

    const body = await request.json()
    const { key_name } = body

    if (!key_name || key_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'key_name is required' },
        { status: 400 }
      )
    }

    // Generate API key using database function
    const { data: keyData, error: generateError } = await supabase.rpc(
      'generate_api_key'
    )

    if (generateError || !keyData) {
      console.error('Error generating API key:', generateError)
      return NextResponse.json(
        { error: 'Failed to generate API key' },
        { status: 500 }
      )
    }

    const apiKey = keyData

    // Insert API key
    const { data: newKey, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        practice_id: practice.id,
        key_name: key_name.trim(),
        api_key: apiKey,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting API key:', insertError)
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      )
    }

    // Return the FULL key only on creation (user must save it)
    return NextResponse.json({
      id: newKey.id,
      key_name: newKey.key_name,
      api_key: newKey.api_key, // Full key shown only once
      created_at: newKey.created_at,
      warning: 'Save this API key now. You will not be able to see it again.',
    })
  } catch (error) {
    console.error('API keys POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Delete an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const keyId = url.searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'Missing key ID' }, { status: 400 })
    }

    // Get practice ID
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (practiceError || !practice) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 })
    }

    // Delete API key (RLS ensures user can only delete their own keys)
    const { error: deleteError } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('practice_id', practice.id)

    if (deleteError) {
      console.error('Error deleting API key:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API keys DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
