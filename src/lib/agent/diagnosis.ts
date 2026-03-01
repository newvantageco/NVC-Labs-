import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs/promises'
import path from 'path'

/**
 * Diagnosis Agent - Analyzes errors and determines root cause using Claude AI
 */

export interface DiagnosisResult {
  issueId: string
  rootCause: string
  affectedFiles: string[]
  affectedLines: number[]
  fixStrategy: string
  confidence: number
  estimatedFixTime: number
  requiresHumanApproval: boolean
}

export class DiagnosisAgent {
  private anthropic: Anthropic

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required for diagnosis agent')
    }
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  /**
   * Diagnose an issue using Claude AI
   */
  async diagnose(issueId: string): Promise<DiagnosisResult> {
    const supabase = await createClient()

    // Get issue details
    const { data: issue, error: issueError } = await supabase
      .from('agent_issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (issueError || !issue) {
      throw new Error(`Issue ${issueId} not found`)
    }

    // Log diagnosis action start
    const { data: action } = await supabase
      .from('agent_actions')
      .insert({
        issue_id: issueId,
        action_type: 'diagnose',
        status: 'started',
      })
      .select('id')
      .single()

    try {
      // Step 1: Analyze error message and stack trace
      const analysis = await this.analyzeError(issue)

      // Step 2: Search codebase for relevant files
      const relevantFiles = await this.findRelevantFiles(analysis)

      // Step 3: Read relevant code
      const codeContext = await this.readCodeContext(relevantFiles)

      // Step 4: Use Claude to determine root cause
      const diagnosis = await this.performAIDiagnosis(issue, analysis, codeContext)

      // Log diagnosis completion
      await supabase
        .from('agent_actions')
        .update({
          status: 'completed',
          details: { diagnosis },
          completed_at: new Date().toISOString(),
        })
        .eq('id', action!.id)

      // Update issue with diagnosis
      await supabase
        .from('agent_issues')
        .update({
          status: 'fixing',
          root_cause: diagnosis.rootCause,
          fix_strategy: diagnosis.fixStrategy,
        })
        .eq('id', issueId)

      return {
        issueId,
        ...diagnosis,
      }
    } catch (error: any) {
      // Log diagnosis failure
      await supabase
        .from('agent_actions')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', action!.id)

      throw error
    }
  }

  /**
   * Analyze error message and extract key information
   */
  private async analyzeError(issue: any): Promise<any> {
    const prompt = `Analyze this error and extract key information:

Error Type: ${issue.issue_type}
Severity: ${issue.severity}
Message: ${issue.message}
${issue.stack_trace ? `Stack Trace:\n${issue.stack_trace}` : ''}
Context: ${JSON.stringify(issue.context, null, 2)}

Provide:
1. What type of error is this? (syntax, runtime, logic, database, API, etc.)
2. What component is likely affected? (frontend, backend API, database, external API)
3. What file(s) might contain the bug?
4. What function or line number (if available from stack trace)?
5. Is this a critical production issue or minor bug?

Respond in JSON format.`

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text)
      } catch {
        return { analysis: content.text }
      }
    }

    return {}
  }

  /**
   * Find relevant files based on error analysis
   */
  private async findRelevantFiles(analysis: any): Promise<string[]> {
    const files: string[] = []
    const projectRoot = process.cwd()

    // Extract file paths from stack trace or error message
    if (analysis.files) {
      files.push(...analysis.files)
    }

    // Common patterns to search
    const searchPatterns = [
      'src/app/api/**/*.ts',
      'src/lib/**/*.ts',
      'src/components/**/*.tsx',
    ]

    // For now, return likely candidate files based on error type
    // In production, implement full glob search
    return files
  }

  /**
   * Read code from relevant files
   */
  private async readCodeContext(files: string[]): Promise<Record<string, string>> {
    const context: Record<string, string> = {}

    for (const file of files) {
      try {
        const fullPath = path.join(process.cwd(), file)
        const content = await fs.readFile(fullPath, 'utf-8')
        context[file] = content
      } catch (error) {
        console.error(`Error reading file ${file}:`, error)
      }
    }

    return context
  }

  /**
   * Use Claude AI to perform detailed diagnosis
   */
  private async performAIDiagnosis(
    issue: any,
    analysis: any,
    codeContext: Record<string, string>
  ): Promise<any> {
    const codeFiles = Object.entries(codeContext)
      .map(([file, content]) => `File: ${file}\n\`\`\`typescript\n${content}\n\`\`\``)
      .join('\n\n')

    const prompt = `You are an expert software engineer debugging a production issue.

**Issue Details:**
- Type: ${issue.issue_type}
- Severity: ${issue.severity}
- Message: ${issue.message}
- Affected Users: ${issue.affected_users}
- Frequency: ${issue.error_frequency} occurrences

${issue.stack_trace ? `**Stack Trace:**\n${issue.stack_trace}` : ''}

**Context:**
${JSON.stringify(issue.context, null, 2)}

**Initial Analysis:**
${JSON.stringify(analysis, null, 2)}

**Relevant Code:**
${codeFiles || 'No code files available for analysis.'}

**Your Task:**
1. Identify the ROOT CAUSE of this issue
2. Explain WHY it's happening
3. Propose a SPECIFIC fix strategy
4. Estimate confidence level (0-1)
5. Estimate fix time in minutes
6. Determine if human approval is required (true for P0/P1 or complex changes)

**Requirements:**
- Be specific about which file(s) need changes
- Identify exact line numbers if possible
- Explain the fix in detail
- Consider edge cases and potential side effects

Respond in JSON format:
{
  "rootCause": "Detailed explanation of root cause",
  "affectedFiles": ["src/app/api/example/route.ts"],
  "affectedLines": [42, 43],
  "fixStrategy": "Detailed step-by-step fix strategy",
  "confidence": 0.95,
  "estimatedFixTime": 5,
  "requiresHumanApproval": false
}`

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text)
      } catch {
        // If not JSON, extract structured data from text
        return {
          rootCause: content.text,
          affectedFiles: [],
          affectedLines: [],
          fixStrategy: 'Manual review required',
          confidence: 0.5,
          estimatedFixTime: 30,
          requiresHumanApproval: true,
        }
      }
    }

    throw new Error('Failed to get diagnosis from Claude')
  }
}
