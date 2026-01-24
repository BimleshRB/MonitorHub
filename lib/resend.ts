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
