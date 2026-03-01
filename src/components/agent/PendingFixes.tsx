'use client'

import { useState } from 'react'

interface PendingFix {
  id: string
  created_at: string
  severity: string
  title: string
  root_cause: string
  fix_strategy: string
  affected_users: number
  confidence: number
}

interface Props {
  pendingFixes: PendingFix[]
  onApprove: (issueId: string, approved: boolean) => Promise<void>
}

export function PendingFixes({ pendingFixes, onApprove }: Props) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleApprove = async (issueId: string, approved: boolean) => {
    setProcessing(issueId)
    try {
      await onApprove(issueId, approved)
    } finally {
      setProcessing(null)
    }
  }

  if (pendingFixes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium">No fixes awaiting approval</p>
          <p className="text-sm mt-1">Agent is running autonomously</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          {pendingFixes.length} awaiting review
        </span>
      </div>

      <div className="space-y-6">
        {pendingFixes.map((fix) => (
          <div key={fix.id} className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-yellow-200 text-yellow-900 rounded text-xs font-bold">
                  {fix.severity}
                </span>
                <h4 className="font-bold text-gray-900">{fix.title}</h4>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(fix.created_at).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">Root Cause:</div>
                <div className="text-sm text-gray-600 bg-white rounded p-3">{fix.root_cause}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">Proposed Fix:</div>
                <div className="text-sm text-gray-600 bg-white rounded p-3">{fix.fix_strategy}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded p-3">
                  <div className="text-xs text-gray-500">AI Confidence</div>
                  <div className="text-lg font-bold text-gray-900">
                    {(fix.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${fix.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-xs text-gray-500">Affected Users</div>
                  <div className="text-lg font-bold text-gray-900">
                    {fix.affected_users === -1 ? 'All users' : fix.affected_users}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(fix.id, true)}
                disabled={processing === fix.id}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === fix.id ? 'Approving...' : '✓ Approve & Deploy'}
              </button>
              <button
                onClick={() => handleApprove(fix.id, false)}
                disabled={processing === fix.id}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === fix.id ? 'Rejecting...' : '✗ Reject Fix'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-yellow-200">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  View Technical Details
                </summary>
                <div className="mt-2 space-y-2 text-xs text-gray-600">
                  <div>
                    <span className="font-semibold">Issue ID:</span> {fix.id}
                  </div>
                  {/* Add more technical details here */}
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
