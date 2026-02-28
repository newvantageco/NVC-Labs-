'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CallsPage() {
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [campaignType, setCampaignType] = useState<'all' | 'high-risk' | 'standard'>('high-risk')
  const [launching, setLaunching] = useState(false)

  const handleLaunchCampaign = async () => {
    setLaunching(true)
    // TODO: Implement actual campaign launch with Bland AI
    setTimeout(() => {
      setLaunching(false)
      setShowCampaignModal(false)
      alert('Campaign launched successfully! Calls will begin during your calling hours.')
    }, 2000)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Campaigns</h1>
          <p className="mt-2 text-sm text-gray-700">
            Launch automated recall campaigns and track call outcomes
          </p>
        </div>
        <button
          onClick={() => setShowCampaignModal(true)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Launch New Campaign
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Calls</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Answered</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Booked</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Conversion</p>
              <p className="text-2xl font-semibold text-gray-900">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-8 mb-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to launch your first campaign?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Follow these simple steps to start automated patient recalls with our AI calling system
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">1️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Patients</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your patient list via CSV or connect your practice management software
              </p>
              <Link
                href="/patients"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Go to Patients →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">2️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Review High-Risk</h3>
              <p className="text-sm text-gray-600 mb-4">
                Check which diabetic, glaucoma, or myopia patients need recalls
              </p>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Dashboard →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-blue-500">
              <div className="text-3xl mb-3">3️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Launch Campaign</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click the button above to start your AI calling campaign
              </p>
              <button
                onClick={() => setShowCampaignModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Launch Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Campaigns */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Campaign History</h2>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500">No campaigns yet. Launch your first campaign to get started!</p>
        </div>
      </div>

      {/* Campaign Launch Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Launch Recall Campaign</h2>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Campaign Type
                </label>

                <div className="space-y-3">
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    campaignType === 'high-risk' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="campaign-type"
                      value="high-risk"
                      checked={campaignType === 'high-risk'}
                      onChange={(e) => setCampaignType(e.target.value as any)}
                      className="mt-1 mr-4 h-5 w-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-gray-900">High-Risk Clinical Recalls</div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Recommended
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Call diabetic, glaucoma suspect, and myopia patients who are overdue for clinical reviews
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600 font-medium">~0 patients</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-green-600 font-medium">35-50% conversion</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-purple-600 font-medium">£75-95/appt</span>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    campaignType === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="campaign-type"
                      value="standard"
                      checked={campaignType === 'standard'}
                      onChange={(e) => setCampaignType(e.target.value as any)}
                      className="mt-1 mr-4 h-5 w-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Standard Recall Campaign</div>
                      <div className="text-sm text-gray-600 mb-2">
                        Call all patients due for routine eye examinations
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600 font-medium">~0 patients</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-green-600 font-medium">15-25% conversion</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-purple-600 font-medium">£15-25/appt</span>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    campaignType === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="campaign-type"
                      value="all"
                      checked={campaignType === 'all'}
                      onChange={(e) => setCampaignType(e.target.value as any)}
                      className="mt-1 mr-4 h-5 w-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">All Patients</div>
                      <div className="text-sm text-gray-600 mb-2">
                        Call everyone - both clinical and standard recalls
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600 font-medium">~0 patients</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-green-600 font-medium">Mixed conversion</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <strong>How it works:</strong> Our AI will call patients during your calling hours (9am-6pm). If no answer, we'll automatically retry up to 3 times over 48 hours. All calls create a compliance audit trail for GOC/FODO.
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunchCampaign}
                  disabled={launching}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {launching ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Launching...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Launch Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
