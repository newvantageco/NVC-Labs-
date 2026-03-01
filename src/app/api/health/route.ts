import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Health check endpoint
 * Used by monitoring systems and autonomous agent
 */
export async function GET() {
  const startTime = Date.now()
  const checks = {
    database: { status: 'unknown', responseTime: 0, error: null },
    api: { status: 'healthy', responseTime: 0 },
    memory: { status: 'unknown', usage: 0 },
  }

  try {
    // Check database connection
    const dbStart = Date.now()
    const supabase = await createClient()

    const { error } = await supabase
      .from('practices')
      .select('id')
      .limit(1)

    const dbTime = Date.now() - dbStart
    checks.database.responseTime = dbTime

    if (error) {
      checks.database.status = 'unhealthy'
      checks.database.error = error.message
    } else if (dbTime > 1000) {
      checks.database.status = 'degraded'
    } else {
      checks.database.status = 'healthy'
    }

    // Check memory usage (if available)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024
      checks.memory.usage = Math.round(heapUsedMB)

      if (heapUsedMB > 400) {
        checks.memory.status = 'degraded'
      } else {
        checks.memory.status = 'healthy'
      }
    }

    const totalTime = Date.now() - startTime
    checks.api.responseTime = totalTime

    // Determine overall status
    const allChecks = Object.values(checks)
    const overallStatus = allChecks.every((c) => c.status === 'healthy')
      ? 'healthy'
      : allChecks.some((c) => c.status === 'unhealthy')
      ? 'unhealthy'
      : 'degraded'

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks,
        responseTime: totalTime,
      },
      {
        status: overallStatus === 'unhealthy' ? 503 : 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks,
      },
      { status: 503 }
    )
  }
}
