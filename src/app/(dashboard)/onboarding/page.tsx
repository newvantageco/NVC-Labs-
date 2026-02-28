'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type OnboardingStep = 'welcome' | 'practice-info' | 'calling-hours' | 'pms-integration' | 'ai-script' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    callingHoursStart: '09:00',
    callingHoursEnd: '18:00',
    pmsSystem: 'none',
    aiScriptCustomization: '',
    avgClinicalAppointmentValue: 75,
  })

  const handleNext = () => {
    const steps: OnboardingStep[] = ['welcome', 'practice-info', 'calling-hours', 'pms-integration', 'ai-script', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: OnboardingStep[] = ['welcome', 'practice-info', 'calling-hours', 'pms-integration', 'ai-script', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update practice settings
    const { error } = await supabase
      .from('practices')
      .update({
        calling_hours_start: formData.callingHoursStart,
        calling_hours_end: formData.callingHoursEnd,
        avg_clinical_appointment_value: formData.avgClinicalAppointmentValue,
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating practice:', error)
      setLoading(false)
      return
    }

    // Redirect to dashboard
    router.push('/dashboard')
    router.refresh()
  }

  const progressPercentage = {
    'welcome': 0,
    'practice-info': 20,
    'calling-hours': 40,
    'pms-integration': 60,
    'ai-script': 80,
    'complete': 100,
  }[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            {progressPercentage}% Complete
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {currentStep === 'welcome' && (
            <div className="text-center">
              <div className="text-6xl mb-6">👋</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to NVC Labs!
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Let's get your AI recall system set up in just 5 minutes.
                We'll walk you through everything step-by-step - no technical knowledge needed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl mb-2">📞</div>
                  <div className="font-semibold text-gray-900">AI Calling</div>
                  <div className="text-sm text-gray-600">Automated patient recalls</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="font-semibold text-gray-900">GOC Compliant</div>
                  <div className="text-sm text-gray-600">Full audit trail</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-semibold text-gray-900">3x Revenue</div>
                  <div className="text-sm text-gray-600">Clinical recalls pay more</div>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Let's Get Started →
              </button>
            </div>
          )}

          {currentStep === 'calling-hours' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                When should we call your patients?
              </h2>
              <p className="text-gray-600 mb-6">
                Set your preferred calling hours. We'll only make calls during these times to respect your patients.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start calling from:
                  </label>
                  <select
                    value={formData.callingHoursStart}
                    onChange={(e) => setFormData({ ...formData, callingHoursStart: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stop calling after:
                  </label>
                  <select
                    value={formData.callingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, callingHoursEnd: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                    })}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <strong>Recommended:</strong> 9am-6pm Monday to Friday for best answer rates.
                      We automatically skip bank holidays.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'pms-integration' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Do you use practice management software?
              </h2>
              <p className="text-gray-600 mb-6">
                We can integrate with your existing system to automatically sync patient data and appointments.
              </p>

              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="pms"
                    value="optix"
                    checked={formData.pmsSystem === 'optix'}
                    onChange={(e) => setFormData({ ...formData, pmsSystem: e.target.value })}
                    className="mr-4 h-5 w-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Optix</div>
                    <div className="text-sm text-gray-600">Cloud-based practice management</div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Supported
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="pms"
                    value="acuitas"
                    checked={formData.pmsSystem === 'acuitas'}
                    onChange={(e) => setFormData({ ...formData, pmsSystem: e.target.value })}
                    className="mr-4 h-5 w-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Acuitas (Ocuco)</div>
                    <div className="text-sm text-gray-600">Comprehensive optical software</div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Supported
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="pms"
                    value="optisoft"
                    checked={formData.pmsSystem === 'optisoft'}
                    onChange={(e) => setFormData({ ...formData, pmsSystem: e.target.value })}
                    className="mr-4 h-5 w-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Optisoft</div>
                    <div className="text-sm text-gray-600">UK optical management system</div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Supported
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="pms"
                    value="sycle"
                    checked={formData.pmsSystem === 'sycle'}
                    onChange={(e) => setFormData({ ...formData, pmsSystem: e.target.value })}
                    className="mr-4 h-5 w-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Sycle</div>
                    <div className="text-sm text-gray-600">Practice management & EHR</div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Supported
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="pms"
                    value="none"
                    checked={formData.pmsSystem === 'none'}
                    onChange={(e) => setFormData({ ...formData, pmsSystem: e.target.value })}
                    className="mr-4 h-5 w-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">None / Manual Upload</div>
                    <div className="text-sm text-gray-600">I'll upload patients via CSV file</div>
                  </div>
                </label>
              </div>

              {formData.pmsSystem !== 'none' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-green-800">
                      Great! We'll set up the integration in the next step. You'll need your {formData.pmsSystem === 'optix' ? 'Optix' : formData.pmsSystem === 'acuitas' ? 'Acuitas' : formData.pmsSystem === 'optisoft' ? 'Optisoft' : 'Sycle'} API credentials.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'ai-script' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What's your average clinical appointment value?
              </h2>
              <p className="text-gray-600 mb-6">
                This helps us calculate your ROI from clinical recalls. Think about what you charge for diabetic eye screening, glaucoma monitoring, or myopia control appointments.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Clinical Appointment Value (£)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-gray-500 text-lg">£</span>
                  <input
                    type="number"
                    value={formData.avgClinicalAppointmentValue}
                    onChange={(e) => setFormData({ ...formData, avgClinicalAppointmentValue: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="75"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setFormData({ ...formData, avgClinicalAppointmentValue: 65 })}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="text-2xl font-bold text-gray-900">£65</div>
                  <div className="text-sm text-gray-600">Basic clinical exam</div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, avgClinicalAppointmentValue: 85 })}
                  className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg"
                >
                  <div className="text-2xl font-bold text-blue-900">£85</div>
                  <div className="text-sm text-blue-700">Most common (recommended)</div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, avgClinicalAppointmentValue: 120 })}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="text-2xl font-bold text-gray-900">£120</div>
                  <div className="text-sm text-gray-600">Premium with OCT</div>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <strong>Typical values:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• Diabetic eye screening with OCT: £75-95</li>
                      <li>• Glaucoma monitoring (visual fields + OCT): £85-120</li>
                      <li>• Myopia control assessment: £60-80</li>
                      <li>• Standard NHS sight test profit: £15-25</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                You're all set!
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Your AI recall system is ready to go. Here's what happens next:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl mb-3">1️⃣</div>
                  <div className="font-semibold text-gray-900 mb-2">Upload Patients</div>
                  <div className="text-sm text-gray-600">
                    Upload your patient list via CSV or connect your practice management software
                  </div>
                </div>
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl mb-3">2️⃣</div>
                  <div className="font-semibold text-gray-900 mb-2">Review High-Risk Patients</div>
                  <div className="text-sm text-gray-600">
                    See which diabetic, glaucoma, or myopia patients need clinical recalls
                  </div>
                </div>
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl mb-3">3️⃣</div>
                  <div className="font-semibold text-gray-900 mb-2">Launch Your First Campaign</div>
                  <div className="text-sm text-gray-600">
                    Click one button and our AI starts calling patients for you
                  </div>
                </div>
              </div>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Go to Dashboard →'}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep !== 'welcome' && currentStep !== 'complete' && (
            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
