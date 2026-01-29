/**
 * Monitor Health Check Engine
 * Performs HTTP health checks on URLs with proper error handling,
 * timeout management, and performance metrics.
 */

export interface HealthCheckResult {
  isUp: boolean
  statusCode?: number
  responseTime: number
  errorMessage?: string
  status: 'UP' | 'DOWN' | 'SLOW'
}

const HTTP_TIMEOUT_MS = 5000 // 5 second timeout
const SLOW_THRESHOLD_MS = 3000 // 3 second threshold for SLOW status

export async function checkMonitorHealth(url: string): Promise<HealthCheckResult> {
  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS)

  try {
    // Validate URL
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol. Must be http or https.')
    }

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'MonitorHub/1.0 (+https://monitorhub.local)',
      },
    })

    const responseTime = Date.now() - startTime

    // Determine status based on response time and status code
    let status: 'UP' | 'DOWN' | 'SLOW' = 'UP'
    if (responseTime > SLOW_THRESHOLD_MS) {
      status = 'SLOW'
    }
    if (!response.ok) {
      status = 'DOWN'
    }

    return {
      isUp: response.ok,
      statusCode: response.status,
      responseTime,
      status,
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    let errorMessage = 'Unknown error'

    if (error.name === 'AbortError') {
      errorMessage = `Timeout after ${HTTP_TIMEOUT_MS}ms`
    } else if (error instanceof TypeError) {
      errorMessage = 'Network error or invalid URL'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      isUp: false,
      responseTime,
      errorMessage,
      status: 'DOWN',
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Batch health check for multiple monitors
 * Processes in parallel using Promise.allSettled for resilience
 */
export async function batchHealthCheck(
  monitors: Array<{ id: string; url: string }>,
  batchSize = 20
): Promise<Map<string, HealthCheckResult>> {
  const results = new Map<string, HealthCheckResult>()

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < monitors.length; i += batchSize) {
    const batch = monitors.slice(i, i + batchSize)
    const batchPromises = batch.map(({ id, url }) =>
      Promise.allSettled([
        checkMonitorHealth(url).then((result) => ({ id, result })),
      ])
    )

    const batchResults = await Promise.all(batchPromises)

    batchResults.forEach((settled) => {
      if (settled[0]?.status === 'fulfilled' && settled[0]?.value) {
        const { id, result } = settled[0].value
        results.set(id, result)
      }
    })
  }

  return results
}
