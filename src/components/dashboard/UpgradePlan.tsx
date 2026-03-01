'use client'

import { useState } from 'react'

interface UpgradePlanProps {
  currentPlan: 'starter' | 'growth' | 'clinical_compliance'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled'
}

export default function UpgradePlan({ currentPlan, subscriptionStatus }: UpgradePlanProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleUpgrade = async (plan: 'starter' | 'growth' | 'clinical_compliance') => {
    setLoading(true)
    setSelectedPlan(plan)

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        alert(`Failed to start checkout: ${result.error || 'Unknown error'}`)
        setLoading(false)
        setSelectedPlan(null)
        return
      }

      // Redirect to Stripe checkout
      window.location.href = result.url

    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        alert(`Failed to open billing portal: ${result.error || 'Unknown error'}`)
        setLoading(false)
        return
      }

      // Redirect to Stripe customer portal
      window.location.href = result.url

    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
      setLoading(false)
    }
  }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '£149',
      period: '/month',
      features: [
        '500 calls per month',
        '1 practice location',
        'Email support',
        'Basic dashboard',
        'CSV patient upload',
      ],
      cta: 'Get Started',
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '£299',
      period: '/month',
      features: [
        '2,000 calls per month',
        '3 practice locations',
        'Priority support',
        'SMS confirmations',
        'PMS integration ready',
      ],
      cta: 'Upgrade to Growth',
      popular: true,
    },
    {
      id: 'clinical_compliance',
      name: 'Clinical Compliance',
      price: '£349',
      period: '/month',
      features: [
        'Unlimited calls',
        'Unlimited locations',
        'Dedicated support',
        'Compliance PDF reports',
        'GOC audit protection',
        'All integrations',
      ],
      cta: 'Upgrade to Clinical',
    },
  ]

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="mt-2 text-gray-600">
          Select the plan that best fits your practice's needs
        </p>
      </div>

      {subscriptionStatus === 'active' && (
        <div className="mb-6">
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            Manage Billing →
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Change plan, update payment method, or cancel subscription
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border-2 rounded-lg p-6 ${
              plan.id === currentPlan
                ? 'border-blue-500 bg-blue-50'
                : plan.popular
                ? 'border-blue-300'
                : 'border-gray-200'
            } ${plan.popular ? 'relative' : ''}`}
          >
            {plan.popular && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </span>
            )}

            {plan.id === currentPlan && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                Current Plan
              </span>
            )}

            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id as any)}
              disabled={loading || plan.id === currentPlan || subscriptionStatus === 'active'}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {loading && selectedPlan === plan.id ? (
                'Loading...'
              ) : plan.id === currentPlan ? (
                'Current Plan'
              ) : (
                plan.cta
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <strong>Setup Fee:</strong> £199 one-time fee for script customization, onboarding call, and first campaign setup.
            <br />
            <strong>Overage:</strong> £0.08 per call over your monthly limit.
            <br />
            <strong>Pilot Offer:</strong> First 3 practices get 50% off for 3 months in exchange for testimonial.
          </div>
        </div>
      </div>
    </div>
  )
}
