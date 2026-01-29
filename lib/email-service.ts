/**
 * Email Alert Service
 * Sends welcome, downtime, and recovery emails with HTML templates
 */

import nodemailer from 'nodemailer'
import { setAlertCooldown, isAlertInCooldown } from './redis'

const {
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env

let transporter: any = null

/**
 * Initialize email transporter
 */
function getEmailTransporter() {
  if (transporter) return transporter

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('Email not configured. Alert emails will not be sent.')
    return null
  }

  try {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT),
      secure: EMAIL_PORT === '465',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })

    console.log('Email transporter initialized')
  } catch (error) {
    console.error('Failed to initialize email transporter:', error)
    return null
  }

  return transporter
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const transporter = getEmailTransporter()
  if (!transporter) return false

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0;">Welcome to MonitorHub</h1>
        </div>
        <div style="padding: 40px; background: #f9f9f9;">
          <p>Hi ${escapeHtml(userName)},</p>
          <p>Welcome to <strong>MonitorHub</strong>, your AI-powered website health monitoring platform!</p>
          
          <p>You're now all set to:</p>
          <ul>
            <li>Monitor your website's uptime 24/7</li>
            <li>Get instant alerts when issues are detected</li>
            <li>Receive AI-powered incident analysis and fixes</li>
            <li>Track performance metrics and trends</li>
          </ul>

          <p>
            <a href="${process.env.NEXTAUTH_URL || 'https://monitorhub.local'}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>

          <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            Questions? Check our <a href="#">help documentation</a> or contact support.
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail(userEmail, 'Welcome to MonitorHub', html, 2)
}

/**
 * Send downtime alert email
 */
export async function sendDowntimeAlert(
  userEmail: string,
  userName: string,
  monitorName: string,
  monitorUrl: string,
  statusCode?: number | null,
  responseTime?: number | null,
  errorMessage?: string
): Promise<boolean> {
  // Check cooldown to prevent alert spam
  const monitorId = monitorName // Simple approach, could be improved
  if (await isAlertInCooldown(monitorId)) {
    console.log(`Alert in cooldown for ${monitorName}`)
    return false
  }

  const transporter = getEmailTransporter()
  if (!transporter) return false

  const statusInfo = statusCode
    ? `Status Code: ${statusCode}`
    : `Error: ${errorMessage || 'Unknown'}`

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0;">⚠️ Downtime Alert</h1>
        </div>
        <div style="padding: 40px; background: #f9f9f9;">
          <p>Hi ${escapeHtml(userName)},</p>
          <p style="font-size: 16px; color: #f5576c;"><strong>Your website is down!</strong></p>
          
          <div style="background: white; border-left: 4px solid #f5576c; padding: 20px; margin: 20px 0;">
            <p><strong>Monitor:</strong> ${escapeHtml(monitorName)}</p>
            <p><strong>URL:</strong> ${escapeHtml(monitorUrl)}</p>
            <p><strong>Status:</strong> ${statusInfo}</p>
            ${responseTime ? `<p><strong>Response Time:</strong> ${responseTime}ms</p>` : ''}
            <p><strong>Detected:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="background: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">
            <strong>⏱️ Action Required:</strong><br>
            Check your server status immediately. An automated recovery alert will be sent when the service is back online.
          </p>

          <p>
            <a href="${process.env.NEXTAUTH_URL || 'https://monitorhub.local'}/dashboard/incidents" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Incident Details
            </a>
          </p>

          <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            This is an automated alert. You will receive one reminder per monitor within 15 minutes.
          </p>
        </div>
      </body>
    </html>
  `

  const success = await sendEmail(userEmail, `⚠️ Downtime Alert: ${monitorName}`, html, 2)

  if (success) {
    await setAlertCooldown(monitorId)
  }

  return success
}

/**
 * Send recovery email
 */
export async function sendRecoveryAlert(
  userEmail: string,
  userName: string,
  monitorName: string,
  monitorUrl: string,
  downtimeSeconds: number
): Promise<boolean> {
  const transporter = getEmailTransporter()
  if (!transporter) return false

  const duration = formatDuration(downtimeSeconds)

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0;">✅ Service Recovered</h1>
        </div>
        <div style="padding: 40px; background: #f9f9f9;">
          <p>Hi ${escapeHtml(userName)},</p>
          <p style="font-size: 16px; color: #28a745;"><strong>Your website is back online!</strong></p>
          
          <div style="background: white; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
            <p><strong>Monitor:</strong> ${escapeHtml(monitorName)}</p>
            <p><strong>URL:</strong> ${escapeHtml(monitorUrl)}</p>
            <p><strong>Status:</strong> ✓ Online</p>
            <p><strong>Downtime Duration:</strong> ${duration}</p>
            <p><strong>Recovered:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="background: #d4edda; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745;">
            <strong>✨ Great news:</strong> Your service recovered successfully. Monitoring will continue as normal.
          </p>

          <p>
            <a href="${process.env.NEXTAUTH_URL || 'https://monitorhub.local'}/dashboard/incidents" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Incident Report
            </a>
          </p>

          <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            Automated monitoring by MonitorHub
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail(userEmail, `✅ Service Recovered: ${monitorName}`, html, 2)
}

/**
 * Send email with retry logic
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  maxRetries: number = 2
): Promise<boolean> {
  const transporter = getEmailTransporter()
  if (!transporter) return false

  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM || EMAIL_USER,
        to,
        subject,
        html,
      })

      console.log(`Email sent to ${to}: ${subject}`)
      return true
    } catch (error) {
      lastError = error
      console.error(`Email send attempt ${attempt} failed:`, error)

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  console.error(`Failed to send email to ${to} after ${maxRetries} retries:`, lastError)
  return false
}

/**
 * Format duration in seconds to human-readable format
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char])
}
