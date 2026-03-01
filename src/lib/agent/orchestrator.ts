import { DetectionAgent } from './detector'
import { DiagnosisAgent } from './diagnosis'
import { FixAgent } from './fixer'
import { DeploymentAgent } from './deployer'
import { createClient } from '@/lib/supabase/server'

/**
 * Agent Orchestrator - Coordinates all agent actions
 * Detection → Diagnosis → Fix → Deploy
 */

export class AgentOrchestrator {
  private detector: DetectionAgent
  private diagnoser: DiagnosisAgent
  private fixer: FixAgent
  private deployer: DeploymentAgent

  constructor() {
    this.detector = new DetectionAgent()
    this.diagnoser = new DiagnosisAgent()
    this.fixer = new FixAgent()
    this.deployer = new DeploymentAgent()
  }

  /**
   * Main orchestration loop - handles full issue lifecycle
   */
  async processIssue(issueId: string): Promise<void> {
    const supabase = await createClient()

    // Get issue details
    const { data: issue } = await supabase
      .from('agent_issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (!issue) {
      throw new Error(`Issue ${issueId} not found`)
    }

    // Get agent configuration
    const { data: config } = await supabase
      .from('agent_config')
      .select('*')
      .single()

    if (!config || !config.is_active) {
      console.log('Agent is not active, skipping')
      return
    }

    try {
      // Step 1: Diagnose
      console.log(`[Agent] Diagnosing issue ${issueId}...`)
      const diagnosis = await this.diagnoser.diagnose(issueId)

      // Check if human approval required based on autonomy level
      if (this.requiresHumanApproval(config, issue, diagnosis)) {
        console.log(`[Agent] Issue ${issueId} requires human approval`)
        await this.sendApprovalRequest(issueId, diagnosis)
        return
      }

      // Step 2: Generate and apply fix
      console.log(`[Agent] Generating fix for issue ${issueId}...`)
      const fixResult = await this.fixer.fix(issueId, diagnosis)

      if (!fixResult.success) {
        throw new Error(`Fix failed: ${fixResult.error}`)
      }

      // Step 3: Deploy
      console.log(`[Agent] Deploying fix for issue ${issueId}...`)
      const deployResult = await this.deployer.deploy(issueId, fixResult.branchName!)

      if (!deployResult.success) {
        throw new Error(`Deployment failed: ${deployResult.error}`)
      }

      // Send success notification
      await this.sendSuccessNotification(issueId, deployResult)

      console.log(`[Agent] Successfully resolved issue ${issueId}`)
    } catch (error: any) {
      console.error(`[Agent] Error processing issue ${issueId}:`, error)

      // Mark issue as failed
      await supabase
        .from('agent_issues')
        .update({
          status: 'failed',
          resolution_notes: error.message,
        })
        .eq('id', issueId)

      // Send failure notification
      await this.sendFailureNotification(issueId, error.message)
    }
  }

  /**
   * Determine if human approval is required
   */
  private requiresHumanApproval(config: any, issue: any, diagnosis: any): boolean {
    // Level 1: Always requires approval
    if (config.autonomy_level === 1) {
      return true
    }

    // Level 2: Requires approval for P0/P1 or if diagnosis recommends it
    if (config.autonomy_level === 2) {
      if (issue.severity === 'P0' || issue.severity === 'P1') {
        return true
      }
      if (diagnosis.requiresHumanApproval) {
        return true
      }
      if (diagnosis.confidence < 0.8) {
        return true
      }
    }

    // Level 3: Only requires approval if diagnosis explicitly says so
    if (config.autonomy_level === 3) {
      return diagnosis.requiresHumanApproval && issue.severity === 'P0'
    }

    return false
  }

  /**
   * Send approval request notification
   */
  private async sendApprovalRequest(issueId: string, diagnosis: any): Promise<void> {
    const supabase = await createClient()

    const { data: config } = await supabase
      .from('agent_config')
      .select('slack_webhook_url')
      .single()

    const { data: issue } = await supabase
      .from('agent_issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (config?.slack_webhook_url) {
      try {
        await fetch(config.slack_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🤖 Agent Fix Awaiting Approval`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `🤖 ${issue.severity}: Fix Ready for Approval`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Issue:* ${issue.title}\n*Root Cause:* ${diagnosis.rootCause}\n*Fix Strategy:* ${diagnosis.fixStrategy}`,
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Confidence:* ${(diagnosis.confidence * 100).toFixed(0)}%`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Estimated Time:* ${diagnosis.estimatedFixTime}m`,
                  },
                ],
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'Review & Approve',
                    },
                    url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agent?issue=${issueId}`,
                    style: 'primary',
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
  }

  /**
   * Send success notification
   */
  private async sendSuccessNotification(issueId: string, deployResult: any): Promise<void> {
    const supabase = await createClient()

    const { data: config } = await supabase
      .from('agent_config')
      .select('slack_webhook_url')
      .single()

    const { data: issue } = await supabase
      .from('agent_issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (config?.slack_webhook_url) {
      try {
        await fetch(config.slack_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `✅ Agent Successfully Fixed Issue`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `✅ Issue Resolved: ${issue.title}`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Root Cause:* ${issue.root_cause}\n*Status:* Deployed to ${deployResult.productionUrl ? 'Production' : 'Staging'}`,
                },
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'View Details',
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
  }

  /**
   * Send failure notification
   */
  private async sendFailureNotification(issueId: string, errorMessage: string): Promise<void> {
    const supabase = await createClient()

    const { data: config } = await supabase
      .from('agent_config')
      .select('slack_webhook_url')
      .single()

    const { data: issue } = await supabase
      .from('agent_issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (config?.slack_webhook_url) {
      try {
        await fetch(config.slack_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `❌ Agent Failed to Fix Issue`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `❌ Agent Failed: ${issue.title}`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Error:* ${errorMessage}\n*Manual intervention required*`,
                },
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'View Issue',
                    },
                    url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agent?issue=${issueId}`,
                    style: 'danger',
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
  }
}
