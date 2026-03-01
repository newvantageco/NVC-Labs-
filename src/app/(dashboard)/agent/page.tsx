'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AgentIssue {
  id: string
  created_at: string
  severity: string
  issue_type: string
  title: string
  message: string
  affected_users: number
  error_frequency: number
  status: string
  resolved_at: string | null
}

interface AgentConfig {
  autonomy_level: number
  is_active: boolean
  max_deployments_per_day: number
}

export default function AgentDashboard() {
  const [issues, setIssues] = useState<AgentIssue[]>([])
  const [config, setConfig] = useState<AgentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_issues: 0,
    resolved_today: 0,
    avg_resolution_time: 0,
  })

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    // Load issues
    const { data: issuesData } = await supabase
      .from('agent_issues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (issuesData) {
      setIssues(issuesData)
    }

    // Load config
    const { data: configData } = await supabase
      .from('agent_config')
      .select('*')
      .single()

    if (configData) {
      setConfig(configData)
    }

    // Calculate stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayResolved } = await supabase
      .from('agent_issues')
      .select('id')
      .eq('status', 'resolved')
      .gte('resolved_at', today.toISOString())

    setStats({
      total_issues: issuesData?.length || 0,
      resolved_today: todayResolved?.length || 0,
      avg_resolution_time: 12, // Calculate from data
    })

    setLoading(false)
  }

  const toggleAgent = async () => {
    if (!config) return

    const supabase = createClient()
    const { error } = await supabase
      .from('agent_config')
      .update({ is_active: !config.is_active })
      .eq('id', config.id)

    if (!error) {
      setConfig({ ...config, is_active: !config.is_active })
    }
  }

  const changeAutonomyLevel = async (level: number) => {
    if (!config) return

    const supabase = createClient()
    const { error } = await supabase
      .from('agent_config')
      .update({ autonomy_level: level })
      .eq('id', config.id)

    if (!error) {
      setConfig({ ...config, autonomy_level: level })
    }
  }

  if (loading) {
    return <div className="p-8">Loading agent dashboard...</div>
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'P0':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'P1':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'P2':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'P3':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'P4':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'fixing':
      case 'deploying':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Autonomous Agent</h1>
        <p className="mt-2 text-gray-600">
          AI-powered monitoring, troubleshooting, and auto-fixing system
        </p>
      </div>

      {/* Agent Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-4 h-4 rounded-full ${
                config?.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}
            ></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Agent Status: {config?.is_active ? 'Active' : 'Paused'}
              </h2>
              <p className="text-sm text-gray-600">
                Autonomy Level {config?.autonomy_level} -{' '}
                {config?.autonomy_level === 1 && 'Monitor Only'}
                {config?.autonomy_level === 2 && 'Auto-Fix Low Risk'}
                {config?.autonomy_level === 3 && 'Full Autonomy'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleAgent}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              config?.is_active
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {config?.is_active ? 'Pause Agent' : 'Activate Agent'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-gray-900">{stats.total_issues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">{stats.resolved_today}</div>
            <div className="text-sm text-gray-600">Resolved Today</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600">{stats.avg_resolution_time}m</div>
            <div className="text-sm text-gray-600">Avg Resolution Time</div>
          </div>
        </div>
      </div>

      {/* Autonomy Level Control */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Autonomy Level</h3>
        <div className="space-y-3">
          {[
            {
              level: 1,
              title: 'Level 1: Monitor Only',
              description: 'Agent detects and reports issues. Human approval required for all fixes.',
            },
            {
              level: 2,
              title: 'Level 2: Auto-Fix Low Risk',
              description: 'Agent automatically fixes P2-P4 issues. Human approval for P0-P1.',
            },
            {
              level: 3,
              title: 'Level 3: Full Autonomy',
              description: 'Agent handles everything autonomously. Notifies after deployment.',
            },
          ].map((option) => (
            <button
              key={option.level}
              onClick={() => changeAutonomyLevel(option.level)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                config?.autonomy_level === option.level
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{option.title}</div>
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Issues */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Issues</h3>
        <div className="space-y-3">
          {issues.length === 0 ? (
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
              <p className="font-medium">No issues detected</p>
              <p className="text-sm mt-1">All systems operating normally</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(
                        issue.severity
                      )}`}
                    >
                      {issue.severity}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        issue.status
                      )}`}
                    >
                      {issue.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(issue.created_at).toLocaleString()}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{issue.message}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    👥 {issue.affected_users === -1 ? 'All users' : `${issue.affected_users} users`}
                  </span>
                  <span>🔄 {issue.error_frequency}x occurrences</span>
                  <span>📦 {issue.issue_type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
