import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.warn('SMTP credentials not fully configured. Email alerts disabled.')
}

const transporter = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null

export async function sendIncidentEmail(params: {
  to: string
  subject: string
  html: string
}) {
  if (!transporter) {
    console.warn('SMTP not configured, skipping email')
    return
  }

  try {
    const result = await transporter.sendMail({
      from: SMTP_FROM || `"Uptime Monitor" <${SMTP_USER}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })

    return result
  } catch (error) {
    console.error('SMTP email error', error)
    throw error
  }
}

export async function sendWelcomeEmail(params: {
  to: string
  name: string
}) {
  if (!transporter) {
    console.warn('SMTP not configured, skipping welcome email')
    return
  }

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
            .content h2 { color: #667eea; margin-top: 0; }
            .features { margin: 20px 0; }
            .feature { margin: 15px 0; padding-left: 20px; border-left: 3px solid #667eea; }
            .feature strong { color: #667eea; }
            .cta { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to MonitorHub!</h1>
            </div>
            <div class="content">
              <h2>Hi ${params.name},</h2>
              <p>Thank you for signing up! We're excited to have you on board.</p>
              
              <p>MonitorHub is your AI-powered website health monitoring solution. Here's what you can do:</p>
              
              <div class="features">
                <div class="feature">
                  <strong>🔍 Monitor Websites</strong> - Add unlimited websites to monitor 24/7 in real-time
                </div>
                <div class="feature">
                  <strong>🤖 AI Insights</strong> - Get intelligent analysis of incidents with our AI engine
                </div>
                <div class="feature">
                  <strong>📧 Instant Alerts</strong> - Receive immediate notifications when something goes wrong
                </div>
                <div class="feature">
                  <strong>📊 Detailed Reports</strong> - View comprehensive uptime and performance reports
                </div>
              </div>

              <p><strong>Getting Started:</strong></p>
              <ol>
                <li>Log in to your dashboard</li>
                <li>Add your first website to monitor</li>
                <li>Configure alert preferences</li>
                <li>Sit back and let MonitorHub do the work!</li>
              </ol>

              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://monitorhub.com'}/dashboard" class="cta">Go to Dashboard</a>
              </p>

              <p>If you have any questions or need support, feel free to reach out. We're here to help!</p>
              
              <p>Happy monitoring!<br><strong>The MonitorHub Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 MonitorHub. All rights reserved.</p>
              <p>You received this email because you signed up for MonitorHub.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await transporter.sendMail({
      from: SMTP_FROM || `"MonitorHub" <${SMTP_USER}>`,
      to: params.to,
      subject: `Welcome to MonitorHub, ${params.name}!`,
      html,
    })

    return result
  } catch (error) {
    console.error('Welcome email error', error)
    throw error
  }
}
