import { createClient } from '@/lib/supabase/server'

/**
 * Detection Agent - Continuously monitors for issues
 * Runs every 5 minutes via cron job
 */

export interface DetectedIssue {
  severity: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  issueType: string
  title: string
  message: string
  stackTrace?: string
  affectedUsers: number
  errorFrequency: number
  context: Record<string, any>
}

export class DetectionAgent {
  /**
   * Main detection loop - scans for issues
   */
  async scan(): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = []

    // 1. Check application health
    const healthIssues = await this.checkHealth()
    issues.push(...healthIssues)

    // 2. Check for API errors in last 5 minutes
    const apiIssues = await this.checkApiErrors()
    issues.push(...apiIssues)

    // 3. Check database performance
    const dbIssues = await this.checkDatabasePerformance()
    issues.push(...dbIssues)

    // 4. Check external API failures (Bland AI, Twilio, Stripe)
    const externalIssues = await this.checkExternalAPIs()
    issues.push(...externalIssues)

    return issues
  }

  /**
   * Check application health endpoint
   */
  private async checkHealth(): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = []

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`, {
        cache: 'no-store',
      })

      const health = await response.json()

      if (health.status === 'unhealthy') {
        issues.push({
          severity: 'P0',
          issueType: 'health_check_failed',
          title: 'Application health check failed',
          message: `Health check returned unhealthy status`,
          affectedUsers: -1, // Affects all users
          errorFrequency: 1,
          context: { healthData: health },
        })
      } else if (health.status === 'degraded') {
        issues.push({
          severity: 'P1',
          issueType: 'performance_degraded',
          title: 'Application performance degraded',
          message: `Health check shows degraded performance`,
          affectedUsers: 0,
          errorFrequency: 1,
          context: { healthData: health },
        })
      }

      // Check response time
      if (health.responseTime > 2000) {
        issues.push({
          severity: 'P2',
          issueType: 'slow_response',
          title: 'Slow health check response',
          message: `Health check took ${health.responseTime}ms (threshold: 2000ms)`,
          affectedUsers: 0,
          errorFrequency: 1,
          context: { responseTime: health.responseTime },
        })
      }
    } catch (error: any) {
      issues.push({
        severity: 'P0',
        issueType: 'health_check_error',
        title: 'Health check endpoint unreachable',
        message: `Failed to reach health check: ${error.message}`,
        affectedUsers: -1,
        errorFrequency: 1,
        context: { error: error.message },
      })
    }

    return issues
  }

  /**
   * Check for API errors in recent logs
   * In production, this would query Vercel/Sentry logs
   */
  private async checkApiErrors(): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = []

    try {
      const supabase = await createClient()

      // Check for failed call attempts in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

      const { data: failedCalls, error } = await supabase
        .from('call_logs')
        .select('id, call_status, practice_id')
        .eq('call_status', 'failed')
        .gte('created_at', fiveMinutesAgo)

      if (!error && failedCalls && failedCalls.length > 5) {
        // More than 5 failed calls in 5 minutes is suspicious
        issues.push({
          severity: 'P1',
          issueType: 'high_call_failure_rate',
          title: 'High AI call failure rate detected',
          message: `${failedCalls.length} calls failed in last 5 minutes`,
          affectedUsers: new Set(failedCalls.map((c) => c.practice_id)).size,
          errorFrequency: failedCalls.length,
          context: { failedCallIds: failedCalls.map((c) => c.id).slice(0, 10) },
        })
      }

      // Check for database query errors
      // In production, this would integrate with error tracking service
    } catch (error: any) {
      console.error('Error checking API errors:', error)
    }

    return issues
  }

  /**
   * Check database performance
   */
  private async checkDatabasePerformance(): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = []

    try {
      const supabase = await createClient()

      // Test a simple query and measure time
      const start = Date.now()
      const { error } = await supabase.from('practices').select('id').limit(1)
      const queryTime = Date.now() - start

      if (error) {
        issues.push({
          severity: 'P0',
          issueType: 'database_error',
          title: 'Database query failed',
          message: `Database error: ${error.message}`,
          affectedUsers: -1,
          errorFrequency: 1,
          context: { error: error.message },
        })
      } else if (queryTime > 1000) {
        issues.push({
          severity: 'P2',
          issueType: 'slow_database',
          title: 'Slow database query detected',
          message: `Simple query took ${queryTime}ms (threshold: 1000ms)`,
          affectedUsers: 0,
          errorFrequency: 1,
          context: { queryTime },
        })
      }
    } catch (error: any) {
      issues.push({
        severity: 'P0',
        issueType: 'database_connection_error',
        title: 'Cannot connect to database',
        message: error.message,
        affectedUsers: -1,
        errorFrequency: 1,
        context: { error: error.message },
      })
    }

    return issues
  }

  /**
   * Check external API health (Bland AI, Twilio, Stripe)
   */
  private async checkExternalAPIs(): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = []

    // Bland AI health check
    if (process.env.BLAND_AI_API_KEY) {
      try {
        const response = await fetch('https://api.bland.ai/v1/health', {
          headers: { Authorization: process.env.BLAND_AI_API_KEY },
        })

        if (!response.ok) {
          issues.push({
            severity: 'P1',
            issueType: 'external_api_down',
            title: 'Bland AI API unavailable',
            message: `Bland AI returned ${response.status}`,
            affectedUsers: -1,
            errorFrequency: 1,
            context: { service: 'Bland AI', status: response.status },
          })
        }
      } catch (error: any) {
        issues.push({
          severity: 'P1',
          issueType: 'external_api_unreachable',
          title: 'Cannot reach Bland AI',
          message: error.message,
          affectedUsers: -1,
          errorFrequency: 1,
          context: { service: 'Bland AI', error: error.message },
        })
      }
    }

    // Add similar checks for Twilio, Stripe if needed

    return issues
  }

  /**
   * Log detected issue to database
   */
  async logIssue(issue: DetectedIssue): Promise<string> {
    const supabase = await createClient()

    // Check if similar issue already exists and is unresolved
    const { data: existingIssues } = await supabase
      .from('agent_issues')
      .select('id')
      .eq('issue_type', issue.issueType)
      .in('status', ['detected', 'diagnosing', 'fixing', 'testing'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingIssues && existingIssues.length > 0) {
      // Update existing issue with new occurrence
      const { data: updated } = await supabase
        .from('agent_issues')
        .update({
          error_frequency: supabase.rpc('increment', { row_id: existingIssues[0].id }),
          last_seen: new Date().toISOString(),
        })
        .eq('id', existingIssues[0].id)
        .select('id')
        .single()

      return existingIssues[0].id
    }

    // Create new issue
    const { data: newIssue, error } = await supabase
      .from('agent_issues')
      .insert({
        severity: issue.severity,
        issue_type: issue.issueType,
        title: issue.title,
        message: issue.message,
        stack_trace: issue.stackTrace,
        affected_users: issue.affectedUsers,
        error_frequency: issue.errorFrequency,
        context: issue.context,
        status: 'detected',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error logging issue:', error)
      throw error
    }

    return newIssue.id
  }
}
