'use client'

import { useState, useEffect } from 'react'

interface ApiKey {
  id: string
  key_name: string
  api_key_preview: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/settings/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_name: newKeyName }),
      })

      if (response.ok) {
        const data = await response.json()
        setNewApiKey(data.api_key)
        setNewKeyName('')
        fetchApiKeys()
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to create API key')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setCreating(false)
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/settings/api-keys?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchApiKeys()
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('API key copied to clipboard!')
  }

  if (loading) {
    return <div className="text-gray-600">Loading API keys...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
        <p className="text-sm text-gray-600 mt-1">
          Use API keys to connect NVC Labs with Zapier, Make.com, or custom integrations.
        </p>
      </div>

      {/* New API Key Success Modal */}
      {newApiKey && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">Save Your API Key</h4>
              <p className="text-sm text-yellow-800 mb-3">
                This is the only time you'll see this key. Copy it now and store it securely.
              </p>
              <div className="bg-white rounded border border-yellow-300 p-3 font-mono text-sm break-all">
                {newApiKey}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => copyToClipboard(newApiKey)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm font-medium"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setNewApiKey(null)}
                  className="px-4 py-2 bg-white text-gray-700 rounded hover:bg-gray-50 transition text-sm font-medium border border-gray-300"
                >
                  I've Saved It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New API Key */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Create New API Key</h4>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g., Zapier Integration"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={createApiKey}
            disabled={creating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Key'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>

      {/* Existing API Keys */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Your API Keys</h4>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <p className="text-gray-600">No API keys yet</p>
            <p className="text-sm text-gray-500 mt-1">Create one to connect with Zapier or other tools</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">{key.key_name}</div>
                  <div className="text-sm text-gray-500 font-mono mt-1">
                    {key.api_key_preview}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && (
                      <span className="ml-3">
                        Last used: {new Date(key.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteApiKey(key.id)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentation Link */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Need help setting up Zapier?</p>
            <p className="text-blue-700">
              Check out our{' '}
              <a href="/docs/zapier-integration" className="underline font-medium">
                Zapier integration guide
              </a>
              {' '}for step-by-step instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
