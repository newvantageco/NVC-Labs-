import { createClient } from '@/lib/supabase/server'
import { constructWebhookEvent, PLAN_DETAILS, type PlanTier } from '@/lib/stripe/client'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

/**
 * Stripe Webhook Handler
 * Receives events when subscriptions are created, updated, or canceled
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = constructWebhookEvent(body, signature)

    console.log('Stripe webhook received:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log('Unhandled Stripe event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const practiceId = session.metadata?.practice_id

  if (!practiceId) {
    console.error('No practice_id in checkout session metadata')
    return
  }

  const supabase = createClient()

  // Update practice with Stripe customer ID
  await supabase
    .from('practices')
    .update({
      stripe_customer_id: session.customer as string,
    })
    .eq('id', practiceId)

  console.log('Checkout completed for practice:', practiceId)
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const practiceId = subscription.metadata?.practice_id

  if (!practiceId) {
    console.error('No practice_id in subscription metadata')
    return
  }

  const supabase = createClient()

  // Determine plan tier from price ID
  const priceId = subscription.items.data[0]?.price.id
  const planTier = getPlanTierFromPriceId(priceId)

  if (!planTier) {
    console.error('Unknown price ID:', priceId)
    return
  }

  const planDetails = PLAN_DETAILS[planTier]

  // Update practice subscription status
  await supabase
    .from('practices')
    .update({
      subscription_tier: planTier,
      subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
      monthly_call_limit: planDetails.call_limit,
      stripe_customer_id: subscription.customer as string,
    })
    .eq('id', practiceId)

  console.log('Subscription updated for practice:', practiceId, 'Plan:', planTier, 'Status:', subscription.status)
}

/**
 * Handle subscription deleted (canceled)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const practiceId = subscription.metadata?.practice_id

  if (!practiceId) {
    console.error('No practice_id in subscription metadata')
    return
  }

  const supabase = createClient()

  // Mark subscription as canceled
  await supabase
    .from('practices')
    .update({
      subscription_status: 'cancelled',
    })
    .eq('id', practiceId)

  console.log('Subscription canceled for practice:', practiceId)
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const supabase = createClient()

  // Get practice by stripe_customer_id
  const { data: practice } = await supabase
    .from('practices')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!practice) {
    console.error('No practice found for customer:', customerId)
    return
  }

  // Reset monthly call usage at the start of new billing period
  if (invoice.billing_reason === 'subscription_cycle') {
    await supabase
      .from('practices')
      .update({
        calls_used_this_month: 0,
      })
      .eq('id', practice.id)

    console.log('Monthly call usage reset for practice:', practice.id)
  }

  console.log('Invoice payment succeeded for practice:', practice.id)
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const supabase = createClient()

  // Get practice by stripe_customer_id
  const { data: practice } = await supabase
    .from('practices')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!practice) {
    console.error('No practice found for customer:', customerId)
    return
  }

  // Mark subscription as inactive (Stripe will retry payment)
  await supabase
    .from('practices')
    .update({
      subscription_status: 'inactive',
    })
    .eq('id', practice.id)

  console.log('Invoice payment failed for practice:', practice.id)
  // TODO: Send email notification to practice about failed payment
}

/**
 * Get plan tier from Stripe price ID
 */
function getPlanTierFromPriceId(priceId: string): PlanTier | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return 'starter'
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return 'growth'
  if (priceId === process.env.STRIPE_PRICE_CLINICAL) return 'clinical_compliance'
  return null
}
