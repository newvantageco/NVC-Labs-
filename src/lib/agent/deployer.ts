import { createClient } from '@/lib/supabase/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Deployment Agent - Handles staging, testing, and production deployment
 */

export interface DeploymentResult {
  issueId: string
  success: boolean
  stagingUrl?: string
  productionUrl?: string
  deployedAt?: string
  rolledBack: boolean
  error?: string
}

export class DeploymentAgent {
  /**
   * Deploy fix through staging → production pipeline
   */
  async deploy(issueId: string, branchName: string): Promise<DeploymentResult> {
    const supabase = await createClient()

    // Log deployment action start
    const { data: action } = await supabase
      .from('agent_actions')
      .insert({
        issue_id: issueId,
        action_type: 'deploy',
        status: 'started',
      })
      .select('id')
      .single()

    try {
      // Step 1: Push to staging branch
      await this.pushToStaging(branchName)

      // Step 2: Wait for Vercel staging deployment
      const stagingUrl = await this.waitForStagingDeployment()

      // Step 3: Monitor staging for issues
      const stagingHealthy = await this.monitorStaging(stagingUrl, 10) // 10 minutes

      if (!stagingHealthy) {
        throw new Error('Staging deployment failed health checks')
      }

      // Step 4: Get autonomy level to decide if auto-promote
      const { data: config } = await supabase
        .from('agent_config')
        .select('autonomy_level, require_staging_approval')
        .single()

      const { data: issue } = await supabase
        .from('agent_issues')
        .select('severity')
        .eq('id', issueId)
        .single()

      // Determine if we need human approval
      const needsApproval =
        config?.autonomy_level === 1 || // Level 1: always needs approval
        (config?.autonomy_level === 2 && ['P0', 'P1'].includes(issue?.severity)) || // Level 2: P0/P1 needs approval
        config?.require_staging_approval

      if (needsApproval) {
        // Mark as pending approval
        await supabase
          .from('agent_issues')
          .update({ status: 'deploying' })
          .eq('id', issueId)

        await supabase
          .from('agent_actions')
          .update({
            status: 'completed',
            details: {
              stagingUrl,
              awaiting_approval: true,
            },
            completed_at: new Date().toISOString(),
          })
          .eq('id', action!.id)

        return {
          issueId,
          success: true,
          stagingUrl,
          rolledBack: false,
        }
      }

      // Step 5: Auto-promote to production (Level 2/3)
      await this.promoteToProduction(branchName)

      // Step 6: Monitor production
      const productionHealthy = await this.monitorProduction(30) // 30 minutes

      if (!productionHealthy) {
        // Rollback!
        await this.rollback(branchName)

        await supabase
          .from('agent_actions')
          .update({
            status: 'completed',
            details: { rolled_back: true, reason: 'Production health checks failed' },
            completed_at: new Date().toISOString(),
          })
          .eq('id', action!.id)

        return {
          issueId,
          success: false,
          rolledBack: true,
          error: 'Production deployment failed, rolled back',
        }
      }

      // Success!
      await supabase
        .from('agent_issues')
        .update({
          status: 'resolved',
          deployed_at: new Date().toISOString(),
          resolved_at: new Date().toISOString(),
        })
        .eq('id', issueId)

      await supabase
        .from('agent_actions')
        .update({
          status: 'completed',
          details: { deployed_to: 'production' },
          completed_at: new Date().toISOString(),
        })
        .eq('id', action!.id)

      return {
        issueId,
        success: true,
        stagingUrl,
        productionUrl: process.env.NEXT_PUBLIC_APP_URL,
        deployedAt: new Date().toISOString(),
        rolledBack: false,
      }
    } catch (error: any) {
      // Log deployment failure
      await supabase
        .from('agent_actions')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', action!.id)

      return {
        issueId,
        success: false,
        rolledBack: false,
        error: error.message,
      }
    }
  }

  /**
   * Push fix branch to staging
   */
  private async pushToStaging(branchName: string): Promise<void> {
    try {
      // Merge fix branch into staging
      await execAsync('git checkout staging || git checkout -b staging')
      await execAsync(`git merge ${branchName} --no-edit`)

      // Push to remote
      await execAsync('git push origin staging')
    } catch (error: any) {
      throw new Error(`Failed to push to staging: ${error.message}`)
    }
  }

  /**
   * Wait for Vercel staging deployment to complete
   */
  private async waitForStagingDeployment(): Promise<string> {
    // In production, use Vercel API to get deployment status
    // For now, construct staging URL
    const stagingUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(
      'https://',
      'https://staging-'
    ) || 'https://staging.nvclabs.com'

    // Wait 60 seconds for deployment
    await new Promise((resolve) => setTimeout(resolve, 60000))

    return stagingUrl
  }

  /**
   * Monitor staging environment for issues
   */
  private async monitorStaging(stagingUrl: string, durationMinutes: number): Promise<boolean> {
    const endTime = Date.now() + durationMinutes * 60 * 1000
    let errorCount = 0

    while (Date.now() < endTime) {
      try {
        // Check health endpoint
        const response = await fetch(`${stagingUrl}/api/health`, {
          cache: 'no-store',
        })

        const health = await response.json()

        if (health.status === 'unhealthy') {
          errorCount++
          if (errorCount >= 3) {
            console.error('Staging health checks failed multiple times')
            return false
          }
        } else {
          errorCount = 0 // Reset on success
        }

        // Wait 1 minute before next check
        await new Promise((resolve) => setTimeout(resolve, 60000))
      } catch (error) {
        console.error('Error checking staging health:', error)
        errorCount++
        if (errorCount >= 3) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Promote staging to production
   */
  private async promoteToProduction(branchName: string): Promise<void> {
    try {
      // Merge staging into main
      await execAsync('git checkout main')
      await execAsync('git pull origin main')
      await execAsync('git merge staging --no-edit')

      // Push to main (triggers production deployment)
      await execAsync('git push origin main')
    } catch (error: any) {
      throw new Error(`Failed to promote to production: ${error.message}`)
    }
  }

  /**
   * Monitor production environment after deployment
   */
  private async monitorProduction(durationMinutes: number): Promise<boolean> {
    const endTime = Date.now() + durationMinutes * 60 * 1000
    let errorCount = 0
    const baselineErrorRate = await this.getErrorRate() // Get current error rate

    while (Date.now() < endTime) {
      try {
        // Check health
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`, {
          cache: 'no-store',
        })

        const health = await response.json()

        if (health.status === 'unhealthy') {
          errorCount++
          if (errorCount >= 2) {
            console.error('Production health checks failing')
            return false
          }
        }

        // Check if error rate increased significantly
        const currentErrorRate = await this.getErrorRate()
        if (currentErrorRate > baselineErrorRate * 1.5) {
          // 50% increase in errors
          console.error('Error rate increased significantly after deployment')
          return false
        }

        // Wait 5 minutes before next check
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000))
      } catch (error) {
        console.error('Error checking production health:', error)
        errorCount++
        if (errorCount >= 2) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Get current error rate from database
   */
  private async getErrorRate(): Promise<number> {
    const supabase = await createClient()

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { count } = await supabase
      .from('call_logs')
      .select('id', { count: 'exact', head: true })
      .eq('call_status', 'failed')
      .gte('created_at', fiveMinutesAgo)

    return count || 0
  }

  /**
   * Rollback to previous version
   */
  private async rollback(branchName: string): Promise<void> {
    try {
      console.log('Rolling back production deployment...')

      // Revert the merge commit
      await execAsync('git checkout main')
      await execAsync('git reset --hard HEAD~1')
      await execAsync('git push origin main --force')

      console.log('Rollback complete')
    } catch (error: any) {
      console.error('Rollback failed:', error.message)
      throw error
    }
  }

  /**
   * Manual approval and promotion to production
   */
  async approveAndDeploy(issueId: string, approved: boolean): Promise<DeploymentResult> {
    if (!approved) {
      // Reject deployment
      const supabase = await createClient()
      await supabase
        .from('agent_issues')
        .update({ status: 'failed', resolution_notes: 'Deployment rejected by human' })
        .eq('id', issueId)

      return {
        issueId,
        success: false,
        rolledBack: false,
        error: 'Deployment rejected',
      }
    }

    // Get branch name from issue
    const supabase = await createClient()
    const { data: issue } = await supabase
      .from('agent_issues')
      .select('fix_branch_name')
      .eq('id', issueId)
      .single()

    if (!issue?.fix_branch_name) {
      throw new Error('Fix branch not found')
    }

    // Continue deployment to production
    await this.promoteToProduction(issue.fix_branch_name)

    const productionHealthy = await this.monitorProduction(30)

    if (!productionHealthy) {
      await this.rollback(issue.fix_branch_name)
      return {
        issueId,
        success: false,
        rolledBack: true,
        error: 'Production health checks failed, rolled back',
      }
    }

    // Mark as resolved
    await supabase
      .from('agent_issues')
      .update({
        status: 'resolved',
        deployed_at: new Date().toISOString(),
        resolved_at: new Date().toISOString(),
      })
      .eq('id', issueId)

    return {
      issueId,
      success: true,
      productionUrl: process.env.NEXT_PUBLIC_APP_URL,
      deployedAt: new Date().toISOString(),
      rolledBack: false,
    }
  }
}
