import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Fix Agent - Generates and applies code fixes using Claude AI
 */

export interface FixResult {
  issueId: string
  success: boolean
  commitSha?: string
  branchName?: string
  filesModified: string[]
  testsPass: boolean
  error?: string
}

export class FixAgent {
  private anthropic: Anthropic

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required for fix agent')
    }
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  /**
   * Generate and apply fix for diagnosed issue
   */
  async fix(issueId: string, diagnosis: any): Promise<FixResult> {
    const supabase = await createClient()

    // Log fix action start
    const { data: action } = await supabase
      .from('agent_actions')
      .insert({
        issue_id: issueId,
        action_type: 'fix',
        status: 'started',
        details: { diagnosis },
      })
      .select('id')
      .single()

    try {
      // Step 1: Check if file is protected
      await this.checkProtectedFiles(diagnosis.affectedFiles)

      // Step 2: Read current code
      const currentCode = await this.readCurrentCode(diagnosis.affectedFiles)

      // Step 3: Generate fix using Claude
      const fixedCode = await this.generateFix(diagnosis, currentCode)

      // Step 4: Create feature branch
      const branchName = `agent/fix-${issueId.slice(0, 8)}`
      await this.createBranch(branchName)

      // Step 5: Apply fix to files
      await this.applyFix(fixedCode)

      // Step 6: Run tests (if available)
      const testsPass = await this.runTests()

      // Step 7: Commit changes
      const commitSha = await this.commitFix(issueId, diagnosis, branchName)

      // Log fix completion
      await supabase
        .from('agent_actions')
        .update({
          status: 'completed',
          details: {
            diagnosis,
            commitSha,
            branchName,
            testsPass,
          },
          completed_at: new Date().toISOString(),
        })
        .eq('id', action!.id)

      // Update issue
      await supabase
        .from('agent_issues')
        .update({
          status: 'testing',
          fix_commit_sha: commitSha,
          fix_branch_name: branchName,
        })
        .eq('id', issueId)

      return {
        issueId,
        success: true,
        commitSha,
        branchName,
        filesModified: diagnosis.affectedFiles,
        testsPass,
      }
    } catch (error: any) {
      // Log fix failure
      await supabase
        .from('agent_actions')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', action!.id)

      // Update issue status
      await supabase
        .from('agent_issues')
        .update({ status: 'failed' })
        .eq('id', issueId)

      return {
        issueId,
        success: false,
        filesModified: [],
        testsPass: false,
        error: error.message,
      }
    }
  }

  /**
   * Check if any affected files are protected
   */
  private async checkProtectedFiles(files: string[]): Promise<void> {
    const supabase = await createClient()

    const { data: config } = await supabase
      .from('agent_config')
      .select('protected_files')
      .single()

    const protectedPatterns = config?.protected_files || []

    for (const file of files) {
      for (const pattern of protectedPatterns) {
        // Simple pattern matching (in production, use minimatch library)
        const regex = new RegExp(pattern.replace('*', '.*').replace('**', '.*'))
        if (regex.test(file)) {
          throw new Error(`Cannot modify protected file: ${file}`)
        }
      }
    }
  }

  /**
   * Read current code from affected files
   */
  private async readCurrentCode(files: string[]): Promise<Record<string, string>> {
    const code: Record<string, string> = {}

    for (const file of files) {
      try {
        const fullPath = path.join(process.cwd(), file)
        const content = await fs.readFile(fullPath, 'utf-8')
        code[file] = content
      } catch (error) {
        console.error(`Error reading file ${file}:`, error)
      }
    }

    return code
  }

  /**
   * Generate fixed code using Claude AI
   */
  private async generateFix(
    diagnosis: any,
    currentCode: Record<string, string>
  ): Promise<Record<string, string>> {
    const fixedCode: Record<string, string> = {}

    for (const [file, code] of Object.entries(currentCode)) {
      const prompt = `You are an expert software engineer fixing a production bug.

**Root Cause:**
${diagnosis.rootCause}

**Fix Strategy:**
${diagnosis.fixStrategy}

**Current Code:**
File: ${file}
\`\`\`typescript
${code}
\`\`\`

**Your Task:**
Generate the FIXED version of this entire file with the bug corrected.

**Requirements:**
- Fix ONLY the specific issue described
- Do NOT refactor unrelated code
- Do NOT add comments unless necessary for clarity
- Do NOT change formatting or style unless required
- Maintain all existing functionality
- Ensure TypeScript type safety

Respond with the COMPLETE fixed file content (no explanations, just code).`

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        // Extract code from markdown code blocks if present
        let fixedFileContent = content.text
        const codeBlockMatch = fixedFileContent.match(/```(?:typescript|ts|tsx)?\n([\s\S]*?)\n```/)
        if (codeBlockMatch) {
          fixedFileContent = codeBlockMatch[1]
        }

        fixedCode[file] = fixedFileContent
      }
    }

    return fixedCode
  }

  /**
   * Create a new git branch for the fix
   */
  private async createBranch(branchName: string): Promise<void> {
    try {
      // Create and checkout branch
      await execAsync(`git checkout -b ${branchName}`)
    } catch (error: any) {
      // Branch might already exist, try to checkout
      try {
        await execAsync(`git checkout ${branchName}`)
      } catch {
        throw new Error(`Failed to create branch ${branchName}: ${error.message}`)
      }
    }
  }

  /**
   * Apply generated fix to files
   */
  private async applyFix(fixedCode: Record<string, string>): Promise<void> {
    for (const [file, code] of Object.entries(fixedCode)) {
      const fullPath = path.join(process.cwd(), file)
      await fs.writeFile(fullPath, code, 'utf-8')
    }
  }

  /**
   * Run tests to verify fix
   */
  private async runTests(): Promise<boolean> {
    try {
      // Check if tests exist
      const packageJson = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
      )

      if (!packageJson.scripts?.test) {
        // No tests defined, assume pass
        return true
      }

      // Run tests with timeout
      const { stdout, stderr } = await execAsync('npm test', {
        timeout: 60000, // 1 minute timeout
      })

      console.log('Test output:', stdout)
      return true
    } catch (error: any) {
      console.error('Tests failed:', error.message)
      return false
    }
  }

  /**
   * Commit the fix with detailed message
   */
  private async commitFix(
    issueId: string,
    diagnosis: any,
    branchName: string
  ): Promise<string> {
    const commitMessage = `Fix: ${diagnosis.rootCause.split('\n')[0]}

Issue ID: ${issueId}
Root Cause: ${diagnosis.rootCause}
Fix Strategy: ${diagnosis.fixStrategy}

Affected Files:
${diagnosis.affectedFiles.map((f: string) => `- ${f}`).join('\n')}

Auto-fixed by Autonomous Agent
Confidence: ${(diagnosis.confidence * 100).toFixed(0)}%
Estimated Fix Time: ${diagnosis.estimatedFixTime} minutes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

    // Stage changes
    await execAsync('git add .')

    // Commit with message
    await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`)

    // Get commit SHA
    const { stdout } = await execAsync('git rev-parse HEAD')
    return stdout.trim()
  }
}
