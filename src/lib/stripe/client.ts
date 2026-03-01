/**
 * Stripe Client for Subscription Billing
 * Handles subscription checkout, webhooks, and customer portal
 */

import Stripe from 'stripe'

let stripeClient: Stripe | null = null

/**
 * Get Stripe client (singleton)
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    })
  }

  return stripeClient
}

/**
 * Stripe Price IDs for each plan
 * These should be created in Stripe Dashboard first
 */
export const STRIPE_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter',
  growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth',
  clinical_compliance: process.env.STRIPE_PRICE_CLINICAL || 'price_clinical',
}

/**
 * Plan details mapping
 */
export const PLAN_DETAILS = {
  starter: {
    name: 'Starter',
    price: 149,
    currency: 'GBP',
    interval: 'month',
    features: [
      '500 calls per month',
      '1 practice location',
      'Email support',
      'Basic dashboard',
      'CSV patient upload',
    ],
    call_limit: 500,
  },
  growth: {
    name: 'Growth',
    price: 299,
    currency: 'GBP',
    interval: 'month',
    features: [
      '2,000 calls per month',
      '3 practice locations',
      'Priority support',
      'SMS confirmations',
      'PMS integration ready',
    ],
    call_limit: 2000,
  },
  clinical_compliance: {
    name: 'Clinical Compliance',
    price: 349,
    currency: 'GBP',
    interval: 'month',
    features: [
      'Unlimited calls',
      'Unlimited locations',
      'Dedicated support',
      'Compliance PDF reports',
      'GOC audit protection',
      'All integrations',
    ],
    call_limit: 999999,
  },
}

export type PlanTier = keyof typeof PLAN_DETAILS

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(options: {
  priceId: string
  practiceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}) {
  const stripe = getStripeClient()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: options.priceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    customer_email: options.customerEmail,
    metadata: {
      practice_id: options.practiceId,
    },
    subscription_data: {
      metadata: {
        practice_id: options.practiceId,
      },
    },
    allow_promotion_codes: true,
  })

  return session
}

/**
 * Create Stripe customer portal session
 * Allows customers to manage their subscription, payment methods, etc.
 */
export async function createCustomerPortalSession(options: {
  customerId: string
  returnUrl: string
}) {
  const stripe = getStripeClient()

  const session = await stripe.billingPortal.sessions.create({
    customer: options.customerId,
    return_url: options.returnUrl,
  })

  return session
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const stripe = getStripeClient()
  return await stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripeClient()
  return await stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Update subscription (change plan)
 */
export async function updateSubscription(options: {
  subscriptionId: string
  newPriceId: string
}) {
  const stripe = getStripeClient()

  const subscription = await stripe.subscriptions.retrieve(options.subscriptionId)

  return await stripe.subscriptions.update(options.subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: options.newPriceId,
      },
    ],
  })
}

/**
 * Construct webhook event from request
 * Verifies webhook signature for security
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
