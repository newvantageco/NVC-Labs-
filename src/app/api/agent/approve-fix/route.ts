import { NextRequest, NextResponse } from 'next/server'
import { DeploymentAgent } from '@/lib/agent/deployer'
import { createClient } from '@/lib/supabase/server'

/**
 * Manual approval endpoint for pending fixes
 * Allows humans to approve or reject agent-proposed fixes
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { issue_id, approved } = body

    if (!issue_id || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: issue_id, approved' },
        { status: 400 }
      )
    }

    // Get issue details
    const { data: issue, error: issueError } = await supabase
      .from('agent_issues')
      .select('*')
      .eq('id', issue_id)
      .single()

    if (issueError || !issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Log approval action
    await supabase.from('agent_actions').insert({
      issue_id,
      action_type: 'deploy',
      status: approved ? 'started' : 'failed',
      details: {
        approved_by: user.email,
        approved_at: new Date().toISOString(),
        approved,
      },
      human_approved: true,
    })

    if (!approved) {
      // Rejection
      await supabase
        .from('agent_issues')
        .update({
          status: 'failed',
          resolution_notes: `Deployment rejected by ${user.email}`,
        })
        .eq('id', issue_id)

      return NextResponse.json({
        success: true,
        message: 'Fix rejected',
      })
    }

    // Approval - proceed with deployment
    const deployer = new DeploymentAgent()
    const result = await deployer.approveAndDeploy(issue_id, true)

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? 'Fix approved and deployed successfully'
        : `Deployment failed: ${result.error}`,
      result,
    })
  } catch (error: any) {
    console.error('Approval endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
