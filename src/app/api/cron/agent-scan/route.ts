import { NextRequest, NextResponse } from 'next/server'
import { DetectionAgent } from '@/lib/agent/detector'
import { AgentOrchestrator } from '@/lib/agent/orchestrator'
import { createClient } from '@/lib/supabase/server'

/**
 * Autonomous Agent Cron Job
 * Runs every 5 minutes to scan for issues
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/agent-scan",
 *     "schedule": "*\/5 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (security)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const scanStartTime = Date.now()

  try {
    const supabase = await createClient()

    // Check if agent is active
    const { data: config } = await supabase
      .from('agent_config')
      .select('*')
      .single()

    if (!config || !config.is_active) {
      return NextResponse.json({
        status: 'skipped',
        reason: 'Agent is not active',
      })
    }

    // Run detection agent
    const detector = new DetectionAgent()
    const issues = await detector.scan()

    // Log detected issues
    const loggedIssues = []
    const orchestrator = new AgentOrchestrator()

    for (const issue of issues) {
      try {
        const issueId = await detector.logIssue(issue)
        loggedIssues.push({
          id: issueId,
          severity: issue.severity,
          title: issue.title,
        })

        // Log agent action
        await supabase.from('agent_actions').insert({
          issue_id: issueId,
          action_type: 'detect',
          status: 'completed',
          details: { issue },
          completed_at: new Date().toISOString(),
        })

        // Send notifications for P0/P1 issues
        if (issue.severity === 'P0' || issue.severity === 'P1') {
          await sendNotification(config, issue, issueId)
        }

        // If autonomy level > 1, automatically process the issue
        if (config.autonomy_level > 1) {
          // Process asynchronously (don't block cron job)
          orchestrator.processIssue(issueId).catch((error) => {
            console.error(`Error processing issue ${issueId}:`, error)
          })
        }
      } catch (error) {
        console.error('Error logging issue:', error)
      }
    }

    const scanDuration = Date.now() - scanStartTime

    // Log health check
    await supabase.from('health_checks').insert({
      check_type: 'agent_scan',
      status: 'healthy',
      response_time_ms: scanDuration,
      details: {
        issues_detected: issues.length,
        logged_issues: loggedIssues.length,
      },
    })

    return NextResponse.json({
      status: 'completed',
      scan_duration_ms: scanDuration,
      issues_detected: issues.length,
      issues: loggedIssues,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Agent scan error:', error)

    // Log failed health check
    try {
      const supabase = await createClient()
      await supabase.from('health_checks').insert({
        check_type: 'agent_scan',
        status: 'down',
        error_message: error.message,
        details: { error: error.stack },
      })
    } catch (logError) {
      console.error('Error logging health check:', logError)
    }

    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Send notification about detected issue
 */
async function sendNotification(
  config: any,
  issue: any,
  issueId: string
) {
  // Slack notification
  if (config.slack_webhook_url) {
    try {
      await fetch(config.slack_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${issue.severity} Issue Detected`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `🚨 ${issue.severity}: ${issue.title}`,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Type:*\n${issue.issueType}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Affected Users:*\n${issue.affectedUsers === -1 ? 'All users' : issue.affectedUsers}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Frequency:*\n${issue.errorFrequency} occurrences`,
                },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Message:*\n${issue.message}`,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'View in Dashboard',
                  },
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agent?issue=${issueId}`,
                },
              ],
            },
          ],
        }),
      })
    } catch (error) {
      console.error('Error sending Slack notification:', error)
    }
  }

  // Email notification (implement with SendGrid or similar)
  // if (config.notification_emails && config.notification_emails.length > 0) {
  //   // Send email
  // }
}
