import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, STRIPE_PRICES } from '@/lib/stripe/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { plan } = body as { plan: 'starter' | 'growth' | 'clinical_compliance' }

    if (!plan || !STRIPE_PRICES[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
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

    // Check if already has active subscription
    if (practice.subscription_status === 'active' && practice.stripe_customer_id) {
      return NextResponse.json(
        {
          error: 'You already have an active subscription',
          message: 'Please go to billing portal to change your plan'
        },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      priceId: STRIPE_PRICES[plan],
      practiceId: practice.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      customerEmail: user.email,
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
