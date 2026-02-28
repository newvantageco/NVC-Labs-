'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'practice' | 'calling' | 'integrations' | 'ai-script'>('practice')
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [practiceData, setPracticeData] = useState({
    practiceName: '',
    address: '',
    phoneNumber: '',
    callingHoursStart: '09:00',
    callingHoursEnd: '18:00',
    avgClinicalAppointmentValue: 75,
  })

  const [pmsIntegration, setPmsIntegration] = useState({
    system: 'none',
    apiKey: '',
    apiUrl: '',
    syncEnabled: false,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: practice } = await supabase
      .from('practices')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (practice) {
      setPracticeData({
        practiceName: practice.practice_name,
        address: practice.address,
        phoneNumber: practice.phone_number,
        callingHoursStart: practice.calling_hours_start,
        callingHoursEnd: practice.calling_hours_end,
        avgClinicalAppointmentValue: practice.avg_clinical_appointment_value,
      })
    }
  }

  const saveSettings = async () => {
    setSaveStatus('saving')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('practices')
      .update({
        practice_name: practiceData.practiceName,
        address: practiceData.address,
        phone_number: practiceData.phoneNumber,
        calling_hours_start: practiceData.callingHoursStart,
        calling_hours_end: practiceData.callingHoursEnd,
        avg_clinical_appointment_value: practiceData.avgClinicalAppointmentValue,
      })
      .eq('user_id', user.id)

    if (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your practice settings and integrations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('practice')}
            className={`${
              activeTab === 'practice'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Practice Details
          </button>
          <button
            onClick={() => setActiveTab('calling')}
            className={`${
              activeTab === 'calling'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Calling Hours
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`${
              activeTab === 'integrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('ai-script')}
            className={`${
              activeTab === 'ai-script'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            AI Script
          </button>
        </nav>
      </div>

      {/* Practice Details Tab */}
      {activeTab === 'practice' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Practice Information</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice Name
              </label>
              <input
                type="text"
                value={practiceData.practiceName}
                onChange={(e) => setPracticeData({ ...practiceData, practiceName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice Address
              </label>
              <input
                type="text"
                value={practiceData.address}
                onChange={(e) => setPracticeData({ ...practiceData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice Phone Number
              </label>
              <input
                type="tel"
                value={practiceData.phoneNumber}
                onChange={(e) => setPracticeData({ ...practiceData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Clinical Appointment Value (£)
              </label>
              <input
                type="number"
                value={practiceData.avgClinicalAppointmentValue}
                onChange={(e) => setPracticeData({ ...practiceData, avgClinicalAppointmentValue: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Used to calculate ROI from clinical recalls (diabetic, glaucoma, myopia appointments)
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={saveSettings}
              disabled={saveStatus === 'saving'}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Calling Hours Tab */}
      {activeTab === 'calling' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Calling Hours</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start calling from:
              </label>
              <select
                value={practiceData.callingHoursStart}
                onChange={(e) => setPracticeData({ ...practiceData, callingHoursStart: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={practiceData.callingHoursEnd}
                onChange={(e) => setPracticeData({ ...practiceData, callingHoursEnd: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <strong>Best practices:</strong> We recommend calling between 9am-6pm Monday to Friday for optimal answer rates. Calls automatically skip weekends and bank holidays.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={saveSettings}
              disabled={saveStatus === 'saving'}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Practice Management Software</h2>

            <div className="space-y-4">
              {/* Optix */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">🔗</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Optix</h3>
                      <p className="text-sm text-gray-600">Cloud-based practice management</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Not Connected
                  </span>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Connect Optix
                </button>
              </div>

              {/* Acuitas */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">🔗</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Acuitas (Ocuco)</h3>
                      <p className="text-sm text-gray-600">Comprehensive optical software</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Not Connected
                  </span>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Connect Acuitas
                </button>
              </div>

              {/* Optisoft */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">🔗</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Optisoft</h3>
                      <p className="text-sm text-gray-600">UK optical management system</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Not Connected
                  </span>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Connect Optisoft
                </button>
              </div>

              {/* Sycle */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">🔗</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Sycle</h3>
                      <p className="text-sm text-gray-600">Practice management & EHR</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Not Connected
                  </span>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Connect Sycle
                </button>
              </div>
            </div>

            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-800">
                  <strong>Automatic Sync:</strong> Once connected, patient data will sync automatically every night at 2am. New patients, phone number updates, and appointment history will be kept current.
                </div>
              </div>
            </div>
          </div>

          {/* Google Calendar Integration */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Booking</h2>

            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📅</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Google Calendar</h3>
                    <p className="text-sm text-gray-600">Auto-book appointments when patients confirm</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Not Connected
                </span>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                Connect Google Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Script Tab */}
      {activeTab === 'ai-script' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Call Scripts</h2>

          <p className="text-gray-600 mb-6">
            Customize what the AI says during calls. We've pre-written scripts optimized for each patient type.
          </p>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Diabetic Patient Script</h3>
              <p className="text-sm text-gray-600 mb-4">
                Used for patients marked as "diabetic" risk category
              </p>
              <textarea
                readOnly
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                value={`Hello, is that {firstName}? This is an automated message on behalf of {practiceName}.

We're calling about your diabetic eye health check. Our records show it's been 12 months since your last diabetic eye examination.

Regular eye examinations are especially important for people with diabetes, as diabetic retinopathy can develop without symptoms. Early detection and monitoring help protect your vision.

Press 1 to book your diabetic eye screening now, or press 2 to receive a text message with our booking link.`}
              />
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
                  Customize Script
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Glaucoma Suspect Script</h3>
              <p className="text-sm text-gray-600 mb-4">
                Used for patients with family history or elevated eye pressure
              </p>
              <textarea
                readOnly
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                value={`Hello, is that {firstName}? This is an automated message on behalf of {practiceName}.

We're calling about your glaucoma monitoring appointment. Our records show it's been 12 months since your last pressure check and visual field assessment.

As you have a family history of glaucoma or elevated eye pressure, regular monitoring is important to protect your vision. The College of Optometrists recommends annual checks for patients in your risk category.

Press 1 to book your glaucoma monitoring appointment, or press 2 for a text message with our booking link.`}
              />
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
                  Customize Script
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <strong>Clinical compliance:</strong> These scripts include GOC/FODO-compliant disclosure language and emphasize the medical importance of recalls for better conversion rates.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
