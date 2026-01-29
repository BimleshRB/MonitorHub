/**
 * Structured Logger
 * Provides consistent, secure logging across the application
 * Never logs sensitive data (passwords, tokens, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
  error?: {
    message: string
    stack?: string
  }
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  /**
   * Format log entry as structured JSON
   */
  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry, null, this.isDev ? 2 : undefined)
  }

  /**
   * Sanitize data to remove sensitive fields
   */
  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sensitiveFields = [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'apiSecret',
      'creditCard',
      'ssn',
    ]

    const sanitized = Array.isArray(data) ? [...data] : { ...data }

    const redact = (obj: any) => {
      for (const key in obj) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '[REDACTED]'
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          redact(obj[key])
        }
      }
    }

    redact(sanitized)
    return sanitized
  }

  /**
   * Log at debug level
   */
  debug(message: string, data?: any, context?: string): void {
    if (!this.isDev) return

    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        context,
        data: this.sanitize(data),
      })
    )
  }

  /**
   * Log at info level
   */
  info(message: string, data?: any, context?: string): void {
    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        context,
        data: this.sanitize(data),
      })
    )
  }

  /**
   * Log at warn level
   */
  warn(message: string, data?: any, context?: string): void {
    console.warn(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        context,
        data: this.sanitize(data),
      })
    )
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error | any, context?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
    }

    if (error instanceof Error) {
      entry.error = {
        message: error.message,
        stack: this.isDev ? error.stack : undefined,
      }
    } else if (error) {
      entry.data = this.sanitize(error)
    }

    console.error(this.formatLog(entry))
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, statusCode?: number, duration?: number): void {
    this.info(`${method} ${path}`, {
      statusCode,
      durationMs: duration,
    })
  }

  /**
   * Log cron job execution
   */
  logCronJob(jobName: string, success: boolean, duration?: number, details?: any): void {
    this.info(`Cron: ${jobName}`, {
      success,
      durationMs: duration,
      ...details,
    })
  }
}

export const logger = new Logger()
